(function(){
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");

  function apply(theme){
    root.setAttribute("data-theme", theme);
    if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    localStorage.setItem("mcsm_theme", theme);
  }

  const saved = localStorage.getItem("mcsm_theme");
  if (saved === "light" || saved === "dark") apply(saved);

  if (btn){
    btn.addEventListener("click", () => {
      const now = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(now);
    });
  }
})();