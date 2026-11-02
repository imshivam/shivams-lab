// App icons, drawn on a 100 × 100 square. The page masks them to the iOS icon shape,
// so each one is a full-bleed square: a simple background plus one or two bold shapes.
// Parts that move carry a class (styles.css → "Living icons"). They only move while the
// icon has the class "alive": on hover, on first appearance, and when the project opens.

(function () {
  // A superellipse close to the continuous-corner shape of iOS app icons.
  function squirclePath(n = 5, steps = 120) {
    const pts = [];
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const c = Math.cos(t), s = Math.sin(t);
      const x = 50 + 50 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      const y = 50 + 50 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      pts.push(x.toFixed(2) + " " + y.toFixed(2));
    }
    return "M" + pts.join("L") + "Z";
  }
  const SQUIRCLE = squirclePath();

  const lg = (id, a, b, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

  const ICONS = {
    packed: (u) => `
      <defs>${lg(u + "b", "#2FC7B4", "#0A6E68", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g class="pk-case">
        <path d="M40 30v-6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6" fill="none" stroke="#FFFDF8" stroke-width="5"/>
        <rect x="22" y="30" width="56" height="44" rx="8" fill="#FFFDF8"/>
        <rect x="34" y="30" width="5" height="44" fill="#0A6E68" opacity=".18"/>
        <rect x="61" y="30" width="5" height="44" fill="#0A6E68" opacity=".18"/>
      </g>
      <g class="pk-tick"><circle cx="72" cy="72" r="11" fill="#FFC75A"/><path d="M66.5 72.2l3.6 3.6 7-7.4" fill="none" stroke="#3B2A08" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    referenceKit: (u) => `
      <defs>${lg(u + "b", "#3D7BFF", "#1E2F6B", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect class="rk-t rk-1" x="20" y="20" width="27" height="34" rx="5" fill="#FFFDF8"/>
      <rect class="rk-t rk-2" x="53" y="20" width="27" height="34" rx="5" fill="#FFFDF8" opacity=".55"/>
      <rect class="rk-t rk-3" x="20" y="60" width="27" height="20" rx="5" fill="#FFFDF8" opacity=".55"/>
      <rect class="rk-t rk-4" x="53" y="60" width="27" height="20" rx="5" fill="#FFFDF8"/>
      <g class="rk-check"><circle cx="40" cy="27" r="9" fill="#2FCB7E"/><path d="M35.5 27.2l3 3 6-6.2" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    cardGame: (u) => `
      <defs>${lg(u + "b", "#FFC75A", "#F2704E", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect class="cg-back cg-b1" x="31" y="22" width="38" height="54" rx="6" fill="#7466F2" stroke="#FFFDF8" stroke-width="3" transform="rotate(-14 50 49)"/>
      <rect class="cg-back cg-b2" x="31" y="22" width="38" height="54" rx="6" fill="#1E7A73" stroke="#FFFDF8" stroke-width="3" transform="rotate(10 50 49)"/>
      <g class="cg-top">
        <rect x="31" y="22" width="38" height="54" rx="6" fill="#FFFDF8"/>
        <rect x="37" y="33" width="26" height="4.5" rx="2.25" fill="#F2704E"/>
        <rect x="37" y="44" width="20" height="4.5" rx="2.25" fill="#F2704E" opacity=".45"/>
        <rect x="37" y="55" width="23" height="4.5" rx="2.25" fill="#F2704E" opacity=".45"/>
      </g>`,
    lab: (u) => `
      <defs>${lg(u + "b", "#2E9BFF", "#5E5CE6", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M41 20h18v4h-3v17l17 28c3 5-1 11-7 11H34c-6 0-10-6-7-11l17-28V24h-3z" fill="#fff"/>
      <path d="M33 66h34l4 6c1 3-1 5-4 5H33c-3 0-5-2-4-5z" fill="#5E5CE6" opacity=".55"/>
      <circle cx="46" cy="58" r="3" fill="#5E5CE6" opacity=".55"/><circle cx="55" cy="51" r="2.2" fill="#5E5CE6" opacity=".45"/>`,

    stayConnected: (u) => `
      <defs>${lg(u + "b", "#FCF8EE", "#ECE1C8")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g class="sc-stamp">
        <rect x="27" y="22" width="46" height="56" rx="4" fill="#2C4A7C"/>
        <rect x="27" y="22" width="46" height="56" rx="4" fill="none" stroke="#F4EDDC" stroke-width="5" stroke-dasharray="0.01 7.2" stroke-linecap="round"/>
        <circle class="sc-eye" cx="41" cy="43" r="3.6" fill="#F4EDDC"/><circle cx="59" cy="43" r="3.6" fill="#F4EDDC"/>
        <path class="sc-smile" d="M38 55q12 12 24 0" fill="none" stroke="#F4EDDC" stroke-width="5" stroke-linecap="round"/>
      </g>`,

    jointFinances: (u) => `
      <defs>${lg(u + "b", "#E3F6EA", "#B9E6CB")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle class="jf-coin" cx="50" cy="12" r="6" fill="#F7C744" stroke="#D99A1E" stroke-width="2"/>
      <g class="jf-pouch">
        <path d="M36 31c-3-6 1-12 6-10 1-5 7-6 8-2 2-4 8-3 8 2 5-2 9 4 6 10z" fill="#FFB08A"/>
        <circle cx="50" cy="60" r="24" fill="#FF8A57"/>
        <rect x="37" y="29" width="26" height="8" rx="4" fill="#E2602F"/>
        <circle cx="42" cy="58" r="2.8" fill="#5A2614"/><circle cx="58" cy="58" r="2.8" fill="#5A2614"/>
        <path d="M44 66q6 5 12 0" fill="none" stroke="#5A2614" stroke-width="3" stroke-linecap="round"/>
      </g>`,

    menuLens: (u) => `
      <defs>${lg(u + "b", "#FFA048", "#FF4F38", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="22" y="18" width="42" height="60" rx="7" fill="#fff"/>
      <rect class="ml-line ml-l1" x="30" y="29" width="26" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <rect class="ml-line ml-l2" x="30" y="40" width="18" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <rect class="ml-line ml-l3" x="30" y="51" width="22" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <g class="ml-lens">
        <circle cx="63" cy="60" r="15" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-width="7"/>
        <path d="M74 71l9 9" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
      </g>`,

    brushwork: (u) => `
      <defs>${lg(u + "b", "#F7F1E6", "#E6D9C2")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path class="bw-s bw-s1" pathLength="1" d="M20 66C34 40 52 30 80 32" fill="none" stroke="#2F5BEA" stroke-width="11" stroke-linecap="round" opacity=".92"/>
      <path class="bw-s bw-s2" pathLength="1" d="M22 44C44 50 60 62 78 74" fill="none" stroke="#F0532E" stroke-width="11" stroke-linecap="round" opacity=".88"/>
      <path class="bw-s bw-s3" pathLength="1" d="M30 80C40 66 56 56 72 54" fill="none" stroke="#1C1C1E" stroke-width="6" stroke-linecap="round"/>`,

    empires: (u) => `
      <defs>${lg(u + "b", "#1C1C22", "#050506")}<clipPath id="${u}g"><circle cx="50" cy="50" r="28"/></clipPath></defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g clip-path="url(#${u}g)">
        <g class="em-land">
          <g id="${u}l">
            <path class="em-empire" d="M44 22c14-2 30 6 36 18-6 6-16 6-22 2-6 6-18 4-20-4-4-6 0-14 6-16z" fill="#E0A83C"/>
            <path d="M22 56c6-4 14-2 18 4-2 8-10 12-18 8z" fill="#6E8BD8"/>
          </g>
          <use href="#${u}l" x="-56"/>
        </g>
      </g>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#EADFC6" stroke-width="3"/>
      <ellipse class="em-meridian" cx="50" cy="50" rx="12" ry="28" fill="none" stroke="#EADFC6" stroke-width="2" opacity=".55"/>
      <path d="M22 50h56" stroke="#EADFC6" stroke-width="2" opacity=".55"/>`,

    festival: (u) => `
      <defs>${lg(u + "b", "#121A2C", "#05070D")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect class="fc-bar fc-b1" x="21" y="46" width="9" height="22" rx="4.5" fill="#00F287"/>
      <rect class="fc-bar fc-b2" x="35" y="30" width="9" height="38" rx="4.5" fill="#00F287"/>
      <rect class="fc-bar fc-b3" x="49" y="38" width="9" height="30" rx="4.5" fill="#00F287"/>
      <rect class="fc-bar fc-b4" x="63" y="24" width="9" height="44" rx="4.5" fill="#00F287"/>
      <rect x="21" y="74" width="51" height="5" rx="2.5" fill="#00F287" opacity=".35"/>`,

    communities: (u) => `
      <defs>${lg(u + "b", "#FFFFFF", "#EEF0F4")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle class="co-c co-a" cx="38" cy="41" r="19" fill="#0047A8" opacity=".92"/>
      <circle class="co-c co-b" cx="62" cy="41" r="19" fill="#A3125E" opacity=".85"/>
      <circle class="co-c co-d" cx="50" cy="62" r="19" fill="#0B6A3C" opacity=".85"/>`,

    portals: (u) => `
      <defs>${lg(u + "b", "#1E1D16", "#0A0A07")}<clipPath id="${u}p"><circle cx="50" cy="50" r="30"/></clipPath>
        <radialGradient id="${u}r" cx=".38" cy=".54" r=".3"><stop offset="0" stop-color="#F4CD80" stop-opacity=".95"/><stop offset="1" stop-color="#F4CD80" stop-opacity="0"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle cx="50" cy="50" r="30" fill="#2C2A21" stroke="#8F8263" stroke-width="1.6"/>
      <g clip-path="url(#${u}p)"><path class="po-land" d="M40 30c8-4 18-2 22 4-2 6 2 12 8 14-2 10-10 18-18 20-2-8-8-12-6-20-6-4-8-12-6-18z" fill="#4A4535"/></g>
      <circle class="po-glow" cx="50" cy="50" r="30" fill="url(#${u}r)"/>
      <circle class="po-dot" cx="38" cy="54" r="3.6" fill="#FFF0C8"/>`,

    paramount: (u) => `
      <defs>${lg(u + "b", "#26261F", "#111110")}${lg(u + "y", "#FFF4C9", "#F6D35A", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g class="pm-card">
        <rect x="20" y="28" width="60" height="44" rx="7" fill="url(#${u}y)"/>
        <path class="pm-play" d="M44 39.5v21c0 1.6 1.7 2.5 3 1.7l16.5-10.5c1.2-.8 1.2-2.6 0-3.4L47 37.8c-1.3-.8-3 .1-3 1.7z" fill="#151512"/>
        <rect class="pm-bar" x="26" y="65" width="48" height="2.5" rx="1.25" fill="#151512" opacity=".55"/>
      </g>`,

    myWeek: (u) => `
      <defs>${lg(u + "b", "#E9805C", "#C2532F", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="14" y="38" width="72" height="24" rx="12" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
      <rect x="19" y="43" width="16" height="14" rx="7" fill="#BDC1F2"/>
      <rect x="37" y="43" width="20" height="14" rx="4" fill="#A3C7E2"/>
      <rect x="59" y="43" width="10" height="14" rx="4" fill="#A0D7AF"/>
      <rect x="71" y="43" width="10" height="14" rx="7" fill="#F0B89E"/>
      <rect x="48" y="30" width="3" height="40" rx="1.5" fill="#fff"/>`,

    wishList: (u) => `
      <defs>${lg(u + "b", "#FFE3EC", "#F7B8CC")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="24" y="44" width="52" height="34" rx="5" fill="#fff"/>
      <rect x="20" y="34" width="60" height="13" rx="4" fill="#fff"/>
      <rect x="46" y="34" width="8" height="44" fill="#E2476F"/>
      <path d="M50 34c-6-10-18-10-16-3 1 4 10 4 16 3zm0 0c6-10 18-10 16-3-1 4-10 4-16 3z" fill="none" stroke="#E2476F" stroke-width="4" stroke-linejoin="round"/>`,

    gameShelf: (u) => `
      <defs>${lg(u + "b", "#1B2350", "#070A1E", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle cx="74" cy="24" r="9" fill="#7CF6FF" opacity=".85"/>
      <path d="M28 24h34l8 8v46H28z" fill="#B9BCB2"/>
      <rect x="34" y="38" width="30" height="28" fill="#EF7A68"/>
      <rect x="44" y="46" width="10" height="4" fill="#1B1B2F"/><rect x="47" y="43" width="4" height="10" fill="#1B1B2F"/>
      <rect x="22" y="80" width="56" height="5" rx="2" fill="#A86B3C"/>`,

    reels: (u) => `
      <defs>${lg(u + "b", "#26262A", "#0B0B0C")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="32" y="16" width="36" height="68" rx="8" fill="#F4F1EA"/>
      <rect x="37" y="26" width="26" height="14" rx="3" fill="none" stroke="#FF8A3D" stroke-width="3"/>
      <rect x="37" y="46" width="26" height="4" rx="2" fill="#26262A" opacity=".25"/>
      <rect x="37" y="54" width="18" height="4" rx="2" fill="#26262A" opacity=".25"/>
      <path d="M46 64v12l10-6z" fill="#26262A"/>`,

    styleAtlas: (u) => `
      <rect width="100" height="100" fill="#141414"/>
      <rect x="0" y="0" width="54" height="44" fill="#D7261E"/>
      <rect x="58" y="0" width="42" height="44" fill="#F4F1EA"/>
      <rect x="0" y="48" width="30" height="52" fill="#F4F1EA"/>
      <rect x="34" y="48" width="66" height="30" fill="#1F3C99"/>
      <rect x="34" y="82" width="40" height="18" fill="#F6C900"/>
      <rect x="78" y="82" width="22" height="18" fill="#F4F1EA"/>`,

    handloom: (u) => `
      <defs>${lg(u + "b", "#F4EEDF", "#E3D6B8")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g stroke-width="7" stroke-linecap="round">
        <path d="M30 20v60M50 20v60M70 20v60" stroke="#1D2756"/>
        <path d="M20 32h60M20 50h60M20 68h60" stroke="#A2262B"/>
        <path d="M30 32v0M50 50v0M70 68v0M70 32v0M30 68v0" stroke="#1D2756"/>
      </g>
      <rect x="18" y="82" width="64" height="5" rx="2.5" fill="#D18A10"/>`,

    playground3d: (u) => `
      <defs>${lg(u + "b", "#1D2440", "#0E1220", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M50 18 78 34 50 50 22 34z" fill="#FFB08F"/>
      <path d="M22 34 50 50v32L22 66z" fill="#FF9466"/>
      <path d="M78 34 50 50v32l28-16z" fill="#7C9CFF"/>`,

    incomeBridge: (u) => `
      <defs>${lg(u + "b", "#3A63D8", "#2347AE", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M14 60c12-22 60-22 72 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M10 60h80" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <path d="M32 50v10M50 46v14M68 50v10" stroke="#fff" stroke-width="4"/>
      <path d="M18 72q8 5 16 0t16 0 16 0 16 0" fill="none" stroke="#9FB8FF" stroke-width="4" stroke-linecap="round"/>`,

    fragrance: (u) => `
      <defs>${lg(u + "b", "#2A1F2E", "#130E15", 1, 1)}${lg(u + "g", "#F3CF8E", "#C98A35")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="40" y="16" width="20" height="10" rx="3" fill="#C98A35"/>
      <rect x="45" y="26" width="10" height="8" fill="#E9B86D"/>
      <rect x="26" y="34" width="48" height="50" rx="12" fill="url(#${u}g)"/>
      <rect x="34" y="52" width="32" height="14" rx="3" fill="#130E15" opacity=".35"/>`,

    concierge: (u) => `
      <defs>${lg(u + "b", "#2F3A33", "#18201B", 1, 1)}${lg(u + "g", "#F4D58A", "#C8962E")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M20 66a30 30 0 0 1 60 0z" fill="url(#${u}g)"/>
      <rect x="44" y="28" width="12" height="8" rx="4" fill="#F4D58A"/>
      <rect x="16" y="68" width="68" height="8" rx="4" fill="#F4D58A"/>`,

    lifeList: (u) => `
      <defs>${lg(u + "b", "#3E8C74", "#2E6A59", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="24" y="18" width="52" height="66" rx="8" fill="#fff"/>
      <path d="M32 34l5 5 9-9M32 52l5 5 9-9" fill="none" stroke="#2E6A59" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="52" y="32" width="16" height="4" rx="2" fill="#2E6A59" opacity=".4"/>
      <rect x="52" y="50" width="16" height="4" rx="2" fill="#2E6A59" opacity=".4"/>
      <rect x="32" y="68" width="36" height="4" rx="2" fill="#2E6A59" opacity=".25"/>`,

    referralMap: (u) => `
      <defs>${lg(u + "b", "#E6F0F4", "#C9DEE8")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M30 66 50 34l20 32M30 66h40" fill="none" stroke="#1F5C7A" stroke-width="4"/>
      <circle cx="50" cy="34" r="11" fill="#1F5C7A"/>
      <circle cx="30" cy="66" r="9" fill="#1E7A4C"/>
      <circle cx="70" cy="66" r="9" fill="#8A5A00"/>`,

    barcelona: (u) => `
      <defs>${lg(u + "b", "#FFD9A0", "#F29E5A")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle cx="50" cy="44" r="18" fill="#FFF3D6"/>
      <rect x="0" y="62" width="100" height="38" fill="#2D6FA3"/>
      <path d="M8 72q10-6 21 0t21 0 21 0 21 0M8 84q10-6 21 0t21 0 21 0 21 0" fill="none" stroke="#9CCBEA" stroke-width="4" stroke-linecap="round"/>`,

    writingCal: (u) => `
      <defs>${lg(u + "b", "#FFFFFF", "#ECEDEF")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="20" y="26" width="44" height="6" rx="3" fill="#1C1C1E"/>
      <rect x="20" y="40" width="34" height="6" rx="3" fill="#1C1C1E" opacity=".5"/>
      <rect x="20" y="54" width="40" height="6" rx="3" fill="#1C1C1E" opacity=".5"/>
      <circle cx="70" cy="68" r="15" fill="#2E8B57"/>
      <path d="M63 68l5 5 9-10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,

    deck: (u) => `
      <defs>${lg(u + "b", "#FF9F6E", "#E5623A", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="18" y="26" width="64" height="42" rx="5" fill="#fff"/>
      <rect x="26" y="34" width="28" height="5" rx="2.5" fill="#E5623A"/>
      <rect x="26" y="44" width="20" height="16" rx="2" fill="#FFD2BF"/>
      <rect x="50" y="44" width="24" height="16" rx="2" fill="#FFD2BF"/>
      <path d="M50 68v10M40 82h20" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  };

  let seq = 0;
  // Returns a complete inline SVG. Each call gets unique ids so gradients never collide.
  window.iconSVG = function (key, className = "icon") {
    const draw = ICONS[key] || ICONS.lab;
    const u = "i" + (seq++).toString(36);
    return `<svg class="${className} icon-${key}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs><clipPath id="${u}c"><path d="${SQUIRCLE}"/></clipPath></defs>
      <g clip-path="url(#${u}c)">${draw(u)}</g>
      <path d="${SQUIRCLE}" fill="none" class="icon-edge"/>
    </svg>`;
  };
  window.SQUIRCLE_PATH = SQUIRCLE;
})();
