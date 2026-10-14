// App icons, drawn on a 100 × 100 square. The page masks them to the iOS icon shape,
// so each one is a full-bleed square: a simple background plus one or two bold shapes.

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
    lab: (u) => `
      <defs>${lg(u + "b", "#2E9BFF", "#5E5CE6", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M41 20h18v4h-3v17l17 28c3 5-1 11-7 11H34c-6 0-10-6-7-11l17-28V24h-3z" fill="#fff"/>
      <path d="M33 66h34l4 6c1 3-1 5-4 5H33c-3 0-5-2-4-5z" fill="#5E5CE6" opacity=".55"/>
      <circle cx="46" cy="58" r="3" fill="#5E5CE6" opacity=".55"/><circle cx="55" cy="51" r="2.2" fill="#5E5CE6" opacity=".45"/>`,

    stayConnected: (u) => `
      <defs>${lg(u + "b", "#FCF8EE", "#ECE1C8")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="27" y="22" width="46" height="56" rx="4" fill="#2C4A7C"/>
      <rect x="27" y="22" width="46" height="56" rx="4" fill="none" stroke="#F4EDDC" stroke-width="5" stroke-dasharray="0.01 7.2" stroke-linecap="round"/>
      <circle cx="41" cy="43" r="3.6" fill="#F4EDDC"/><circle cx="59" cy="43" r="3.6" fill="#F4EDDC"/>
      <path d="M38 55q12 12 24 0" fill="none" stroke="#F4EDDC" stroke-width="5" stroke-linecap="round"/>`,

    jointFinances: (u) => `
      <defs>${lg(u + "b", "#E3F6EA", "#B9E6CB")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M36 31c-3-6 1-12 6-10 1-5 7-6 8-2 2-4 8-3 8 2 5-2 9 4 6 10z" fill="#FFB08A"/>
      <circle cx="50" cy="60" r="24" fill="#FF8A57"/>
      <rect x="37" y="29" width="26" height="8" rx="4" fill="#E2602F"/>
      <circle cx="42" cy="58" r="2.8" fill="#5A2614"/><circle cx="58" cy="58" r="2.8" fill="#5A2614"/>
      <path d="M44 66q6 5 12 0" fill="none" stroke="#5A2614" stroke-width="3" stroke-linecap="round"/>`,

    menuLens: (u) => `
      <defs>${lg(u + "b", "#FFA048", "#FF4F38", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="22" y="18" width="42" height="60" rx="7" fill="#fff"/>
      <rect x="30" y="29" width="26" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <rect x="30" y="40" width="18" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <rect x="30" y="51" width="22" height="4.5" rx="2.25" fill="#FF7A40" opacity=".55"/>
      <circle cx="63" cy="60" r="15" fill="#fff" fill-opacity=".28" stroke="#fff" stroke-width="7"/>
      <path d="M74 71l9 9" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`,

    brushwork: (u) => `
      <defs>${lg(u + "b", "#F7F1E6", "#E6D9C2")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <path d="M20 66C34 40 52 30 80 32" fill="none" stroke="#2F5BEA" stroke-width="11" stroke-linecap="round" opacity=".92"/>
      <path d="M22 44C44 50 60 62 78 74" fill="none" stroke="#F0532E" stroke-width="11" stroke-linecap="round" opacity=".88"/>
      <path d="M30 80C40 66 56 56 72 54" fill="none" stroke="#1C1C1E" stroke-width="6" stroke-linecap="round"/>`,

    empires: (u) => `
      <defs>${lg(u + "b", "#1C1C22", "#050506")}<clipPath id="${u}g"><circle cx="50" cy="50" r="28"/></clipPath></defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <g clip-path="url(#${u}g)">
        <path d="M44 22c14-2 30 6 36 18-6 6-16 6-22 2-6 6-18 4-20-4-4-6 0-14 6-16z" fill="#E0A83C"/>
        <path d="M22 56c6-4 14-2 18 4-2 8-10 12-18 8z" fill="#6E8BD8"/>
      </g>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#EADFC6" stroke-width="3"/>
      <ellipse cx="50" cy="50" rx="12" ry="28" fill="none" stroke="#EADFC6" stroke-width="2" opacity=".55"/>
      <path d="M22 50h56" stroke="#EADFC6" stroke-width="2" opacity=".55"/>`,

    festival: (u) => `
      <defs>${lg(u + "b", "#121A2C", "#05070D")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="21" y="46" width="9" height="22" rx="4.5" fill="#00F287"/>
      <rect x="35" y="30" width="9" height="38" rx="4.5" fill="#00F287"/>
      <rect x="49" y="38" width="9" height="30" rx="4.5" fill="#00F287"/>
      <rect x="63" y="24" width="9" height="44" rx="4.5" fill="#00F287"/>
      <rect x="21" y="74" width="51" height="5" rx="2.5" fill="#00F287" opacity=".35"/>`,

    communities: (u) => `
      <defs>${lg(u + "b", "#FFFFFF", "#EEF0F4")}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle cx="38" cy="41" r="19" fill="#0047A8" opacity=".92"/>
      <circle cx="62" cy="41" r="19" fill="#A3125E" opacity=".85"/>
      <circle cx="50" cy="62" r="19" fill="#0B6A3C" opacity=".85"/>`,

    portals: (u) => `
      <defs>${lg(u + "b", "#1E1D16", "#0A0A07")}
        <radialGradient id="${u}r" cx=".38" cy=".54" r=".3"><stop offset="0" stop-color="#F4CD80" stop-opacity=".95"/><stop offset="1" stop-color="#F4CD80" stop-opacity="0"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <circle cx="50" cy="50" r="30" fill="#2C2A21" stroke="#8F8263" stroke-width="1.6"/>
      <path d="M40 30c8-4 18-2 22 4-2 6 2 12 8 14-2 10-10 18-18 20-2-8-8-12-6-20-6-4-8-12-6-18z" fill="#4A4535"/>
      <circle cx="50" cy="50" r="30" fill="url(#${u}r)"/>
      <circle cx="38" cy="54" r="3.6" fill="#FFF0C8"/>`,

    paramount: (u) => `
      <defs>${lg(u + "b", "#26261F", "#111110")}${lg(u + "y", "#FFF4C9", "#F6D35A", 1, 1)}</defs>
      <rect width="100" height="100" fill="url(#${u}b)"/>
      <rect x="20" y="28" width="60" height="44" rx="7" fill="url(#${u}y)"/>
      <path d="M44 39.5v21c0 1.6 1.7 2.5 3 1.7l16.5-10.5c1.2-.8 1.2-2.6 0-3.4L47 37.8c-1.3-.8-3 .1-3 1.7z" fill="#151512"/>`,
  };

  let seq = 0;
  // Returns a complete inline SVG. Each call gets unique ids so gradients never collide.
  window.iconSVG = function (key, className = "icon") {
    const draw = ICONS[key] || ICONS.lab;
    const u = "i" + (seq++).toString(36);
    return `<svg class="${className}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs><clipPath id="${u}c"><path d="${SQUIRCLE}"/></clipPath></defs>
      <g clip-path="url(#${u}c)">${draw(u)}</g>
      <path d="${SQUIRCLE}" fill="none" class="icon-edge"/>
    </svg>`;
  };
  window.SQUIRCLE_PATH = SQUIRCLE;
})();
