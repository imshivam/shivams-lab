(function () {
  "use strict";

  const IMAGES = window.WISH_IMAGES || {};
  const STATUS = window.WISH_STATUS || {};
  const brands = window.BRANDS;
  // Accessories sit with clothes, so the control stays at five segments on a phone.
  const FILTERS = [
    { id: "all", label: "All" },
    { id: "clothes", label: "Clothes", cats: ["clothing", "accessory"] },
    { id: "shoes", label: "Shoes", cats: ["footwear"] },
    { id: "gadgets", label: "Gadgets", cats: ["gadget"] },
    { id: "home", label: "Home", cats: ["home"] },
  ];
  const SECTIONS = [
    { title: "Clothes", cats: ["clothing", "accessory"] },
    { title: "Shoes", cats: ["footwear"] },
    { title: "Gadgets", cats: ["gadget"] },
    { title: "Home", cats: ["home"] },
  ];
  const VIEWS = [
    { id: "large", label: "Large tiles", icon: '<rect x="4" y="3" width="12" height="14" rx="2.5"/>' },
    { id: "grid", label: "Grid", icon: '<rect x="3" y="3" width="6" height="6" rx="1.6"/><rect x="11" y="3" width="6" height="6" rx="1.6"/><rect x="3" y="11" width="6" height="6" rx="1.6"/><rect x="11" y="11" width="6" height="6" rx="1.6"/>' },
    { id: "list", label: "List", icon: '<rect x="3" y="3.5" width="4.5" height="4.5" rx="1.2"/><rect x="3" y="12" width="4.5" height="4.5" rx="1.2"/><path d="M10 5.8h7M10 14.2h7"/>' },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtDate = (iso) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T12:00:00"));
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ARROW = '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M4.5 10.5 10.5 4.5M5.5 4.5h5v5"/></svg>';
  const viewIcon = (v) => `<svg viewBox="0 0 20 20" aria-hidden="true">${v.icon}</svg>`;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode: the choice just isn't remembered */ } },
  };
  const announce = (text) => { $("#status").textContent = text; };

  // ---------- The wishes ----------
  // Prices and "no longer on sale" come only from wishes.js. The monthly check reports differences for a person
  // to look at; it never changes the page, because a shop can show GitHub's US servers a different page.
  const wishes = window.WISHES.map((w, order) => {
    const st = STATUS[w.id] || {};
    return { ...w, order, gone: !!w.gone, checked: st.ok ? st.checked : null };
  });
  const live = wishes.filter((w) => !w.gone);

  const state = { filter: "all", view: VIEWS.some((v) => v.id === store.get("wishlist-view")) ? store.get("wishlist-view") : "grid" };

  // ---------- Masthead and footer ----------
  $("#summary").innerHTML =
    `${live.length} things I’d love, if you’re ever looking for a gift.<br>Can’t decide? ${finePointer ? "Click" : "Tap"} the gift.`;
  const lastCheck = Object.values(STATUS).map((s) => s.checked).filter(Boolean).sort().pop();
  $("#footer").innerHTML = lastCheck
    ? `<p>Prices are what each shop showed when I added the item. Links are checked once a month, most recently on ${fmtDate(lastCheck)}.</p>`
    : `<p>Prices are what each shop showed when I added the item. Check the shop for today’s price.</p>
       <p>Updated ${fmtDate(window.WISHES_UPDATED)}.</p>`;

  // ---------- Photos ----------
  // Each photo is framed with the colour around its own edge, so it never sits in a box. A photo on a plain
  // studio background floats with some space around it; a busier photo fills the tile when its shape is close.
  function fit(info, ratio, opts) {
    if (info.plain) return "plain";
    if (opts.crop) return "fill";
    return !opts.whole && Math.abs(info.w / info.h - ratio) / ratio < 0.2 ? "fill" : "framed";
  }
  function img(info, sizes, style) {
    const scale = Math.min(1, 480 / Math.max(info.w, info.h));
    const small = Math.round(info.w * scale);
    const srcset = info.small !== info.src ? ` srcset="${esc(info.small)} ${small}w, ${esc(info.src)} ${info.w}w" sizes="${sizes}"` : "";
    return `<img src="${esc(info.small)}"${srcset} width="${info.w}" height="${info.h}" alt="" loading="lazy" decoding="async"${style}>`;
  }
  const SIZES = {
    large: "(min-width: 1100px) 360px, (min-width: 768px) 50vw, 100vw",
    grid: "(min-width: 1100px) 260px, (min-width: 768px) 33vw, 50vw",
    list: "80px",
    sheet: "(min-width: 768px) 620px, 100vw",
  };
  // opts.crop: small thumbnails fill their square. opts.whole: the sheet never crops.
  function art(x, cls, ratio, sizes, extra = "", opts = {}) {
    const info = IMAGES[x.id];
    if (!info) return `<span class="${cls} no-photo-art"><span class="no-photo">${esc(x.brand || x.name)}</span>${extra}</span>`;
    const mode = fit(info, ratio, opts);
    let style = "";
    if (mode !== "fill") {  // fit the whole photo in the frame; a studio photo gets space around it
      const r = info.w / info.h, room = mode === "plain" ? 86 : 100;
      const [iw, ih] = r > ratio ? [room, (room * ratio) / r] : [(room * r) / ratio, room];
      style = ` style="--iw:${iw.toFixed(2)}%;--ih:${ih.toFixed(2)}%"`;
    }
    return `<span class="${cls} photo ${mode}" style="--photo-bg:${esc(info.bg)}">${img(info, sizes, style)}${extra}</span>`;
  }

  function priceHTML(w, cls = "price") {
    if (!w.price || w.gone) return "";
    const label = w.was ? `${w.price}, reduced from ${w.was}` : w.price;
    return `<span class="${cls}" aria-label="${esc(label)}"><span aria-hidden="true">${esc(w.price)}</span>${
      w.was ? `<s aria-hidden="true">${esc(w.was)}</s><span class="sale" aria-hidden="true">Sale</span>` : ""}</span>`;
  }
  const label = (w) => [w.brand && !w.name.startsWith(w.brand) ? w.brand + " " + w.name : w.name,
    w.gone ? "no longer on sale" : w.price ? (w.was ? `${w.price}, reduced from ${w.was}` : w.price) : null].filter(Boolean).join(", ");
  const nolink = (w) => w.gone ? `<span class="wish-nolink">No longer on sale at the shop</span>`
    : w.url ? "" : `<span class="wish-nolink">No link, any good one is perfect</span>`;

  // ---------- Views ----------
  function tileHTML(w) {
    const ratio = 4 / 5;
    return `<li><a class="tile wish${w.gone ? " is-gone" : ""}" href="#/${esc(w.id)}" data-id="${esc(w.id)}" aria-label="${esc(label(w))}">
      ${art(w, "tile-art", ratio, SIZES[state.view], priceHTML(w))}
      <span class="tile-text" aria-hidden="true">${w.brand ? `<span class="tile-meta">${esc(w.brand)}</span>` : ""}
        <span class="tile-name">${esc(w.name)}</span>
        ${w.note ? `<span class="tile-line">${esc(w.note)}</span>` : ""}${nolink(w)}</span></a></li>`;
  }
  function rowHTML(w) {
    return `<li><a class="row wish${w.gone ? " is-gone" : ""}" href="#/${esc(w.id)}" data-id="${esc(w.id)}" aria-label="${esc(label(w))}">
      ${art(w, "row-art", 1, SIZES.list, "", { crop: true })}
      <span class="row-text" aria-hidden="true">${w.brand ? `<span class="tile-meta">${esc(w.brand)}</span>` : ""}
        <span class="row-name">${esc(w.name)}</span>
        ${w.note ? `<span class="tile-line">${esc(w.note)}</span>` : ""}${nolink(w)}
        ${w.price && !w.gone ? `<span class="row-price">${priceHTML(w, "price inline")}</span>` : ""}</span></a></li>`;
  }

  const shown = (cat) => state.filter === "all" || FILTERS.find((f) => f.id === state.filter).cats.includes(cat);

  function render() {
    const list = state.view === "list";
    $("#wishes").className = "view-" + state.view;
    $("#wishes").innerHTML = SECTIONS.map((s, i) => {
      // Discontinued wishes go to the end of their section.
      const items = wishes.filter((w) => s.cats.includes(w.cat) && shown(w.cat)).sort((a, b) => a.gone - b.gone || a.order - b.order);
      if (!items.length) return "";
      const count = items.filter((w) => !w.gone).length;
      return `<section class="cat-section" aria-labelledby="s-${i}">
        <div class="month-head"><h2 id="s-${i}">${esc(s.title)}</h2><span>${count} ${count === 1 ? "wish" : "wishes"}</span></div>
        <ul class="${list ? "rows" : "tiles"}" role="list">${items.map(list ? rowHTML : tileHTML).join("")}</ul></section>`;
    }).join("");

    const shops = brands.filter((b) => shown(b.cat));
    $("#shops").hidden = !shops.length;
    $("#shopList").innerHTML = shops.map((b) => `<li><a class="shop" href="${esc(b.url)}" target="_blank" rel="noopener">
        ${art(b, "shop-art", 1, "44px", "", { crop: true })}
        <span class="shop-text"><span class="shop-name">${esc(b.brand)}</span><span class="shop-line">${esc(b.line)}</span></span>
        ${b.price ? `<span class="shop-price">${esc(b.price)}</span>` : ""}${ARROW}
        <span class="visually-hidden"> (opens the shop in a new tab)</span></a></li>`).join("");
  }

  // ---------- Filter (stays at the top while you scroll) ----------
  const seg = $("#segmented");
  const thumb = $(".segmented-thumb", seg);
  FILTERS.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.filter = f.id;
    b.textContent = f.label;
    b.setAttribute("aria-pressed", String(f.id === state.filter));
    b.addEventListener("click", () => setFilter(f.id, true));
    seg.appendChild(b);
  });
  function placeThumb() {
    const active = $(`button[data-filter="${state.filter}"]`, seg);
    if (!active) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = `translateX(${active.offsetLeft - 3}px)`;
  }
  const bar = $("#filterbar");
  function setFilter(id, speak) {
    state.filter = id;
    seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    placeThumb();
    render();
    // Keep the start of the results in view when the bar is stuck to the top.
    if (bar.classList.contains("stuck")) window.scrollTo({ top: bar.offsetTop - 52, behavior: "instant" });
    if (speak) {
      const n = live.filter((w) => shown(w.cat)).length;
      const f = FILTERS.find((x) => x.id === id);
      announce(id === "all" ? `Showing all ${n} wishes` : `Showing ${n} ${n === 1 ? "wish" : "wishes"} in ${f.label}`);
    }
  }
  seg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = FILTERS.findIndex((f) => f.id === state.filter);
    const next = FILTERS[(i + (e.key === "ArrowRight" ? 1 : FILTERS.length - 1)) % FILTERS.length];
    setFilter(next.id, true);
    $(`button[data-filter="${next.id}"]`, seg).focus();
    e.preventDefault();
  });
  // The bar gets its glass background only once it is stuck under the toolbar.
  const sentinel = document.createElement("div");
  bar.before(sentinel);
  new IntersectionObserver(([e]) => {
    bar.classList.toggle("stuck", !e.isIntersecting);
    $("#toolbar").classList.toggle("joined", !e.isIntersecting);  // toolbar and bar read as one glass header
  }, {
    rootMargin: "-60px 0px 0px 0px",
  }).observe(sentinel);

  // ---------- Layout menu: large tiles, grid or list ----------
  const viewButton = $("#viewButton");
  const viewMenu = $("#viewMenu");
  viewMenu.innerHTML = VIEWS.map((v) =>
    `<button type="button" data-view="${v.id}" aria-pressed="${v.id === state.view}">${viewIcon(v)}<span>${v.label}</span>
      <svg class="tick" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 9.5 7.2 13 14.5 5"/></svg></button>`).join("");
  function showViewButton() {
    const v = VIEWS.find((x) => x.id === state.view);
    viewButton.innerHTML = viewIcon(v);
    viewButton.setAttribute("aria-label", `Layout: ${v.label}`);
    viewMenu.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === state.view)));
  }
  function menu(open) {
    viewMenu.hidden = !open;
    viewButton.setAttribute("aria-expanded", String(open));
    if (open) $(`button[data-view="${state.view}"]`, viewMenu).focus();
  }
  viewButton.addEventListener("click", () => menu(viewMenu.hidden));
  viewMenu.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-view]");
    if (!b) return;
    state.view = b.dataset.view;
    store.set("wishlist-view", state.view);
    showViewButton();
    render();
    menu(false);
    viewButton.focus();
    announce(`Showing ${VIEWS.find((v) => v.id === state.view).label.toLowerCase()}`);
  });
  viewMenu.addEventListener("keydown", (e) => {
    const items = [...viewMenu.querySelectorAll("button")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
      e.preventDefault();
    }
  });
  document.addEventListener("click", (e) => { if (!viewMenu.hidden && !e.target.closest(".menu-wrap")) menu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !viewMenu.hidden) { menu(false); viewButton.focus(); } });

  // ---------- Share ----------
  const toast = $("#toast");
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("on"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove("on"); setTimeout(() => (toast.hidden = true), 250); }, 1800);
  }
  $("#share").addEventListener("click", async () => {
    const url = location.href.split("#")[0];
    if (navigator.share) {
      try { await navigator.share({ title: "Shivam’s Wish List", url }); } catch (e) { /* closed the share sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch (e) {
      showToast(url);
    }
  });

  // ---------- Details sheet ----------
  // A tile opens a sheet with a large photo, the full note and a button to the shop. Where the browser
  // supports it, the tile's photo grows into the sheet's, and shrinks back when it closes.
  const sheet = $("#sheet");
  const scrim = $("#scrim");
  const body = $("#sheetBody");
  let lastFocus = null, origin = null;
  const sheetOpen = () => !sheet.hidden;
  const canMorph = () => !!document.startViewTransition && !reduceMotion();
  const host = (url) => new URL(url).hostname.replace(/^www\./, "");

  function detailHTML(w) {
    const checked = [w.checked ? `Link checked on ${fmtDate(w.checked)}.` : "",
      w.price ? "The price is what the shop showed when I added it." : ""].filter(Boolean).join(" ");
    return `
      ${art(w, "detail-art", 4 / 5, SIZES.sheet, priceHTML(w), { whole: true })}
      <div class="detail-head">
        ${w.brand ? `<p class="detail-brand">${esc(w.brand)}</p>` : ""}
        <h2 class="t-title1 detail-name" id="sheetTitle">${esc(w.name)}</h2>
      </div>
      ${w.note ? `<p class="detail-note">${esc(w.note)}</p>` : ""}
      ${w.gone ? `<p class="detail-box">This is no longer on sale at the shop I saved it from.</p>`
        : w.url ? `<div class="actions"><a class="btn btn-primary" href="${esc(w.url)}" target="_blank" rel="noopener">View at ${esc(host(w.url))}${ARROW}<span class="visually-hidden"> (opens in a new tab)</span></a></div>`
        : `<p class="detail-box">No particular one. Any good one is perfect.</p>`}
      ${checked && !w.gone ? `<p class="detail-checked">${checked}</p>` : ""}`;
  }

  const setInert = (on) => [document.getElementById("main"), $("#toolbar")]
    .forEach((el) => (on ? el.setAttribute("inert", "") : el.removeAttribute("inert")));
  const instantly = (fn) => {
    sheet.classList.add("instant"); scrim.classList.add("instant");
    fn();
    void sheet.offsetWidth;
    sheet.classList.remove("instant"); scrim.classList.remove("instant");
  };
  function showSheet(w, instant) {
    body.innerHTML = detailHTML(w);
    body.scrollTop = 0;
    sheet.hidden = false;
    scrim.hidden = false;
    document.body.classList.add("sheet-open");
    setInert(true);
    if (instant) instantly(() => { sheet.classList.add("open"); scrim.classList.add("open"); });
    else requestAnimationFrame(() => requestAnimationFrame(() => { sheet.classList.add("open"); scrim.classList.add("open"); }));
    sheet.focus({ preventScroll: true });
    document.title = w.name + " – Shivam’s Wish List";
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
    document.title = "Shivam’s Wish List";
  }
  const name = (el, n) => { if (el) el.style.viewTransitionName = n || ""; };
  const tileArt = (el) => (el && document.contains(el) ? el.querySelector(".tile-art, .row-art") : null);
  const sheetArt = () => body.querySelector(".detail-art");

  function openSheet(id, { push = true, from = null } = {}) {
    const w = wishes.find((x) => x.id === id);
    if (!w) return;
    if (sheetOpen()) hideSheet(true);
    lastFocus = from || document.activeElement;
    origin = from;
    if (push && location.hash !== "#/" + id) history.pushState({ id }, "", "#/" + id);
    const a = tileArt(from);
    if (a && canMorph()) {
      name(a, "wish-art");
      const vt = document.startViewTransition(() => { name(a); showSheet(w, true); name(sheetArt(), "wish-art"); });
      vt.finished.finally(() => name(sheetArt()));
    } else {
      showSheet(w, false);
    }
  }
  function closeSheet({ pop = true, dragged = false } = {}) {
    if (!sheetOpen()) return;
    if (pop && location.hash.startsWith("#/")) history.pushState({}, "", location.pathname + location.search);
    const a = tileArt(origin);
    const r = a && a.getBoundingClientRect();
    if (r && r.bottom > 0 && r.top < window.innerHeight && !dragged && canMorph()) {
      name(sheetArt(), "wish-art");
      const vt = document.startViewTransition(() => { name(sheetArt()); hideSheet(true); name(a, "wish-art"); });
      vt.finished.finally(() => name(a));
    } else {
      hideSheet(false);
    }
    origin = null;
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.wish[data-id]");
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); openSheet(link.dataset.id, { from: link }); }
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

  // Drag the top of the sheet down to dismiss it, or pull down when its content is at the top.
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

  // The highlight follows the pointer across the tile.
  if (finePointer) {
    $("#main").addEventListener("pointermove", (e) => {
      const a = e.target.closest("a .tile-art");
      if (!a) return;
      const r = a.getBoundingClientRect();
      a.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      a.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // ---------- The gift: pick a wish for me ----------
  // The lid pops, a few sparks fly, and the page brings one wish into view.
  const GIFT = `<svg viewBox="0 0 100 100" aria-hidden="true"><g>
      <rect x="22" y="44" width="56" height="36" rx="5" fill="#fff"/><rect x="46" y="44" width="8" height="36" fill="#FFD36B"/>
      <g class="g-lid"><rect x="18" y="32" width="64" height="14" rx="4" fill="#fff"/><rect x="46" y="32" width="8" height="14" fill="#FFD36B"/>
        <path d="M50 32q-14-16-20-6 0 6 20 6zM50 32q14-16 20-6 0 6-20 6z" fill="#FFD36B" stroke="#FFD36B" stroke-width="2.4" stroke-linejoin="round"/></g></g></svg>`;
  const gift = $("#gift");
  gift.innerHTML = GIFT;
  $("#toolbarGift").innerHTML = GIFT;
  const popLid = () => {
    if (reduceMotion()) return;
    const svg = $("svg", gift);
    svg.classList.remove("alive");
    void svg.getBoundingClientRect();
    svg.classList.add("alive");
  };
  setTimeout(popLid, 400);

  const SPARKS = ["#FFD36B", "#FFFFFF", "#7FB2F5", "#73D39A", "#FF8A98"];
  let lastPick = null;
  gift.addEventListener("click", () => {
    if (state.filter !== "all") setFilter("all");
    const pool = live.filter((w) => w.id !== lastPick);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastPick = pick.id;
    const tile = $(`.wish[data-id="${pick.id}"]`);
    const reveal = () => {
      tile.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
      tile.focus({ preventScroll: true });
      tile.classList.remove("picked");
      void tile.offsetWidth;
      tile.classList.add("picked");
      announce(`Picked ${label(pick)}`);
    };
    if (reduceMotion()) { reveal(); return; }
    popLid();
    for (let i = 0; i < 9; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.background = SPARKS[i % SPARKS.length];
      gift.appendChild(s);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const d = 30 + Math.random() * 26;
      s.animate(
        [{ transform: "translate(0,0) rotate(0) scale(.5)", opacity: 1 },
         { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${Math.random() * 300}deg) scale(1)`, opacity: 0 }],
        { duration: 600 + Math.random() * 250, delay: i * 25, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
      ).onfinish = () => s.remove();
    }
    setTimeout(reveal, 420);
  });

  // ---------- Large title → inline title on scroll ----------
  const toolbar = $("#toolbar");
  new IntersectionObserver(([e]) => toolbar.classList.toggle("scrolled", !e.isIntersecting), {
    rootMargin: "-52px 0px 0px 0px",
  }).observe($("#largeTitle"));

  // ---------- Start ----------
  showViewButton();
  render();
  placeThumb();
  window.addEventListener("resize", placeThumb);
  if (document.fonts) document.fonts.ready.then(placeThumb);
  if (location.hash.startsWith("#/")) openSheet(location.hash.slice(2), { push: false });
})();
