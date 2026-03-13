(function () {
  "use strict";

  var baseUrl = (window.__SITE_BASEURL || window.__GEVOPS_BASEURL || "").replace(/\/$/, "");
  var COURSE_ID = window.__COURSE_ID || null;

  function withBase(path) {
    if (!path) return "#";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith(baseUrl)) return path;
    if (path.startsWith("/")) return (baseUrl || "") + path;
    return (baseUrl || "") + "/" + path;
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ── Theme group toggles (home page) — toujours actif ─────────────────────
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".theme-group-btn");
    if (!btn) return;
    var panelId = "tg-" + btn.dataset.group;
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var willOpen = panel.hidden;
    panel.hidden = !willOpen;
    btn.classList.toggle("is-open", willOpen);
  });

  // Pas de contexte cours → pas de sidebar
  if (!COURSE_ID) return;

  // ── Détection du lien actif ───────────────────────────────────────────────
  function markActiveLink(nav) {
    var current = window.location.pathname;
    nav.querySelectorAll("a").forEach(function (a) {
      try {
        var href = new URL(a.href).pathname;
        if (!href) return;
        // Correspondance exacte, ou index (trailing slash == index.html)
        var match = href === current ||
          (current.endsWith("/index.html") && href === current.replace(/index\.html$/, "")) ||
          (href.endsWith("/index.html") && current === href.replace(/index\.html$/, ""));
        if (match) {
          a.classList.add("nav-active");
          a.setAttribute("aria-current", "page");
        }
      } catch (_) {}
    });
  }

  // ── Shell de la sidebar ───────────────────────────────────────────────────
  function createNavShell() {
    var nav = el("nav");
    nav.id = "course-nav";
    nav.innerHTML =
      '<div class="nav-header">' +
        '<div class="nav-brand">Plan du cours</div>' +
        '<button class="nav-close" aria-label="Fermer">&#x2715;</button>' +
      '</div>' +
      '<div class="nav-scroll"><div class="nav-loading">Chargement\u2026</div></div>';

    var toggle = el("button");
    toggle.id = "course-nav-toggle";
    toggle.setAttribute("aria-label", "Ouvrir la navigation");
    toggle.innerHTML = "&#9776;";

    document.body.appendChild(nav);
    document.body.appendChild(toggle);
    document.body.classList.add("with-course-nav");

    // Ouvert par défaut sur desktop
    if (window.innerWidth > 960) {
      document.body.classList.add("nav-open");
    }

    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    nav.querySelector(".nav-close").addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });

    return nav;
  }

  // ── Liste de modules ──────────────────────────────────────────────────────
  function buildModuleList(modules) {
    var list = el("ul", "nav-module-list");
    modules.forEach(function (mod) {
      var li = el("li");
      var a = el("a");
      a.href = withBase(mod.path);
      a.title = mod.title;

      var label = el("span", "nav-mod-label");
      label.textContent = mod.title;
      a.appendChild(label);

      if (mod.difficulty) {
        var badge = el("span", "nav-difficulty nav-diff-" + mod.difficulty);
        badge.textContent = mod.difficulty[0].toUpperCase();
        a.appendChild(badge);
      }

      li.appendChild(a);
      list.appendChild(li);
    });
    return list;
  }

  // ── Rendu de la nav de cours ──────────────────────────────────────────────
  function renderCourseNav(nav, course) {
    var scroll = nav.querySelector(".nav-scroll");
    scroll.innerHTML = "";

    // Retour accueil
    var homeLink = el("a", "nav-home-link");
    homeLink.href = withBase("/");
    homeLink.innerHTML = "\u2302 Retour \u00e0 l\u2019accueil";
    scroll.appendChild(homeLink);

    var sep = el("div", "nav-separator");
    scroll.appendChild(sep);

    // En-tête du cours (lien vers l'index)
    var courseHeader = el("div", "nav-course-header");
    var courseTitleLink = el("a", "nav-course-title");
    courseTitleLink.href = withBase(course.index_path || "#");
    courseTitleLink.textContent = (course.icon ? course.icon + " " : "") + course.title;
    courseHeader.appendChild(courseTitleLink);
    scroll.appendChild(courseHeader);

    var sep2 = el("div", "nav-separator");
    scroll.appendChild(sep2);

    // Modules — flat si un seul thème, groupé par thème sinon
    var themes = course.themes || [];

    if (themes.length === 0) {
      var empty = el("div", "nav-empty");
      empty.textContent = "Aucun module disponible.";
      scroll.appendChild(empty);
    } else if (themes.length === 1) {
      scroll.appendChild(buildModuleList(themes[0].modules || []));
    } else {
      themes.forEach(function (theme) {
        var det = el("details", "nav-theme");
        det.open = true;
        var sum = el("summary");
        sum.textContent = theme.title || "Chapitre";
        det.appendChild(sum);
        det.appendChild(buildModuleList(theme.modules || []));
        scroll.appendChild(det);
      });
    }

    markActiveLink(nav);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  var nav = createNavShell();

  fetch(withBase("/assets/nav-data.json"))
    .then(function (r) {
      if (!r.ok) throw new Error("not found");
      return r.json();
    })
    .then(function (data) {
      var courses = data.courses || [];
      var course = null;
      for (var i = 0; i < courses.length; i++) {
        if (courses[i].id === COURSE_ID) { course = courses[i]; break; }
      }
      if (!course) {
        nav.querySelector(".nav-scroll").innerHTML =
          '<div class="nav-error">Cours introuvable.</div>';
        return;
      }
      renderCourseNav(nav, course);
    })
    .catch(function () {
      nav.querySelector(".nav-scroll").innerHTML =
        '<div class="nav-error">Navigation indisponible.</div>';
    });
})();
