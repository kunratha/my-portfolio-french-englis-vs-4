document.addEventListener("DOMContentLoaded", () => {

  const savedLang = localStorage.getItem("lang");

  const path = location.pathname.toLowerCase();

  // Detect if page is FR or EN
  const isFR = path.includes("-fr.html");
  const isEN = !isFR;

  // -------- 1️⃣ Auto redirect if needed --------
  if (savedLang) {

    if (savedLang === "fr" && isEN) {
      const newPath = path.replace(".html", "-fr.html");
      location.replace(newPath);
      return;
    }

    if (savedLang === "en" && isFR) {
      const newPath = path.replace("-fr.html", ".html");
      location.replace(newPath);
      return;
    }
  }

  // -------- 2️⃣ Save language when clicking switch --------
  document.querySelectorAll(".lang-link").forEach(link => {
    link.addEventListener("click", () => {
      const lang = link.getAttribute("lang");
      localStorage.setItem("lang", lang);
    });
  });

});


document.addEventListener("DOMContentLoaded", () => {
  // 1) Mark active language button based on current page
  setActiveLangButton();

  // 2) Save language when clicking any link
  document.querySelectorAll(".lang-link").forEach(link => {
    link.addEventListener("click", () => {
      localStorage.setItem("lang", link.getAttribute("lang"));
    });
  });

  // 3) Redirect to correct version if user opens wrong language page
  redirectToSavedLang();
});

function redirectToSavedLang() {
  const saved = localStorage.getItem("lang");
  if (!saved) return;

  const path = location.pathname.toLowerCase();
  const isFR = path.includes("-fr.html");
  const isEN = !isFR;

  if (saved === "fr" && isEN) {
    location.replace(path.replace(".html", "-fr.html"));
    return;
  }

  if (saved === "en" && isFR) {
    location.replace(path.replace("-fr.html", ".html"));
    return;
  }
}

function setActiveLangButton() {
  const path = location.pathname.toLowerCase();
  const isFR = path.includes("-fr.html");

  const en = document.querySelector('.lang-link[lang="en"]');
  const fr = document.querySelector('.lang-link[lang="fr"]');

  if (!en || !fr) return;

  en.classList.toggle("active", !isFR);
  fr.classList.toggle("active", isFR);
}