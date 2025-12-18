(function () {
  const baseUrl = (window.__GEVOPS_BASEURL || "").replace(/\/$/, "");

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

  function createNavShell() {
    const nav = document.createElement("nav");
    nav.id = "course-nav";
    nav.innerHTML = `
      <div class="nav-header">
        <div class="nav-brand">GevOps — Parcours</div>
        <button class="nav-close" aria-label="Fermer la navigation">✕</button>
      </div>
      <div class="nav-scroll">
        <div class="nav-loading">Chargement de la navigation…</div>
      </div>
    `;

    const toggle = document.createElement("button");
    toggle.id = "course-nav-toggle";
    toggle.setAttribute("aria-label", "Ouvrir la navigation");
    toggle.innerHTML = "☰ Parcours";

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

  function buildModuleList(modules) {
    const list = document.createElement("ul");
    modules.forEach((mod) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = withBase(mod.path);
      a.textContent = mod.jour ? `Jour ${mod.jour} · ${mod.title}` : mod.title;
      a.title = mod.title;
      li.appendChild(a);
      list.appendChild(li);
    });
    return list;
  }

  function buildCategories(categories) {
    if (!categories || !categories.length) return null;
    const section = document.createElement("div");
    section.className = "nav-section";

    const title = document.createElement("div");
    title.className = "nav-section-title";
    title.textContent = "Catégories";
    section.appendChild(title);

    categories.forEach((cat) => {
      const details = document.createElement("details");
      details.open = true;
      details.className = "nav-node";

      const summary = document.createElement("summary");
      const badge = document.createElement("span");
      badge.className = "nav-node-id";
      badge.textContent = cat.id;
      summary.appendChild(badge);
      summary.appendChild(document.createTextNode(" " + cat.title));
      details.appendChild(summary);

      cat.submodules.forEach((sub) => {
        const subDiv = document.createElement("div");
        subDiv.className = "nav-sub";
        const subTitle = document.createElement("div");
        subTitle.className = "nav-sub-title";
        subTitle.textContent = `Sous-module ${sub.id} · Jours ${sub.jours.join(", ")}`;
        subDiv.appendChild(subTitle);
        subDiv.appendChild(buildModuleList(sub.modules));
        details.appendChild(subDiv);
      });

      section.appendChild(details);
    });

    return section;
  }

  function buildSimpleSection(label, items, formatter) {
    if (!items || !items.length) return null;
    const section = document.createElement("div");
    section.className = "nav-section";
    const title = document.createElement("div");
    title.className = "nav-section-title";
    title.textContent = label;
    section.appendChild(title);
    const list = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.appendChild(formatter(item));
      list.appendChild(li);
    });
    section.appendChild(list);
    return section;
  }

  function renderNav(nav, data) {
    const scroll = nav.querySelector(".nav-scroll");
    scroll.innerHTML = "";

    const catSection = buildCategories(data.categories);
    if (catSection) scroll.appendChild(catSection);

    const uncat = buildSimpleSection("Non catégorisés", data.uncategorized, (item) => {
      const a = document.createElement("a");
      a.href = withBase(item.path);
      const prefix = item.jour ? `Jour ${item.jour} · ` : "";
      a.textContent = prefix + item.title;
      a.title = item.title;
      return a;
    });
    if (uncat) scroll.appendChild(uncat);

    const pipeline = buildSimpleSection("Pipeline", data.pipeline, (item) => {
      const a = document.createElement("a");
      a.href = withBase(item.path);
      a.textContent = item.title;
      a.title = item.title;
      if (item.tags && item.tags.length) {
        const span = document.createElement("span");
        span.className = "pill";
        span.innerHTML = `<small>tags</small> ${item.tags.join(", ")}`;
        const wrapper = document.createElement("span");
        wrapper.appendChild(a);
        wrapper.appendChild(span);
        return wrapper;
      }
      return a;
    });
    if (pipeline) scroll.appendChild(pipeline);

    const bonus = buildSimpleSection("Bonus", data.bonus, (item) => {
      const a = document.createElement("a");
      a.href = withBase(item.path);
      const suffix = item.jours && item.jours.length ? ` (jour: ${item.jours.join(", ")})` : "";
      a.textContent = item.title + suffix;
      a.title = item.title;
      return a;
    });
    if (bonus) scroll.appendChild(bonus);
  }

  const nav = createNavShell();
  const dataUrl = withBase("/assets/nav-data.json");

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Nav data not found");
      return response.json();
    })
    .then((data) => {
      renderNav(nav, data);
    })
    .catch(() => {
      const scroll = nav.querySelector(".nav-scroll");
      scroll.innerHTML = '<div class="nav-error">Navigation indisponible.</div>';
    });
})();
