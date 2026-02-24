/* js/lang.js
   EN pages:  index.html, portfolio.html, contact.html ...
   FR pages:  index-fr.html, portfolio-fr.html, contact-fr.html ...
   No -en.html is ever used.
*/

(() => {
  // ----- config -----
  const LS_KEY = "lang"; // localStorage key
  const GUARD_KEY = "lang_redirect_guard"; // session guard per tab

  // ----- helpers -----
  function getSavedLang() {
    const v = localStorage.getItem(LS_KEY);
    return v === "fr" || v === "en" ? v : null;
  }

  function isFileProtocol() {
    return location.protocol === "file:";
  }

  function normalizePath(pathname) {
    // Keep "/" as "/", do NOT convert to "/index.html" to avoid ping-pong
    return pathname || "/";
  }

  function isFrenchPage(pathname) {
    return pathname.toLowerCase().endsWith("-fr.html");
  }

  function isHtmlPage(pathname) {
    return pathname.toLowerCase().endsWith(".html");
  }

  function toFrench(pathname) {
    // "/portfolio.html" -> "/portfolio-fr.html"
    return pathname.replace(/\.html$/i, "-fr.html");
  }

  function toEnglish(pathname) {
    // "/portfolio-fr.html" -> "/portfolio.html"
    return pathname.replace(/-fr\.html$/i, ".html");
  }

  function setActiveLangButton() {
    const path = normalizePath(location.pathname);
    const isFR = isFrenchPage(path);

    const en = document.querySelector('.lang-link[lang="en"]');
    const fr = document.querySelector('.lang-link[lang="fr"]');
    if (!en || !fr) return;

    // Treat "/" as EN
    const isRoot = path === "/";
    en.classList.toggle("active", isRoot || !isFR);
    fr.classList.toggle("active", !isRoot && isFR);
  }

  function bindLangLinks() {
    document.querySelectorAll(".lang-link").forEach((link) => {
      link.addEventListener("click", () => {
        const lang = link.getAttribute("lang");
        if (lang === "en" || lang === "fr") {
          localStorage.setItem(LS_KEY, lang);
        }
      });
    });
  }

  async function existsOnServer(urlPath) {
    // For http(s) only. On file://, HEAD/fetch often fails or is restricted.
    if (isFileProtocol()) return false;

    try {
      const res = await fetch(urlPath, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function redirectToSavedLang() {
    const saved = getSavedLang();
    if (!saved) return;

    // Redirect at most once per tab session to prevent loops
    if (sessionStorage.getItem(GUARD_KEY) === "1") return;

    const path = normalizePath(location.pathname);
    const lower = path.toLowerCase();

    const isRoot = path === "/";
    const isFR = isFrenchPage(path);
    const isHTML = isHtmlPage(path);

    // IMPORTANT:
    // - On "/" we only redirect if we can safely do it (http(s)) and the target exists.
    // - On file:// we do NOT auto-redirect (prevents "operation is insecure" and loops).
    if (isRoot) {
      if (isFileProtocol()) return;

      if (saved === "fr") {
        const target = "/index-fr.html";
        if (await existsOnServer(target)) {
          sessionStorage.setItem(GUARD_KEY, "1");
          location.replace(target);
        }
      }
      // saved === "en": stay on "/"
      return;
    }

    // Only handle real .html pages
    if (!isHTML) return;

    let target = null;

    if (saved === "fr" && !isFR) {
      target = toFrench(path);
    } else if (saved === "en" && isFR) {
      target = toEnglish(path);
    }

    if (!target || target === path) return;

    // If on file://, don't auto-redirect (prevents DOMException + loops)
    if (isFileProtocol()) return;

    // Only redirect if the target file exists
    if (await existsOnServer(target)) {
      sessionStorage.setItem(GUARD_KEY, "1");
      location.replace(target);
    }
  }

  // ----- boot -----
  document.addEventListener("DOMContentLoaded", () => {
    bindLangLinks();
    setActiveLangButton();
    redirectToSavedLang();
  });
})();