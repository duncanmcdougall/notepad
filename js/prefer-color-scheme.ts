let theme = localStorage.getItem("theme");
if (!theme) {
  theme = window.matchMedia("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
}

const themeToggle = document.getElementById("themeToggle") as HTMLInputElement;
if (theme === "light") {
  themeToggle.checked = false;
  document.body.setAttribute("data-theme", "light");
}

themeToggle?.addEventListener("change", (e) => {
  theme = e.target.checked ? "dark" : "light";
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

(document.querySelector(".theme-toggle") as HTMLElement).style.display = "block";
