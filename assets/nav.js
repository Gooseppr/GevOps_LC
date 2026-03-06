(function () {
  const baseUrl = (window.__SITE_BASEURL || window.__GEVOPS_BASEURL || "").replace(/\/$/, "");

  function withBase(path) {
    if (!path) return "#";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith(baseUrl)) return path;
    if (path.startsWith("/")) {
      return (baseUrl || "") + path;
    }
    const normalized = path.startsWith("/") ? path : "/" + path;
    return (baseUrl || "") + normalized;
  }

  // ── Highlight active link ──────────────────────────────────────────────────
  function markActiveLink(nav) {
    const current = window.location.pathname;
    nav.querySelectorAll("a").forEach(function (a) {
      try {
        const href = new URL(a.href).pathname;
        if (href && href !== "/" && current.startsWith(href)) {
          a.classList.add("nav-active");
        }
      } catch (_) {}
    });
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  function createNavShell() {
    const nav = document.createElement("nav");
    nav.id = "course-nav";
    nav.innerHTML = `
      <div class="nav-header">
        <div class="nav-brand">Coursite — Navigation</div>
        <button class="nav-close" aria-label="Fermer la navigation">✕</button>
      </div>
      <div class="nav-scroll">
        <div class="nav-loading">Chargement de la navigation…</div>
      </div>
    `;

    const toggle = document.createElement("button");
    toggle.id = "course-nav-toggle";
    toggle.setAttribute("aria-label", "Ouvrir la navigation");
    toggle.innerHTML = "&#9776; Navigation";

    document.body.appendChild(nav);
    document.body.appendChild(toggle);
    document.body.classList.add("with-course-nav");

    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    nav.querySelector(".nav-close").addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });

    return nav;
  }

  // ── Builders — La Capsule (jour-based) ────────────────────────────────────
  function buildSimpleSection(label, items, formatter) {
    if (!items || !items.length) return null;
    const section = document.createElement("div");
    section.className = "nav-section";
    const title = document.createElement("div");
    title.className = "nav-section-title";
    title.textContent = label;
    section.appendChild(title);
    const list = document.createElement("ul");
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.appendChild(formatter(item));
      list.appendChild(li);
    });
    section.appendChild(list);
    return section;
  }

  // ── Builders — Cours thématiques (theme-based) ────────────────────────────
  function buildThemeDetails(theme) {
    const det = document.createElement("details");
    det.className = "nav-theme";
    const sum = document.createElement("summary");
    sum.textContent = theme.title;
    det.appendChild(sum);
    const list = document.createElement("ul");
    (theme.modules || []).forEach(function (mod) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = withBase(mod.path);
      a.title = mod.title;
      // Affichage compact : "Ch.1 – Titre"
      const chap = mod.chapter ? `Ch.${mod.chapter} – ` : "";
      a.textContent = chap + mod.title;
      if (mod.difficulty) {
        const badge = document.createElement("span");
        badge.className = "nav-difficulty nav-diff-" + mod.difficulty;
        badge.textContent = mod.difficulty[0].toUpperCase(); // B / I / A
        a.appendChild(badge);
      }
      li.appendChild(a);
      list.appendChild(li);
    });
    det.appendChild(list);
    return det;
  }

  function buildCourseSection(course) {
    if (!course || !course.themes || !course.themes.length) return null;

    const section = document.createElement("div");
    section.className = "nav-section nav-course-block";

    // En-tête du cours (lien vers l'index du cours)
    const header = document.createElement("div");
    header.className = "nav-section-title";
    const courseLink = document.createElement("a");
    courseLink.href = withBase(course.index_path || "#");
    courseLink.textContent = course.title;
    courseLink.className = "nav-course-title";
    header.appendChild(courseLink);
    section.appendChild(header);

    // Un <details> par thème
    course.themes.forEach(function (theme) {
      section.appendChild(buildThemeDetails(theme));
    });

    return section;
  }

  // ── Render complet ─────────────────────────────────────────────────────────
  function renderNav(nav, data) {
    const scroll = nav.querySelector(".nav-scroll");
    scroll.innerHTML = "";

    // ── Section 1 : La Capsule DevOps ──────────────────────────────────────
    if (data.modules && data.modules.length) {
      const capsuleHeader = document.createElement("div");
      capsuleHeader.className = "nav-section-title nav-course-label";
      capsuleHeader.textContent = "DevOps — La Capsule";
      scroll.appendChild(capsuleHeader);

      const modulesSection = buildSimpleSection("Modules (ordre global)", data.modules, function (item) {
        const a = document.createElement("a");
        a.href = withBase(item.path);
        const prefix = item.jour ? "Jour " + item.jour : "Jour --";
        const order = typeof item.ordre === "number" ? " / " + String(item.ordre).padStart(2, "0") : "";
        a.textContent = prefix + order + " – " + item.title;
        a.title = item.title;
        return a;
      });
      if (modulesSection) scroll.appendChild(modulesSection);

      const pipeline = buildSimpleSection("Pipeline", data.pipeline, function (item) {
        const a = document.createElement("a");
        a.href = withBase(item.path);
        a.textContent = item.title;
        a.title = item.title;
        return a;
      });
      if (pipeline) scroll.appendChild(pipeline);

      const bonus = buildSimpleSection("Bonus", data.bonus, function (item) {
        const a = document.createElement("a");
        a.href = withBase(item.path);
        a.textContent = item.title;
        a.title = item.title;
        return a;
      });
      if (bonus) scroll.appendChild(bonus);
    }

    // ── Section 2 : Cours thématiques (nouveaux) ───────────────────────────
    if (data.courses && data.courses.length) {
      const sep = document.createElement("div");
      sep.className = "nav-separator";
      scroll.appendChild(sep);

      const coursesHeader = document.createElement("div");
      coursesHeader.className = "nav-section-title nav-course-label";
      coursesHeader.textContent = "Cours thématiques";
      scroll.appendChild(coursesHeader);

      data.courses.forEach(function (course) {
        const block = buildCourseSection(course);
        if (block) scroll.appendChild(block);
      });
    }

    markActiveLink(nav);
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  const nav = createNavShell();
  const dataUrl = withBase("/assets/nav-data.json");

  fetch(dataUrl)
    .then(function (response) {
      if (!response.ok) throw new Error("Nav data not found");
      return response.json();
    })
    .then(function (data) {
      renderNav(nav, data);
    })
    .catch(function () {
      const scroll = nav.querySelector(".nav-scroll");
      scroll.innerHTML = '<div class="nav-error">Navigation indisponible.</div>';
    });
})();
