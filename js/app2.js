// ------- Helpers -------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { t.hidden = true; }, 1200);
}

// ------- Theme -------
function initTheme() {
  const btn = $("#themeBtn");
  if (!btn) return;

  const icon = btn.querySelector(".iconbtn__icon");
  if (!icon) return;

  const saved = localStorage.getItem("theme");
  if (saved === "light") document.documentElement.dataset.theme = "light";

  function syncIcon() {
    const isLight = document.documentElement.dataset.theme === "light";
    icon.textContent = isLight ? "☀" : "☾";
  }
  syncIcon();

  btn.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.dataset.theme = "light";
      localStorage.setItem("theme", "light");
    }
    syncIcon();
  });
}

// ------- Mobile menu -------
function initMobileMenu() {
  const btn = $("#menuBtn");
  const menu = $("#mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = !menu.hidden;
    menu.hidden = open;
    btn.setAttribute("aria-expanded", String(!menu.hidden));
  });

  $$(".mobile__link", menu).forEach(a => {
    a.addEventListener("click", () => {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

// ------- Active nav highlight -------
function initActiveNav() {
  const links = $$(".nav__link");
  const sections = links
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = `#${e.target.id}`;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });

  sections.forEach(s => obs.observe(s));
}

// ------- Scroll progress -------
function initProgress() {
  const bar = $("#progressBar");
  if (!bar) return;

  function onScroll() {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ------- Data: your projects (ONE list only) -------
const PROJECTS = [
  {
    id: "filmrec",
    title: "Film Recommendation Web App",
    subtitle: "Streamlit + ML recommender demo",
    description: "Movie recommendation app using ML + a clean UI, deployed online.",
    tags: ["ml", "streamlit", "data"],
    stack: ["Python", "Streamlit", "ML", "Pandas"],
    highlights: [
      "Built recommendation logic and interactive UI.",
      "Deployed as a public demo; optimized UX for exploration."
    ],
    live: "https://film-recommendation-ml-app.streamlit.app/",
    github: "https://github.com/kunratha/film_recommendation_ML_Streamlit"
  },
  {
    id: "bicycle",
    title: "Bicycle Market Analytics Dashboard",
    subtitle: "Streamlit dashboard for market insights",
    description: "Market analysis dashboard with KPIs, segmentation and interactive charts.",
    tags: ["streamlit", "data"],
    stack: ["Python", "Streamlit", "Plotly", "Pandas"],
    highlights: [
      "Designed KPI dashboard and visual narrative.",
      "Structured data processing and clean charts."
    ],
    live: "https://bicycle-market-study-dashboard.streamlit.app/",
    github: "https://github.com/kunratha/bicycle_market_study_streamlit"
  },
  {
    id: "breastcancer",
    title: "Breast Cancer Prediction (Django + ML)",
    subtitle: "Full-stack ML inference with Django",
    description: "Django web app that predicts malignant vs benign using a trained ML model (SVM).",
    tags: ["django", "ml"],
    stack: ["Python", "Django", "SVM", "HTML/CSS"],
    highlights: [
      "Integrated trained model with Django views and forms.",
      "Clear UX + deploy-ready structure."
    ],
    live: "#",
    github: "https://github.com/kunratha/breast_cancer_prediction_ML_Django"
  }
];

// ------- Projects rendering + filters + search -------
let currentFilter = "all";
let currentQuery = "";

function matches(project) {
  const byFilter = currentFilter === "all" || project.tags.includes(currentFilter);
  const q = currentQuery.trim().toLowerCase();
  if (!q) return byFilter;

  const text = [
    project.title,
    project.subtitle,
    project.description,
    project.tags.join(" "),
    project.stack.join(" ")
  ].join(" ").toLowerCase();

  return byFilter && text.includes(q);
}

function renderProjects(list = PROJECTS.filter(matches)) {
  const grid = $("#projectsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card project";
    empty.style.gridColumn = "1 / -1";
    empty.innerHTML = `
      <div class="project__top">
        <div>
          <div class="project__title">No results</div>
          <p class="project__desc">Try another filter or keyword.</p>
        </div>
        <span class="badge">0</span>
      </div>
    `;
    grid.appendChild(empty);
    return;
  }

  for (const p of list) {
    const el = document.createElement("article");
    el.className = "card project";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Open ${p.title}`);
    el.dataset.id = p.id;

    el.innerHTML = `
      <div class="project__top">
        <div>
          <div class="badge">${escapeHtml(p.subtitle)}</div>
          <div class="project__title">${escapeHtml(p.title)}</div>
        </div>
        <span class="badge">${escapeHtml(p.tags[0] || "project")}</span>
      </div>

      <p class="project__desc">${escapeHtml(p.description)}</p>

      <div class="project__meta">
        <div class="tags">
          ${p.tags.slice(0, 3).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
        </div>
        <span>Open →</span>
      </div>
    `;

    el.addEventListener("click", () => openModal(p.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(p.id);
    });

    grid.appendChild(el);
  }
}

function initProjectControls() {
  const chips = $$(".chip");
  const input = $("#projectSearch");
  const clear = $("#clearProjectSearch");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-selected", "true");
      currentFilter = chip.dataset.filter;
      renderProjects();
    });
  });

  if (input) {
    input.addEventListener("input", () => {
      currentQuery = input.value;
      renderProjects();
    });
  }

  if (clear && input) {
    clear.addEventListener("click", () => {
      input.value = "";
      currentQuery = "";
      renderProjects();
      input.focus();
    });
  }
}

// ------- Modal -------
let lastFocus = null;

function openModal(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  const modal = $("#modal");
  if (!modal) return;

  lastFocus = document.activeElement;

  $("#modalBadge").textContent = p.tags.map(t => `#${t}`).join(" ");
  $("#modalTitle").textContent = p.title;
  $("#modalSubtitle").textContent = p.subtitle;

  $("#modalBody").innerHTML = `
    <p>${escapeHtml(p.description)}</p>
    <div class="divider"></div>

    <h4 class="modal-section-title">Tech stack</h4>
    <p class="muted modal-stack">${escapeHtml(p.stack.join(" · "))}</p>

    <h4 class="modal-section-title">Highlights</h4>
    <ul class="list modal-highlights">
      ${p.highlights.map(h => `<li><strong class="highlight-strong">${escapeHtml(h)}</strong></li>`).join("")}
    </ul>
  `;

  $("#modalLive").href = p.live || "#";
  $("#modalGit").href = p.github || "#";

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector('button[data-close]')?.focus?.();
}

function closeModal() {
  const modal = $("#modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  lastFocus?.focus?.();
}

function initModal() {
  const modal = $("#modal");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset.close !== undefined) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

// ------- Skills animation -------
function initSkills() {
  const skills = $$(".skill");
  if (!skills.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const node = e.target;
      const pct = Number(node.dataset.skill || 0);
      const fill = $(".skill__fill", node);
      if (fill) fill.style.width = `${pct}%`;
      obs.unobserve(node);
    });
  }, { threshold: 0.25 });

  skills.forEach(s => obs.observe(s));
}

// ------- Copy email -------
function initCopyEmail() {
  const btn = $("#copyEmail");
  const emailNode = $("#emailText");
  if (!btn || !emailNode) return;

  const email = emailNode.textContent.trim();

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast("Email copied ✓");
    } catch {
      // fallback for older browsers / file:// issues
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Email copied ✓");
    }
  });
}

// ------- CV -------
function initCv() {
  const a = $("#downloadCv");
  if (!a) return;

  // If your href points to a real PDF, you can REMOVE this block.
  // a.addEventListener("click", (e) => { e.preventDefault(); ... });
}

// ------- Boot -------
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = String(new Date().getFullYear());

  // initTheme();
  initMobileMenu();
  initActiveNav();
  initProgress();

  initProjectControls();
  initModal();
  initSkills();
  initCopyEmail();
  initCv();

  renderProjects();
});