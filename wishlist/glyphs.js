// Pictures for the wish list, drawn on a 100 × 100 square like the Lab's icons.
// --g is the bold colour of the drawing and --g2 the light detail colour; both follow the category (wishlist.css).
// Parts that move carry a class and only move while the drawing has the class "alive".

(function () {
  const GLYPHS = {
    tee: `<g class="g-hop">
      <path d="M39 24 27 29 17 43l10 7 5-5v33h36V45l5 5 10-7-10-14-12-5q-11 9-22 0z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M39 24q11 9 22 0" fill="none" stroke="var(--g2)" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M36 56h28M36 63h28" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".35"/></g>`,

    jacket: `<g class="g-hop">
      <path d="M38 21 28 25q-6 3-7 13l-3 33 10 2 3-27v35h38V46l3 27 10-2-3-33q-1-10-7-13l-10-4-12 12z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 33v48" stroke="var(--g2)" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
      <path d="M38 21l6 16-6 3M62 21l-6 16 6 3" fill="none" stroke="var(--g2)" stroke-width="2.4" stroke-linejoin="round" opacity=".5"/>
      <rect x="36" y="58" width="8" height="2.6" rx="1.3" fill="var(--g2)" opacity=".5"/><rect x="56" y="58" width="8" height="2.6" rx="1.3" fill="var(--g2)" opacity=".5"/></g>`,

    jumper: `<g class="g-hop">
      <path d="M40 23 29 27q-6 3-7 13l-3 31 10 2 3-26v32h36V47l3 26 10-2-3-31q-1-10-7-13l-11-4q-10 8-20 0z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 23q10 8 20 0" fill="none" stroke="var(--g2)" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <path d="M32 74h36" stroke="var(--g2)" stroke-width="3" stroke-dasharray="1.5 3" stroke-linecap="round" opacity=".55"/></g>`,

    trousers: `<g class="g-hop">
      <path d="M36 14h28l4 72H54.5L50 38l-4.5 48H32z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 21h28" stroke="var(--g2)" stroke-width="2.6" opacity=".6"/>
      <path d="M50 21v9" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
      <circle cx="41" cy="38" r="2" fill="var(--g2)" opacity=".5"/><circle cx="59" cy="46" r="2" fill="var(--g2)" opacity=".5"/><circle cx="40" cy="58" r="2" fill="var(--g2)" opacity=".5"/><circle cx="61" cy="68" r="2" fill="var(--g2)" opacity=".5"/><circle cx="39" cy="78" r="2" fill="var(--g2)" opacity=".5"/></g>`,

    trainer: `<g class="g-step">
      <path d="M16 62q0-9 8-11l14-4q6-8 13-11l6 3q8 12 22 16 9 2 9 9v6H16z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M15 66h73v4q0 4-4 4H19q-4 0-4-4z" fill="var(--g2)" opacity=".85"/>
      <path d="M45 45l6 4M49 41l6 4M53 38l6 4" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></g>`,

    boot: `<g class="g-step">
      <path d="M31 18h24v36q16 2 25 8 5 4 3 10H29q-3 0-3-4z" fill="var(--g)" stroke="var(--g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M25 72h60v4q0 4-4 4H29q-4 0-4-4z" fill="var(--g2)" opacity=".85"/>
      <path d="M48 26h7M48 34h7M48 42h7" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
      <path d="M31 24h17" stroke="var(--g2)" stroke-width="2" opacity=".35"/></g>`,

    drone: `<g class="g-lift">
      <path d="M30 30l40 40M70 30 30 70" stroke="var(--g)" stroke-width="6" stroke-linecap="round"/>
      <g class="g-rotors" fill="var(--g)" opacity=".38"><circle cx="28" cy="28" r="13"/><circle cx="72" cy="28" r="13"/><circle cx="28" cy="72" r="13"/><circle cx="72" cy="72" r="13"/></g>
      <g fill="var(--g)"><circle cx="28" cy="28" r="4"/><circle cx="72" cy="28" r="4"/><circle cx="28" cy="72" r="4"/><circle cx="72" cy="72" r="4"/></g>
      <rect x="39" y="39" width="22" height="22" rx="7" fill="var(--g)"/>
      <circle cx="50" cy="50" r="4.5" fill="var(--g2)" opacity=".85"/></g>`,

    glasses: `<g class="g-hop">
      <path d="M14 42q-2-6 6-6h20q8 0 8 7v6q0 13-14 13h-6Q14 62 14 49z" fill="var(--g)"/>
      <path d="M86 42q2-6-6-6H60q-8 0-8 7v6q0 13 14 13h6q14 0 14-13z" fill="var(--g)"/>
      <path d="M46 42q4-4 8 0" fill="none" stroke="var(--g)" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 44l9-4M66 44l9-4" stroke="var(--g2)" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <circle cx="82" cy="40" r="1.8" fill="var(--g2)" opacity=".9"/></g>`,

    lamp: `<g>
      <circle class="g-glow" cx="50" cy="48" r="26" fill="var(--g2)" opacity=".55"/>
      <rect x="30" y="20" width="40" height="56" rx="9" fill="var(--g)"/>
      <rect x="35" y="25" width="30" height="40" rx="5" fill="var(--g2)" opacity=".85"/>
      <rect x="38" y="76" width="24" height="5" rx="2.5" fill="var(--g)"/>
      <circle cx="50" cy="70" r="2" fill="var(--g2)" opacity=".7"/></g>`,

    vinyl: `<g class="g-spin">
      <circle cx="50" cy="50" r="31" fill="var(--g)"/>
      <circle cx="50" cy="50" r="24" fill="none" stroke="var(--g2)" stroke-width="1.2" opacity=".25"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="var(--g2)" stroke-width="1.2" opacity=".25"/>
      <path d="M33 30q8-6 17-6" fill="none" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
      <circle cx="50" cy="50" r="10" fill="var(--g2)" opacity=".9"/>
      <circle cx="50" cy="50" r="2" fill="var(--g)"/></g>`,

    airfryer: `<g class="g-hop">
      <path d="M30 26q0-6 6-6h28q6 0 6 6v50q0 4-4 4H34q-4 0-4-4z" fill="var(--g)"/>
      <rect x="34" y="48" width="32" height="26" rx="5" fill="var(--g2)" opacity=".3"/>
      <rect x="42" y="58" width="16" height="5" rx="2.5" fill="var(--g2)" opacity=".85"/>
      <circle cx="50" cy="34" r="6" fill="none" stroke="var(--g2)" stroke-width="2.6" opacity=".8"/>
      <path d="M50 30.5v3.5" stroke="var(--g2)" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></g>`,

    walllight: `<g>
      <circle class="g-glow" cx="62" cy="52" r="24" fill="var(--g2)" opacity=".55"/>
      <rect x="20" y="30" width="10" height="44" rx="4" fill="var(--g)"/>
      <path d="M30 52h18" stroke="var(--g)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="62" cy="52" r="16" fill="var(--g2)" opacity=".9"/>
      <circle cx="62" cy="52" r="16" fill="none" stroke="var(--g)" stroke-width="3"/>
      <path d="M48 52h-2" stroke="var(--g)" stroke-width="7" stroke-linecap="round"/></g>`,

    umbrella: `<g class="g-open">
      <path d="M16 50q2-29 34-30 32 1 34 30-8-6-17 0-8-6-17 0-8-6-17 0-9-6-17 0z" fill="var(--g)" stroke="var(--g)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 21q-8 12-8 29M50 21q8 12 8 29" fill="none" stroke="var(--g2)" stroke-width="2.2" opacity=".5"/></g>
      <path d="M50 50v24q0 7-7 7t-6-6" fill="none" stroke="var(--g)" stroke-width="4.5" stroke-linecap="round"/>`,

    gift: `<g>
      <rect x="22" y="44" width="56" height="36" rx="5" fill="var(--g)"/>
      <rect x="46" y="44" width="8" height="36" fill="var(--g2)" opacity=".9"/>
      <g class="g-lid"><rect x="18" y="32" width="64" height="14" rx="4" fill="var(--g)"/>
        <rect x="46" y="32" width="8" height="14" fill="var(--g2)" opacity=".9"/>
        <path d="M50 32q-14-16-20-6 0 6 20 6zM50 32q14-16 20-6 0 6-20 6z" fill="var(--g2)" stroke="var(--g2)" stroke-width="2.4" stroke-linejoin="round"/></g></g>`,
  };

  // Each category has a default picture. A wish can name its own with "glyph".
  const DEFAULT = { clothing: "tee", footwear: "trainer", gadget: "drone", home: "airfryer", accessory: "umbrella" };
  window.GLYPH_FOR = {
    "adidas-spain-away-jersey": "tee", "adidas-spain-away-authentic": "tee", "adidas-spain-away-authentic-ls": "jumper",
    "desigual-floral-trousers": "trousers", "desigual-printed-jeans": "trousers",
    "moss-wool-parka": "jacket", "universal-works-gower": "jacket", "hackett-velospeed": "jacket", "zara-blue-jumper": "jumper",
    "allsaints-leather": "jacket", "kardo": "jacket", "universal-works": "tee",
    "solovair-zip-derby": "boot", "ecco-grainer": "boot", "red-wing-8864": "boot", "embassy": "boot",
    "ray-ban-meta": "glasses", "lumie-sad-lamp": "lamp", "vinyl-player": "vinyl",
    "lightbox-noble-wall-light": "walllight",
  };

  window.glyphSVG = (key, cat) => {
    const name = GLYPHS[key] ? key : DEFAULT[cat] || "gift";
    return `<svg class="icon glyph" viewBox="0 0 100 100" aria-hidden="true">${GLYPHS[name]}</svg>`;
  };
})();
