(function () {
  var baseUrl = (window.__SITE_BASEURL || window.__GEVOPS_BASEURL || "").replace(/\/$/, "");

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

  // ── Highlight active link & auto-open parent <details> ────────────────────
  function markActiveLink(nav) {
    var current = window.location.pathname;
    nav.querySelectorAll("a").forEach(function (a) {
      try {
        var href = new URL(a.href).pathname;
        if (href && href !== "/" && current.startsWith(href)) {
          a.classList.add("nav-active");
          // Open all ancestor <details> elements
          var node = a.parentElement;
          while (node && node !== nav) {
            if (node.tagName === "DETAILS") node.open = true;
            node = node.parentElement;
          }
        }
      } catch (_) {}
    });
  }

  // ── Shell ──────────────────────────────────────────────────────────────────
  function createNavShell() {
    var nav = el("nav");
    nav.id = "course-nav";
    nav.innerHTML =
      '<div class="nav-header">' +
        '<div class="nav-brand">Coursite</div>' +
        '<button class="nav-close" aria-label="Fermer">&#x2715;</button>' +
      '</div>' +
      '<div class="nav-scroll"><div class="nav-loading">Chargement\u2026</div></div>';

    var toggle = el("button");
    toggle.id = "course-nav-toggle";
    toggle.setAttribute("aria-label", "Ouvrir la navigation");
    toggle.innerHTML = "&#9776; Navigation";

    document.body.appendChild(nav);
    document.body.appendChild(toggle);
    document.body.classList.add("with-course-nav");

    // Ouvrir par défaut sur desktop
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

  // ── La Capsule: category → submodule → modules ────────────────────────────
  function buildLaCapsuleSection(data) {
    var categories = data.categories || [];
    if (!categories.length) return null;

    var wrapper = el("div", "nav-section");

    // Label section
    var label = el("div", "nav-section-title nav-course-label");
    label.textContent = "DevOps \u2014 La Capsule";
    wrapper.appendChild(label);

    categories.forEach(function (cat) {
      var hasMods = (cat.submodules || []).some(function (s) { return s.modules && s.modules.length; });
      if (!hasMods) return;

      // Category <details>
      var catDet = el("details", "nav-cat");
      var catSum = el("summary");

      var badge = el("span", "nav-node-id");
      badge.textContent = cat.id;
      catSum.appendChild(badge);

      var catTitle = document.createTextNode(" " + cat.title);
      catSum.appendChild(catTitle);
      catDet.appendChild(catSum);

      (cat.submodules || []).forEach(function (sub) {
        if (!sub.modules || !sub.modules.length) return;

        var jourRange = (sub.jours || []).join(", ");
        var subLabel = "Sous-module " + sub.id + (jourRange ? " \u2014 J." + jourRange : "");

        var subDet = el("details", "nav-subcat");
        var subSum = el("summary", "nav-sub-title");
        subSum.textContent = subLabel;
        subDet.appendChild(subSum);

        var list = el("ul");
        sub.modules.forEach(function (mod) {
          var li = el("li");
          var a = el("a");
          a.href = withBase(mod.path);
          a.title = mod.title;
          var jourStr = mod.jour ? "J." + mod.jour : "J.--";
          a.textContent = jourStr + " \u2013 " + mod.title;
          li.appendChild(a);
          list.appendChild(li);
        });
        subDet.appendChild(list);
        catDet.appendChild(subDet);
      });

      wrapper.appendChild(catDet);
    });

    // Pipeline
    if (data.pipeline && data.pipeline.length) {
      var pipDet = el("details", "nav-cat");
      var pipSum = el("summary");
      var pipBadge = el("span", "nav-node-id");
      pipBadge.textContent = "CI";
      pipSum.appendChild(pipBadge);
      pipSum.appendChild(document.createTextNode(" Pipeline & Audit"));
      pipDet.appendChild(pipSum);

      var pipList = el("ul");
      data.pipeline.forEach(function (item) {
        var li = el("li");
        var a = el("a");
        a.href = withBase(item.path);
        a.textContent = item.title;
        li.appendChild(a);
        pipList.appendChild(li);
      });
      pipDet.appendChild(pipList);
      wrapper.appendChild(pipDet);
    }

    // Bonus
    if (data.bonus && data.bonus.length) {
      var bonDet = el("details", "nav-cat");
      var bonSum = el("summary");
      var bonBadge = el("span", "nav-node-id");
      bonBadge.textContent = "+";
      bonSum.appendChild(bonBadge);
      bonSum.appendChild(document.createTextNode(" Bonus"));
      bonDet.appendChild(bonSum);

      var bonList = el("ul");
      data.bonus.forEach(function (item) {
        var li = el("li");
        var a = el("a");
        a.href = withBase(item.path);
        a.textContent = item.title;
        li.appendChild(a);
        bonList.appendChild(li);
      });
      bonDet.appendChild(bonList);
      wrapper.appendChild(bonDet);
    }

    return wrapper;
  }

  // ── Thematic courses: theme → modules ─────────────────────────────────────
  function buildThemeDetails(theme) {
    var det = el("details", "nav-theme");
    var sum = el("summary");
    sum.textContent = theme.title;
    det.appendChild(sum);

    var list = el("ul");
    (theme.modules || []).forEach(function (mod) {
      var li = el("li");
      var a = el("a");
      a.href = withBase(mod.path);
      a.title = mod.title;
      var chap = mod.chapter ? "Ch." + mod.chapter + " \u2013 " : "";
      a.textContent = chap + mod.title;
      if (mod.difficulty) {
        var badge = el("span", "nav-difficulty nav-diff-" + mod.difficulty);
        badge.textContent = mod.difficulty[0].toUpperCase();
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

    var section = el("div", "nav-section nav-course-block");

    var header = el("div", "nav-section-title");
    var courseLink = el("a", "nav-course-title");
    courseLink.href = withBase(course.index_path || "#");
    courseLink.textContent = course.title;
    header.appendChild(courseLink);
    section.appendChild(header);

    course.themes.forEach(function (theme) {
      section.appendChild(buildThemeDetails(theme));
    });

    return section;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderNav(nav, data) {
    var scroll = nav.querySelector(".nav-scroll");
    scroll.innerHTML = "";

    // Home link
    var homeLink = el("a", "nav-home-link");
    homeLink.href = withBase("/");
    homeLink.textContent = "\u2302 Accueil";
    scroll.appendChild(homeLink);

    var sep0 = el("div", "nav-separator");
    scroll.appendChild(sep0);

    // La Capsule section (category tree)
    var capsule = buildLaCapsuleSection(data);
    if (capsule) scroll.appendChild(capsule);

    // Thematic courses
    if (data.courses && data.courses.length) {
      var sep = el("div", "nav-separator");
      scroll.appendChild(sep);

      var coursesLabel = el("div", "nav-section-title nav-course-label");
      coursesLabel.textContent = "Cours th\u00e9matiques";
      scroll.appendChild(coursesLabel);

      data.courses.forEach(function (course) {
        var block = buildCourseSection(course);
        if (block) scroll.appendChild(block);
      });
    }

    markActiveLink(nav);
  }

  // ── Theme group toggles (home page) ───────────────────────────────────────
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

  // ── Init ───────────────────────────────────────────────────────────────────
  var nav = createNavShell();

  fetch(withBase("/assets/nav-data.json"))
    .then(function (r) {
      if (!r.ok) throw new Error("not found");
      return r.json();
    })
    .then(function (data) { renderNav(nav, data); })
    .catch(function () {
      var scroll = nav.querySelector(".nav-scroll");
      scroll.innerHTML = '<div class="nav-error">Navigation indisponible.</div>';
    });
})();
