(function () {
  "use strict";

  const projects = window.PROJECTS;
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
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const CHECK = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 9.5 7.2 13 14.5 5"/></svg>';
  const ARROW = '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M4.5 10.5 10.5 4.5M5.5 4.5h5v5"/></svg>';

  // "September 2026" → "2026-09", so projects can be grouped and sorted by the month they were made.
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthKey = (made) => {
    const [m, y] = made.split(" ");
    return y + "-" + String(MONTHS.indexOf(m) + 1).padStart(2, "0");
  };
  const tintVars = (p) => `--t1:${p.tint[0]};--t2:${p.tint[1]};--d1:${p.tintDark[0]};--d2:${p.tintDark[1]}`;

  const state = { filter: "all", query: "" };

  // ---------- Masthead and footer ----------
  const earliest = [...projects].sort((a, b) => monthKey(a.made).localeCompare(monthKey(b.made)))[0].made;
  $("#summary").innerHTML =
    `${projects.length} projects since ${esc(earliest)}<br>${finePointer ? "Click" : "Tap"} the flask for a surprise.`;
  $("#footer").innerHTML =
    `<p>${projects.length} projects, all made with Claude. Updated ${fmtDate(window.LAB_UPDATED)}.</p>
     <p><a href="changelog.html">Version History</a></p>`;

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

  // ---------- Timeline ----------
  function tileHTML(p) {
    const kind = { app: "App", web: "Website", artifact: "Artifact" }[p.kind];
    const meta = [kind, p.version ? "Version " + p.version : null].filter(Boolean).join(" · ");
    return `<li><a class="tile" href="#/${esc(p.id)}" data-id="${esc(p.id)}">
      <span class="tile-art" style="${tintVars(p)}">${window.iconSVG(p.icon)}</span>
      <span class="tile-text"><span class="tile-name">${esc(p.name)}</span>
        <span class="tile-meta">${esc(meta)}</span>
        <span class="tile-line">${esc(p.tagline)}</span></span></a></li>`;
  }

  function render() {
    const list = projects.filter(matches);
    const months = new Map();
    list
      .slice()
      .sort((a, b) => monthKey(b.made).localeCompare(monthKey(a.made)) || b.updated.localeCompare(a.updated))
      .forEach((p) => {
        const k = monthKey(p.made);
        if (!months.has(k)) months.set(k, []);
        months.get(k).push(p);
      });
    $("#timeline").innerHTML = [...months.entries()].map(([k, items]) => `
      <section class="month" aria-labelledby="m-${k}">
        <div class="month-head"><h2 id="m-${k}">${esc(items[0].made)}</h2>
          <span>${items.length} ${items.length === 1 ? "project" : "projects"}</span></div>
        <ul class="tiles" role="list">${items.map(tileHTML).join("")}</ul>
      </section>`).join("");

    $("#empty").hidden = list.length > 0;
    $("#resultStatus").textContent = state.query.trim()
      ? (list.length ? `${list.length} ${list.length === 1 ? "result" : "results"}` : "No results")
      : "";
    watchTiles();
  }

  // ---------- Living icons ----------
  // An icon acts out its project once: on hover or focus, the first time its tile appears, and when it opens.
  const awake = new WeakMap();
  function wake(svg) {
    if (!svg || reduceMotion()) return;
    svg.classList.remove("alive");
    void svg.getBoundingClientRect();
    svg.classList.add("alive");
    clearTimeout(awake.get(svg));
    awake.set(svg, setTimeout(() => svg.classList.remove("alive"), 1800));
  }
  const greeted = new Set();
  let greetQueue = Promise.resolve();
  const greeter = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      greeter.unobserve(e.target);
      const id = e.target.dataset.id;
      if (greeted.has(id)) return;
      greeted.add(id);
      const tile = e.target;
      greetQueue = greetQueue.then(() => new Promise((r) => { wake(tile.querySelector(".icon")); setTimeout(r, 140); }));
    });
  }, { threshold: 0.6 });
  function watchTiles() {
    document.querySelectorAll(".tile").forEach((t) => { if (!finePointer && !greeted.has(t.dataset.id)) greeter.observe(t); });
  }
  const timeline = $("#timeline");
  timeline.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const tile = e.target.closest(".tile");
    if (tile && !tile.contains(e.relatedTarget)) wake(tile.querySelector(".icon"));
  });
  timeline.addEventListener("focusin", (e) => {
    const tile = e.target.closest(".tile");
    if (tile) wake(tile.querySelector(".icon"));
  });
  // The highlight follows the pointer across the tile.
  if (finePointer) {
    timeline.addEventListener("pointermove", (e) => {
      const art = e.target.closest(".tile-art");
      if (!art) return;
      const r = art.getBoundingClientRect();
      art.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      art.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // ---------- The living flask ----------
  // Liquid that sloshes with your scrolling (a damped spring), and bubbles over when you tap it.
  const flask = $("#flask");
  const FLASK = "M41 20h18v4h-3v17l17 28c3 5-1 11-7 11H34c-6 0-10-6-7-11l17-28V24h-3z";
  // The same flask is drawn twice: large in the masthead, small beside the toolbar title once you scroll.
  const flaskSVG = (id, extras) => `<svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E9BFF"/><stop offset="1" stop-color="#5E5CE6"/></linearGradient>
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B5CFF"/><stop offset="1" stop-color="#3E3BD6"/></linearGradient>
        <clipPath id="${id}c"><path d="${window.SQUIRCLE_PATH}"/></clipPath>
        <clipPath id="${id}i"><path d="${FLASK}"/></clipPath>
      </defs>
      <g clip-path="url(#${id}c)"><rect width="100" height="100" fill="url(#${id}b)"/></g>
      <path d="${FLASK}" fill="#fff"/>
      <g clip-path="url(#${id}i)">
        <g class="liquid"><rect x="-40" y="50" width="180" height="90" fill="url(#${id}l)"/><rect x="-40" y="50" width="180" height="2.4" fill="#fff" opacity=".55"/></g>
        ${extras ? `<g id="fkBubbles"><circle class="bubble" cx="46" cy="72" r="2.6"/><circle class="bubble" cx="55" cy="74" r="1.8"/><circle class="bubble" cx="50" cy="76" r="2.2"/></g>` : ""}
      </g>
      ${extras ? `<g id="fkPops"></g>` : ""}
      <path d="${window.SQUIRCLE_PATH}" fill="none" class="icon-edge"/>
    </svg>`;
  flask.innerHTML = flaskSVG("fk", true);
  $("#toolbarFlask").innerHTML = flaskSVG("fm", false);
  const liquids = document.querySelectorAll(".liquid");
  // On arrival the flask fills up from empty, with a little slosh.
  let angle = 0, vel = 0, level = reduceMotion() ? 0 : 34, levelVel = 0, running = false, lastT = 0, lastY = window.scrollY;
  function step(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000 || 0.016);
    lastT = t;
    vel += (-90 * angle - 7 * vel) * dt;
    angle = Math.max(-24, Math.min(24, angle + vel * dt));
    levelVel += (-120 * level - 9 * levelVel) * dt;
    level = Math.max(-14, Math.min(40, level + levelVel * dt));
    const tf = `translate(0 ${level.toFixed(2)}) rotate(${angle.toFixed(2)} 50 50)`;
    liquids.forEach((l) => l.setAttribute("transform", tf));
    if (Math.abs(angle) + Math.abs(vel) + Math.abs(level) + Math.abs(levelVel) > 0.05) requestAnimationFrame(step);
    else { running = false; liquids.forEach((l) => l.removeAttribute("transform")); }
  }
  function kick(dv, dl = 0) {
    if (reduceMotion()) return;
    vel += dv;
    levelVel += dl;
    if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(step); }
  }
  if (level) setTimeout(() => kick(70, -20), 250);
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    kick(Math.max(-60, Math.min(60, (y - lastY) * 1.6)));
    lastY = y;
  }, { passive: true });

  let lastSurprise = null;
  flask.addEventListener("click", () => {
    const pool = projects.filter((p) => p.id !== lastSurprise);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastSurprise = pick.id;
    if (reduceMotion()) { openSheet(pick.id); return; }
    kick(240, -60);
    const pops = $("#fkPops");
    for (let i = 0; i < 7; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "pop");
      c.setAttribute("cx", 44 + Math.random() * 12);
      c.setAttribute("cy", 22);
      c.setAttribute("r", 1.6 + Math.random() * 2.6);
      pops.appendChild(c);
      const dx = (Math.random() - 0.5) * 34, dy = -16 - Math.random() * 26;
      c.animate(
        [{ transform: "translate(0,0) scale(.4)", opacity: 0.95 }, { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0 }],
        { duration: 520 + Math.random() * 260, delay: i * 35, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
      ).onfinish = () => c.remove();
    }
    document.querySelectorAll("#fkBubbles .bubble").forEach((b, i) =>
      b.animate([{ transform: "translateY(0)", opacity: 0 }, { opacity: 0.85, offset: 0.3 }, { transform: "translateY(-46px)", opacity: 0 }],
        { duration: 600, delay: i * 70, easing: "ease-in" }));
    setTimeout(() => openSheet(pick.id), 560);
  });

  // ---------- Large title → inline title on scroll ----------
  const toolbar = $("#toolbar");
  new IntersectionObserver(([e]) => toolbar.classList.toggle("scrolled", !e.isIntersecting), {
    rootMargin: "-52px 0px 0px 0px",
  }).observe($("#largeTitle"));

  // ---------- Detail sheet ----------
  const sheet = $("#sheet");
  const scrim = $("#scrim");
  const body = $("#sheetBody");
  let lastFocus = null, origin = null;
  const sheetOpen = () => !sheet.hidden;
  const canMorph = () => !!document.startViewTransition && !reduceMotion();

  function detailHTML(p) {
    const links = p.links || [];
    const primary = links.find((l) => l.primary);
    const rest = links.filter((l) => !l.primary);
    const info = [
      ["Kind", p.platform],
      ["Made", p.made],
      p.version ? ["Version", p.version] : null,
      ["Last updated", fmtDate(p.updated)],
      ["Built with", p.stack],
      p.where ? ["Lives in", p.where, true] : null,
    ].filter(Boolean);

    return `
      <div class="hero-art${p.shot ? " has-shot" : ""}" style="${tintVars(p)}">${window.iconSVG(p.icon)}</div>
      <div class="detail-head"><p class="detail-kind">${esc(p.platform)} · ${esc(p.made)}</p>
        <h2 class="t-title1 detail-name" id="sheetTitle">${esc(p.name)}</h2>
        <p class="detail-tagline">${esc(p.tagline)}</p></div>
      ${primary ? `<div class="actions"><a class="btn btn-primary" href="${esc(primary.url)}" target="_blank" rel="noopener">${esc(primary.label)}${ARROW}</a></div>`
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

  const setInert = (on) => {
    [document.getElementById("main"), ...document.querySelectorAll(".search--bottom, .toolbar")]
      .forEach((el) => (on ? el.setAttribute("inert", "") : el.removeAttribute("inert")));
  };
  const instantly = (fn) => {
    sheet.classList.add("instant"); scrim.classList.add("instant");
    fn();
    void sheet.offsetWidth;
    sheet.classList.remove("instant"); scrim.classList.remove("instant");
  };

  // Puts the sheet on screen. "instant" skips its own slide, because a view transition is animating it.
  function showSheet(p, instant) {
    body.innerHTML = detailHTML(p);
    body.scrollTop = 0;
    sheet.hidden = false;
    scrim.hidden = false;
    document.body.classList.add("sheet-open");
    setInert(true);
    if (instant) instantly(() => { sheet.classList.add("open"); scrim.classList.add("open"); });
    else requestAnimationFrame(() => requestAnimationFrame(() => { sheet.classList.add("open"); scrim.classList.add("open"); }));
    sheet.focus({ preventScroll: true });
    document.title = p.name + " – Shivam’s Lab";
  }
  function hideSheet(instant) {
    const done = () => {
      sheet.hidden = true;
      scrim.hidden = true;
      document.body.classList.remove("sheet-open");
      setInert(false);
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    };
    if (instant || reduceMotion()) {
      instantly(() => { sheet.classList.remove("open"); scrim.classList.remove("open"); sheet.style.removeProperty("--drag"); });
      done();
    } else {
      sheet.classList.remove("open");
      scrim.classList.remove("open");
      sheet.style.removeProperty("--drag");
      setTimeout(done, 320);
    }
    document.title = "Shivam’s Lab";
  }

  const name = (el, n) => { if (el) el.style.viewTransitionName = n || ""; };
  const tileParts = (tile) => (tile && document.contains(tile)
    ? [tile.querySelector(".tile-art"), tile.querySelector(".tile-art .icon")] : [null, null]);
  const heroParts = () => [body.querySelector(".hero-art"), body.querySelector(".hero-art .icon")];

  function openSheet(id, { push = true, from = null } = {}) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    if (sheetOpen()) hideSheet(true);
    lastFocus = from || document.activeElement;
    origin = from;
    if (push && location.hash !== "#/" + id) history.pushState({ id }, "", "#/" + id);

    const [art, icon] = tileParts(from);
    if (art && canMorph()) {
      name(art, "lab-art"); name(icon, "lab-icon");
      const vt = document.startViewTransition(() => {
        name(art); name(icon);
        showSheet(p, true);
        const [ha, hi] = heroParts();
        name(ha, "lab-art"); name(hi, "lab-icon");
      });
      vt.finished.finally(() => { const [ha, hi] = heroParts(); name(ha); name(hi); wake(hi); });
    } else {
      showSheet(p, false);
      setTimeout(() => wake(heroParts()[1]), 380);
    }
  }

  function closeSheet({ pop = true, dragged = false } = {}) {
    if (!sheetOpen()) return;
    if (pop && location.hash.startsWith("#/")) history.pushState({}, "", location.pathname + location.search);
    const [art, icon] = tileParts(origin);
    const r = art && art.getBoundingClientRect();
    const onScreen = r && r.bottom > 0 && r.top < window.innerHeight;
    if (onScreen && !dragged && canMorph()) {
      const [ha, hi] = heroParts();
      name(ha, "lab-art"); name(hi, "lab-icon");
      const vt = document.startViewTransition(() => {
        name(ha); name(hi);
        hideSheet(true);
        name(art, "lab-art"); name(icon, "lab-icon");
      });
      vt.finished.finally(() => { name(art); name(icon); });
    } else {
      hideSheet(false);
    }
    origin = null;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-id]");
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openSheet(link.dataset.id, { from: link }); }
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
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
  window.addEventListener("popstate", () => {
    const id = location.hash.startsWith("#/") ? location.hash.slice(2) : null;
    if (id) openSheet(id, { push: false }); else closeSheet({ pop: false });
  });

  // Drag the top of the sheet down to dismiss, or pull down when its content is at the top.
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
      if (dy > 110) closeSheet({ dragged: true }); else sheet.style.setProperty("--drag", "0px");
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
