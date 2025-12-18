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
      const prefix = mod.jour ? `Jour ${mod.jour}` : "Jour --";
      const order = typeof mod.ordre === "number" ? ` / ${String(mod.ordre).padStart(2, "0")}` : "";
      a.textContent = `${prefix}${order} – ${mod.title}`;
      a.title = mod.title;
      li.appendChild(a);
      list.appendChild(li);
    });
    return list;
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

    const modulesSection = buildSimpleSection("Modules (ordre global)", data.modules, (item) => {
      const a = document.createElement("a");
      a.href = withBase(item.path);
      const prefix = item.jour ? `Jour ${item.jour}` : "Jour --";
      const order = typeof item.ordre === "number" ? ` / ${String(item.ordre).padStart(2, "0")}` : "";
      a.textContent = `${prefix}${order} – ${item.title}`;
      a.title = item.title;
      return a;
    });
    if (modulesSection) scroll.appendChild(modulesSection);

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
