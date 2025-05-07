// Toggle dark mode and store preference
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  document.querySelector(".dark-toggle").textContent = isDark ? "☀️" : "🌙";
}

// Initialize theme and other logic
window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
  }
  document.querySelector(".dark-toggle").textContent = isDark ? "☀️" : "🌙";
});

// ✅ EmailJS send form handling

// Initialize EmailJS with your public key
(function () {
    emailjs.init("OQLhFesJQWC7b5RkP");      // Replace with your EmailJS public key
})();

// Wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    // Send the form using EmailJS
    emailjs.sendForm("service_vrpfqsl", "template_nsuwmh2", form)
      .then(() => {
        alert("✅ Message sent successfully!");
        form.reset(); // Clear form
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        alert("❌ Failed to send message. Please try again.");
      });
  });
});
