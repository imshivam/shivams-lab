(function () {
  "use strict";

  const wishes = window.WISHES;
  const brands = window.BRANDS;
  // Accessories sit with clothes, so the control stays at five segments on a phone.
  const FILTERS = [
    { id: "all", label: "All" },
    { id: "clothes", label: "Clothes", cats: ["clothing", "accessory"] },
    { id: "shoes", label: "Shoes", cats: ["footwear"] },
    { id: "gadgets", label: "Gadgets", cats: ["gadget"] },
    { id: "home", label: "Home", cats: ["home"] },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtDate = (iso) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T12:00:00"));
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ARROW = '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M4.5 10.5 10.5 4.5M5.5 4.5h5v5"/></svg>';
  const glyph = (id, cat) => window.glyphSVG(window.GLYPH_FOR[id], cat);

  const state = { filter: "all" };

  // ---------- Masthead and footer ----------
  $("#summary").innerHTML =
    `${wishes.length} things I’d love, if you’re ever looking for a gift.<br>Can’t decide? ${finePointer ? "Click" : "Tap"} the gift.`;
  $("#footer").innerHTML =
    `<p>Prices are what each shop showed when I added the item. Check the shop for today’s price.</p>
     <p>Updated ${fmtDate(window.WISHES_UPDATED)}.</p>`;

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
  const shown = (cat) => state.filter === "all" || FILTERS.find((f) => f.id === state.filter).cats.includes(cat);

  // ---------- Wishes ----------
  const SECTIONS = [
    { title: "Clothes", cats: ["clothing", "accessory"] },
    { title: "Shoes", cats: ["footwear"] },
    { title: "Gadgets", cats: ["gadget"] },
    { title: "Home", cats: ["home"] },
  ];

  function priceHTML(w) {
    if (!w.price) return "";
    const label = w.was ? `${w.price}, reduced from ${w.was}` : w.price;
    return `<span class="price" aria-label="${esc(label)}"><span aria-hidden="true">${esc(w.price)}</span>${
      w.was ? `<s aria-hidden="true">${esc(w.was)}</s><span class="sale" aria-hidden="true">Sale</span>` : ""}</span>`;
  }

  function tileHTML(w) {
    const inner = `
      <span class="tile-art cat-${w.cat}">${glyph(w.id, w.cat)}${priceHTML(w)}${w.url ? `<span class="out">${ARROW}</span>` : ""}</span>
      <span class="tile-text">${w.brand ? `<span class="tile-meta">${esc(w.brand)}</span>` : ""}
        <span class="tile-name">${esc(w.name)}</span>
        ${w.note ? `<span class="tile-line">${esc(w.note)}</span>` : ""}
        ${w.url ? "" : `<span class="wish-nolink">No link, any good one is perfect</span>`}</span>`;
    return w.url
      ? `<li><a class="tile wish cat-${w.cat}" href="${esc(w.url)}" target="_blank" rel="noopener" data-id="${esc(w.id)}">${inner}<span class="visually-hidden"> (opens the shop in a new tab)</span></a></li>`
      : `<li><div class="tile wish cat-${w.cat}" data-id="${esc(w.id)}">${inner}</div></li>`;
  }

  function render() {
    $("#wishes").innerHTML = SECTIONS.map((s, i) => {
      const items = wishes.filter((w) => s.cats.includes(w.cat) && shown(w.cat));
      if (!items.length) return "";
      return `<section class="cat-section" aria-labelledby="s-${i}">
        <div class="month-head"><h2 id="s-${i}">${esc(s.title)}</h2><span>${items.length} ${items.length === 1 ? "wish" : "wishes"}</span></div>
        <ul class="tiles" role="list">${items.map(tileHTML).join("")}</ul></section>`;
    }).join("");

    const shops = brands.filter((b) => shown(b.cat));
    $("#shops").hidden = !shops.length;
    $("#shopList").innerHTML = shops.map((b) => `<li class="cat-${b.cat}"><a class="shop" href="${esc(b.url)}" target="_blank" rel="noopener" data-id="${esc(b.id)}">
        <span class="shop-art">${glyph(b.id, b.cat)}</span>
        <span class="shop-text"><span class="shop-name">${esc(b.brand)}</span><span class="shop-line">${esc(b.line)}</span></span>
        ${b.price ? `<span class="shop-price">${esc(b.price)}</span>` : ""}${ARROW}
        <span class="visually-hidden"> (opens the shop in a new tab)</span></a></li>`).join("");
    watchTiles();
  }

  // ---------- Living drawings ----------
  // A drawing acts out its object once: on hover or focus, and the first time its tile appears on a touch screen.
  const awake = new WeakMap();
  function wake(svg) {
    if (!svg || reduceMotion()) return;
    svg.classList.remove("alive");
    void svg.getBoundingClientRect();
    svg.classList.add("alive");
    clearTimeout(awake.get(svg));
    awake.set(svg, setTimeout(() => svg.classList.remove("alive"), 1600));
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
      greetQueue = greetQueue.then(() => new Promise((r) => { wake(tile.querySelector(".glyph")); setTimeout(r, 140); }));
    });
  }, { threshold: 0.6 });
  function watchTiles() {
    document.querySelectorAll(".tile").forEach((t) => { if (!finePointer && !greeted.has(t.dataset.id)) greeter.observe(t); });
  }
  const main = $("#main");
  main.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const el = e.target.closest(".tile, .shop");
    if (el && !el.contains(e.relatedTarget)) wake(el.querySelector(".glyph"));
  });
  main.addEventListener("focusin", (e) => {
    const el = e.target.closest(".tile, .shop");
    if (el) wake(el.querySelector(".glyph"));
  });
  // The highlight follows the pointer across the tile.
  if (finePointer) {
    main.addEventListener("pointermove", (e) => {
      const art = e.target.closest("a .tile-art");
      if (!art) return;
      const r = art.getBoundingClientRect();
      art.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      art.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // ---------- The gift: pick a wish for me ----------
  // The lid pops, a few sparks fly, and the page brings one wish into view.
  const gift = $("#gift");
  gift.innerHTML = window.glyphSVG("gift");
  $("#toolbarGift").innerHTML = window.glyphSVG("gift");
  setTimeout(() => wake($("svg", gift)), 400);

  const SPARKS = ["#FFD36B", "#FFFFFF", "#7FB2F5", "#73D39A", "#FF8A98"];
  let lastPick = null;
  gift.addEventListener("click", () => {
    if (state.filter !== "all") setFilter("all");
    const pool = wishes.filter((w) => w.id !== lastPick);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastPick = pick.id;
    const tile = $(`.tile[data-id="${pick.id}"]`);
    const reveal = () => {
      tile.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
      if (tile.matches("a")) tile.focus({ preventScroll: true });
      tile.classList.remove("picked");
      void tile.offsetWidth;
      tile.classList.add("picked");
      setTimeout(() => wake(tile.querySelector(".glyph")), 450);
      $("#status").textContent = `Picked ${pick.brand ? pick.brand + " " : ""}${pick.name}${pick.price ? ", " + pick.price : ""}`;
    };
    if (reduceMotion()) { reveal(); return; }
    wake($("svg", gift));
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
  render();
  placeThumb();
  window.addEventListener("resize", placeThumb);
  if (document.fonts) document.fonts.ready.then(placeThumb);
})();
