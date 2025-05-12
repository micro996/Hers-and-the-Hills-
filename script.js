import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  document.querySelector(".dark-toggle").textContent = isDark ? "☀️" : "🌙";
}
window.toggleDarkMode = toggleDarkMode;

async function loadPosts() {
  const postList = document.getElementById("post-list");
  if (!postList) return;

  const q = query(collection(db, "posts"), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const { title, content, imageUrl } = doc.data();
    const article = document.createElement("article");
    article.classList.add("post-preview");
    article.innerHTML = `
  <div class="post-text">
    <p class="large-text"><strong>${title}</strong></p>
    <div class="large-text">${content}</div>
  </div>
  ${imageUrl
    ? `<div class="post-img"><img src="${imageUrl}" alt="${title}" /></div>`
    : ""
  }
`;

    const dynamicSection = document.getElementById('dynamic-posts');
    if (dynamicSection) {
      dynamicSection.appendChild(article);
    }
    
  });
}
async function init() {
  document.addEventListener("DOMContentLoaded", () => {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.body.classList.add("dark-mode");
    document.querySelector(".dark-toggle").textContent = isDark ? "☀️" : "🌙";

    loadPosts();

    const menuToggle = document.getElementById("menuToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (menuToggle && dropdownMenu) {
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", (e) => {
        if (
          !dropdownMenu.contains(e.target) &&
          !menuToggle.contains(e.target)
        ) {
          dropdownMenu.style.display = "none";
        }
      });
    }
  });
}

init();
