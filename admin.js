import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const CLOUD_NAME = "dkexmrarr";
const UPLOAD_PRESET = "Blog_uploads";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Toast helper
function showToast(message, duration = 5000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Initialize Quill
let quill;
document.addEventListener("DOMContentLoaded", () => {
  quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ]
    }
  });
  
});

// Auth protect
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    loadManagePosts();
  }
});

const form = document.getElementById('postForm');
let isEditing = false;
let editingId = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const content = quill.root.innerHTML.trim();
  document.getElementById('content').value = content;
  const imageFile = document.getElementById('image').files[0];
  let imageUrl = "";

  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      imageUrl = data.secure_url;
    }

    if (isEditing && editingId) {
      const updateData = { title, content, updatedAt: serverTimestamp() };
      if (imageUrl) updateData.imageUrl = imageUrl;

      await updateDoc(doc(db, "posts", editingId), updateData);
      showToast("✅ Post updated!");
    } else {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageUrl,
        createdAt: serverTimestamp()
      });
      showToast("✅ Post published!");
    }

    form.reset();
    quill.setContents([]);
    document.getElementById('preview').style.display = "none";
    isEditing = false;
    editingId = null;
    document.getElementById("submitBtn").textContent = "Publish Post";
    loadManagePosts();
  } catch (err) {
    console.error("Error:", err);
    showToast("❌ Failed to publish post.");
  }
});

async function loadManagePosts() {
  const container = document.getElementById("manage-posts");
  container.innerHTML = "<p>Loading...</p>";

  const q = query(collection(db, "posts"), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "manage-post";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <div>${data.content}</div>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:100%; margin-top:10px;">` : ""}
      <br>
      <button onclick="editPost('${docSnap.id}', \`${data.title}\`, \`${data.content.replace(/`/g, '\\`')}\`, \`${data.imageUrl || ''}\`)">✏️ Edit</button>
      <button onclick="deletePost('${docSnap.id}')">🗑 Delete</button>
    `;
    container.appendChild(div);
  });
}

window.editPost = (id, title, content, imageUrl = "") => {
  document.getElementById('title').value = title;
  quill.root.innerHTML = content;
  isEditing = true;
  editingId = id;
  document.getElementById('submitBtn').textContent = "✅ Update Post";
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePost = async (id) => {
  if (confirm("Are you sure you want to delete this post?")) {
    await deleteDoc(doc(db, "posts", id));
    showToast("✅ Post deleted.");
    loadManagePosts();
  }
};

window.backToBlog = () => {
  window.location.href = "index.html";
};
