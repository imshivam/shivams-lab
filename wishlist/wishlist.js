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
  const IMAGES = window.WISH_IMAGES || {};
  const GIFT = `<svg viewBox="0 0 100 100" aria-hidden="true"><g>
      <rect x="22" y="44" width="56" height="36" rx="5" fill="#fff"/><rect x="46" y="44" width="8" height="36" fill="#FFD36B"/>
      <g class="g-lid"><rect x="18" y="32" width="64" height="14" rx="4" fill="#fff"/><rect x="46" y="32" width="8" height="14" fill="#FFD36B"/>
        <path d="M50 32q-14-16-20-6 0 6 20 6zM50 32q14-16 20-6 0 6-20 6z" fill="#FFD36B" stroke="#FFD36B" stroke-width="2.4" stroke-linejoin="round"/></g></g></svg>`;
  // The product photo, or the brand's name until a photo has been fetched.
  const photo = (x) => IMAGES[x.id]
    ? `<img src="${esc(IMAGES[x.id])}" alt="" loading="lazy" decoding="async">`
    : `<span class="no-photo">${esc(x.brand || x.name)}</span>`;

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
    const link = w.url && !w.gone;
    const inner = `
      <span class="tile-art${IMAGES[w.id] ? " has-photo" : ""}">${photo(w)}${w.gone ? "" : priceHTML(w)}${link ? `<span class="out">${ARROW}</span>` : ""}</span>
      <span class="tile-text">${w.brand ? `<span class="tile-meta">${esc(w.brand)}</span>` : ""}
        <span class="tile-name">${esc(w.name)}</span>
        ${w.note ? `<span class="tile-line">${esc(w.note)}</span>` : ""}
        ${w.gone ? `<span class="wish-nolink">No longer on sale at the shop</span>`
          : w.url ? "" : `<span class="wish-nolink">No link, any good one is perfect</span>`}</span>`;
    return link
      ? `<li><a class="tile wish" href="${esc(w.url)}" target="_blank" rel="noopener" data-id="${esc(w.id)}">${inner}<span class="visually-hidden"> (opens the shop in a new tab)</span></a></li>`
      : `<li><div class="tile wish" data-id="${esc(w.id)}">${inner}</div></li>`;
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
    $("#shopList").innerHTML = shops.map((b) => `<li><a class="shop" href="${esc(b.url)}" target="_blank" rel="noopener" data-id="${esc(b.id)}">
        <span class="shop-art${IMAGES[b.id] ? " has-photo" : ""}">${IMAGES[b.id] ? `<img src="${esc(IMAGES[b.id])}" alt="" loading="lazy" decoding="async">` : esc(b.brand[0])}</span>
        <span class="shop-text"><span class="shop-name">${esc(b.brand)}</span><span class="shop-line">${esc(b.line)}</span></span>
        ${b.price ? `<span class="shop-price">${esc(b.price)}</span>` : ""}${ARROW}
        <span class="visually-hidden"> (opens the shop in a new tab)</span></a></li>`).join("");
  }

  const main = $("#main");
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
  gift.innerHTML = GIFT;
  $("#toolbarGift").innerHTML = GIFT;
  // The lid pops once: when the page opens and each time you press the gift.
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
    const pool = wishes.filter((w) => w.id !== lastPick && !w.gone);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastPick = pick.id;
    const tile = $(`.tile[data-id="${pick.id}"]`);
    const reveal = () => {
      tile.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
      if (tile.matches("a")) tile.focus({ preventScroll: true });
      tile.classList.remove("picked");
      void tile.offsetWidth;
      tile.classList.add("picked");
      $("#status").textContent = `Picked ${pick.brand ? pick.brand + " " : ""}${pick.name}${pick.price ? ", " + pick.price : ""}`;
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
  render();
  placeThumb();
  window.addEventListener("resize", placeThumb);
  if (document.fonts) document.fonts.ready.then(placeThumb);
})();
