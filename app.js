(function () {
  "use strict";

  const projects = window.PROJECTS;
  const KINDS = {
    app: { title: "Apps", one: "app", many: "apps" },
    web: { title: "Websites", one: "website", many: "websites" },
    artifact: { title: "Artifacts", one: "artifact", many: "artifacts" },
  };
  const FILTERS = [
    { id: "all", label: "All" },
    { id: "app", label: "Apps" },
    { id: "web", label: "Websites" },
    { id: "artifact", label: "Artifacts" },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) =>
    new Intl.DateTimeFormat("en-GB", opts).format(new Date(iso + "T12:00:00"));
  const CHEVRON = '<svg class="chevron" viewBox="0 0 9 15" aria-hidden="true"><path d="M1.5 1.5 7.5 7.5 1.5 13.5"/></svg>';
  const CHECK = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 9.5 7.2 13 14.5 5"/></svg>';
  const ARROW = '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M4.5 10.5 10.5 4.5M5.5 4.5h5v5"/></svg>';

  const state = { filter: "all", query: "" };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- Masthead, summary, footer ----------
  $("#labMark").innerHTML = window.iconSVG("lab");
  const counts = Object.keys(KINDS).map((k) => {
    const n = projects.filter((p) => p.kind === k).length;
    return n + " " + (n === 1 ? KINDS[k].one : KINDS[k].many);
  });
  $("#summary").textContent = counts.join(" · ");
  $("#footer").innerHTML =
    `<p>${projects.length} projects, all made with Claude.</p><p>Updated ${fmtDate(window.LAB_UPDATED)}</p>`;

  // ---------- Segmented control ----------
  const seg = $("#segmented");
  const thumb = $(".segmented-thumb", seg);
  FILTERS.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.filter = f.id;
    b.textContent = f.label;
    b.setAttribute("aria-pressed", String(f.id === state.filter));
    b.addEventListener("click", () => setFilter(f.id));
    seg.appendChild(b);
  });
  function placeThumb() {
    const active = $(`button[data-filter="${state.filter}"]`, seg);
    if (!active) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = `translateX(${active.offsetLeft - 3}px)`;
  }
  function setFilter(id) {
    state.filter = id;
    seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    placeThumb();
    render();
  }
  // Arrow keys move between segments.
  seg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = FILTERS.findIndex((f) => f.id === state.filter);
    const next = FILTERS[(i + (e.key === "ArrowRight" ? 1 : FILTERS.length - 1)) % FILTERS.length];
    setFilter(next.id);
    $(`button[data-filter="${next.id}"]`, seg).focus();
    e.preventDefault();
  });

  // ---------- Search ----------
  const inputs = [$("#searchTop"), $("#searchBottom")];
  inputs.forEach((input) => {
    const clear = input.parentElement.querySelector(".search-clear");
    input.addEventListener("input", () => setQuery(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && input.value) { setQuery(""); e.stopPropagation(); }
      if (e.key === "Enter") input.blur();
    });
    clear.addEventListener("click", () => { setQuery(""); input.focus(); });
  });
  function setQuery(q) {
    state.query = q;
    inputs.forEach((i) => {
      if (i.value !== q) i.value = q;
      i.parentElement.querySelector(".search-clear").hidden = !q;
    });
    render();
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !/input|textarea/i.test(document.activeElement.tagName) && !sheetOpen()) {
      const visible = inputs.find((i) => i.offsetParent !== null);
      if (visible) { visible.focus(); e.preventDefault(); }
    }
  });
  // Keep the bottom search field above the on-screen keyboard.
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const onVV = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--kb", kb > 80 ? kb + "px" : "0px");
    };
    vv.addEventListener("resize", onVV);
    vv.addEventListener("scroll", onVV);
  }

  function matches(p) {
    if (state.filter !== "all" && p.kind !== state.filter) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const hay = [p.name, p.tagline, p.platform, p.about, p.stack, ...(p.highlights || [])].join(" ").toLowerCase();
    // Each word must match the start of a word, so "ink" finds Ink Bloom but not "drinks".
    const words = hay.split(/[^\p{L}\p{N}]+/u);
    return q.split(/\s+/).every((w) => words.some((h) => h.startsWith(w)));
  }

  // ---------- Rendering ----------
  const byUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  function cardHTML(p) {
    const art = p.shot
      ? `<img src="${esc(p.shot.src)}" width="${p.shot.w}" height="${p.shot.h}" alt="" loading="lazy" decoding="async">`
      : window.iconSVG(p.icon);
    return `<li><a class="card" href="#/${esc(p.id)}" data-id="${esc(p.id)}">
      <div class="card-art" style="--art:${artTint(p)}">${art}</div>
      <div class="card-text">
        <span class="card-kicker">${esc(cap(KINDS[p.kind].one))} · Updated ${esc(fmtDate(p.updated, { day: "numeric", month: "short" }))}</span>
        <span class="card-name">${esc(p.name)}</span>
        <span class="card-line">${esc(p.tagline)}</span>
      </div></a></li>`;
  }
  function artTint(p) {
    const tints = {
      stayConnected: "linear-gradient(160deg,#F6EFDD,#E6D8B8)",
      jointFinances: "linear-gradient(160deg,#E8F7EE,#C4EBD4)",
      menuLens: "linear-gradient(160deg,#FFE3CC,#FFC2AE)",
      paramount: "linear-gradient(160deg,#2B2A22,#141412)",
    };
    return tints[p.icon] || "var(--bg-3)";
  }
  function rowHTML(p) {
    const meta = [p.platform, p.version ? "Version\u00A0" + p.version : null].filter(Boolean).join(" · ");
    return `<a class="row" href="#/${esc(p.id)}" data-id="${esc(p.id)}">
      ${window.iconSVG(p.icon)}
      <span class="row-text"><span class="row-name">${esc(p.name)}</span>
        <span class="row-line">${esc(p.tagline)}</span>
        <span class="row-meta">${esc(meta)}</span></span>
      ${CHEVRON}</a>`;
  }

  function render() {
    const list = projects.filter(matches);
    const searching = !!state.query.trim();
    const showShelf = state.filter === "all" && !searching;

    $("#shelfSection").hidden = !showShelf;
    if (showShelf) $("#shelf").innerHTML = byUpdated.slice(0, 3).map(cardHTML).join("");

    const groups = Object.keys(KINDS)
      .map((k) => ({ k, items: list.filter((p) => p.kind === k) }))
      .filter((g) => g.items.length);
    $("#groups").innerHTML = groups.map((g) => `
      <section aria-labelledby="h-${g.k}">
        <h2 class="section-title" id="h-${g.k}">${KINDS[g.k].title}</h2>
        <div class="list">${g.items.map(rowHTML).join("")}</div>
      </section>`).join("");

    $("#empty").hidden = list.length > 0;
    $("#resultStatus").textContent = searching
      ? (list.length ? `${list.length} ${list.length === 1 ? "result" : "results"}` : "No results")
      : "";
  }

  // ---------- Large title → inline title on scroll ----------
  const toolbar = $("#toolbar");
  const io = new IntersectionObserver(([e]) => toolbar.classList.toggle("scrolled", !e.isIntersecting), {
    rootMargin: "-52px 0px 0px 0px",
  });
  io.observe($("#largeTitle"));

  // ---------- Detail sheet ----------
  const sheet = $("#sheet");
  const scrim = $("#scrim");
  const body = $("#sheetBody");
  let lastFocus = null;
  const sheetOpen = () => !sheet.hidden;
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function detailHTML(p) {
    const links = p.links || [];
    const primary = links.find((l) => l.primary);
    const rest = links.filter((l) => !l.primary);
    const ext = (l) =>
      `<a class="btn btn-primary" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}${ARROW}</a>`;
    const info = [
      ["Kind", p.platform],
      ["Made", p.made],
      p.version ? ["Version", p.version] : null,
      ["Last updated", fmtDate(p.updated)],
      ["Built with", p.stack],
      p.where ? ["Lives in", p.where, true] : null,
    ].filter(Boolean);

    return `
      <div class="detail-head">${window.iconSVG(p.icon)}
        <div><p class="detail-kind">${esc(p.platform)}</p>
          <h2 class="t-title1 detail-name" id="sheetTitle">${esc(p.name)}</h2>
          <p class="detail-tagline">${esc(p.tagline)}</p></div>
      </div>
      ${primary ? `<div class="actions">${ext(primary)}</div>`
        : `<p class="local-note">There’s no link for this one yet. It lives on your Mac, in the folder shown under Information.</p>`}
      ${p.shot ? `<figure class="shot"><img src="${esc(p.shot.src)}" width="${p.shot.w}" height="${p.shot.h}" alt="${esc(p.shot.alt)}" decoding="async"></figure>` : ""}
      <section class="detail-section" aria-labelledby="about-h"><h3 id="about-h">About</h3><p class="detail-about">${esc(p.about)}</p></section>
      ${rest.length ? `<section class="detail-section" aria-labelledby="links-h"><h3 id="links-h">Links</h3>
        <ul class="links">${rest.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span>${ARROW}</a></li>`).join("")}</ul></section>` : ""}
      ${p.highlights ? `<section class="detail-section" aria-labelledby="hl-h"><h3 id="hl-h">Highlights</h3>
        <ul class="highlights">${p.highlights.map((h) => `<li>${CHECK}<span>${esc(h)}</span></li>`).join("")}</ul></section>` : ""}
      <section class="detail-section" aria-labelledby="info-h"><h3 id="info-h">Information</h3>
        <dl class="info">${info.map(([k, v, copy]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}${copy ? ` <button class="copy" type="button" data-copy="${esc(v)}">Copy</button>` : ""}</dd></div>`).join("")}</dl>
      </section>`;
  }

  function openSheet(id, { push = true } = {}) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    lastFocus = document.activeElement;
    body.innerHTML = detailHTML(p);
    body.scrollTop = 0;
    sheet.hidden = false;
    scrim.hidden = false;
    document.body.classList.add("sheet-open");
    document.getElementById("main").setAttribute("inert", "");
    document.querySelectorAll(".search--bottom, .toolbar").forEach((el) => el.setAttribute("inert", ""));
    requestAnimationFrame(() => requestAnimationFrame(() => { sheet.classList.add("open"); scrim.classList.add("open"); }));
    sheet.focus({ preventScroll: true });
    if (push && location.hash !== "#/" + id) history.pushState({ id }, "", "#/" + id);
    document.title = p.name + " – Shivam’s Lab";
  }

  function closeSheet({ pop = true } = {}) {
    if (!sheetOpen()) return;
    sheet.classList.remove("open");
    scrim.classList.remove("open");
    sheet.style.removeProperty("--drag");
    const done = () => {
      sheet.hidden = true;
      scrim.hidden = true;
      document.body.classList.remove("sheet-open");
      document.getElementById("main").removeAttribute("inert");
      document.querySelectorAll(".search--bottom, .toolbar").forEach((el) => el.removeAttribute("inert"));
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    };
    reduceMotion() ? done() : setTimeout(done, 320);
    if (pop && location.hash.startsWith("#/")) history.pushState({}, "", location.pathname + location.search);
    document.title = "Shivam’s Lab";
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-id]");
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openSheet(link.dataset.id); }
    const copy = e.target.closest(".copy");
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        copy.textContent = "Copied";
        $("#sheetStatus").textContent = "Folder path copied";
        setTimeout(() => (copy.textContent = "Copy"), 1600);
      });
    }
  });
  $("#sheetClose").addEventListener("click", () => closeSheet());
  scrim.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", (e) => {
    if (!sheetOpen()) return;
    if (e.key === "Escape") { closeSheet(); return; }
    if (e.key === "Tab") {
      const f = [...sheet.querySelectorAll("a[href], button:not([disabled])")].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
  window.addEventListener("popstate", () => {
    const id = location.hash.startsWith("#/") ? location.hash.slice(2) : null;
    if (id) openSheet(id, { push: false }); else closeSheet({ pop: false });
  });

  // Drag the grabber (or the top of the sheet) down to dismiss.
  (function drag() {
    let startY = null, dy = 0;
    const start = (y) => { startY = y; dy = 0; sheet.classList.add("dragging"); };
    const move = (y) => {
      if (startY === null) return;
      dy = Math.max(0, y - startY);
      sheet.style.setProperty("--drag", dy + "px");
    };
    const end = () => {
      if (startY === null) return;
      sheet.classList.remove("dragging");
      startY = null;
      if (dy > 110) closeSheet(); else sheet.style.setProperty("--drag", "0px");
    };
    const grab = $("#grabber");
    grab.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button") || window.innerWidth >= 768) return;
      grab.setPointerCapture(e.pointerId);
      start(e.clientY);
    });
    grab.addEventListener("pointermove", (e) => move(e.clientY));
    grab.addEventListener("pointerup", end);
    grab.addEventListener("pointercancel", end);
    // Pulling down when the content is already at the top also dismisses, as on iOS.
    let touchY = null;
    body.addEventListener("touchstart", (e) => { touchY = body.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    body.addEventListener("touchmove", (e) => {
      if (touchY === null || window.innerWidth >= 768) return;
      const d = e.touches[0].clientY - touchY;
      if (d > 0 && body.scrollTop <= 0) { if (startY === null) start(touchY); move(e.touches[0].clientY); }
    }, { passive: true });
    body.addEventListener("touchend", () => { touchY = null; end(); });
  })();

  // ---------- Start ----------
  render();
  placeThumb();
  window.addEventListener("resize", placeThumb);
  if (document.fonts) document.fonts.ready.then(placeThumb);
  if (location.hash.startsWith("#/")) openSheet(location.hash.slice(2), { push: false });
})();
