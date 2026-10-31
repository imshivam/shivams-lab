#!/usr/bin/env python3
"""Build the private artifact copy of the playroom with real assets.

The public page (index.html, pushed to the Lab) keeps drawn diagrams, since
screenshots and gameplay clips belong to their makers. This script swaps the
diagrams for real footage from ~/Documents/references and writes:

  OUT/card-game-playroom.html   content between the ARTIFACT markers
  OUT/a/…                       the assets it uses

  python3 make-private.py OUT
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.expanduser("~/Documents/references/assets/card-game")
BOARD = "https://claude.ai/artifact/5odjRkw1ivwmXGFKZ8AuDR"
out = sys.argv[1]

# diagram key -> (asset, caption). Videos use their .jpg poster.
REAL = {
    "almc": ("a-little-more-conversation-box-and-decks.mp4", "Gamely · how to play video"),
    "wnrs": ("we-re-not-really-strangers-drawing-a-card.mp4", "WNRS · review video"),
    "perel": ("where-should-we-begin-drawing-a-story-card.mp4", "Where Should We Begin? · review video"),
    "tabletopics": ("tabletopics-the-app-store-1.jpg", "App Store"),
    "headsup": ("heads-up-phone-on-forehead.mp4", "Heads Up! · gameplay video"),
    "ocarina": ("ocarina-store-1.jpg", "App Store"),
    "tcg": ("pok-mon-tcg-pocket-pack-reveal.mp4", "TCG Pocket · iPhone gameplay"),
    "balatro": ("balatro-playing-a-hand.mp4", "Balatro · mobile gameplay"),
    "jackbox": ("jackbox-join-with-a-room-code.mp4", "Jackbox · official tutorial"),
    "donut": ("donut-homepage.jpg", "donut.com"),
    # mechanics with a real example in the wild
    "swipe": ("reigns-swipe-to-decide.mp4", "Real: Reigns"),
    "tilt": ("swiftui-metal-holographic-foil-card.mp4", "Real: SwiftUI Metal foil shader"),
    "room": ("jackbox-join-with-a-room-code.mp4", "Real: Jackbox"),
    "flip": ("we-re-not-really-strangers-drawing-a-card.mp4", "Real: WNRS"),
}

CSS = """
.real { margin: 0; position: relative; height: 200px; border-radius: 14px; overflow: hidden; background: #0d0e10; flex: none; }
.app .real { margin-bottom: 10px; }
.real img, .real video { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
.real video { object-position: center; }
.real figcaption { position: absolute; left: 8px; bottom: 8px; background: rgba(0,0,0,.62); color: #fff; font: 700 .7rem/1.2 var(--mono, monospace); padding: 4px 8px; border-radius: 999px; }
.board-link { display: inline-block; margin-top: 12px; font-weight: 700; }
"""

JS = """
<script>
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !still) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: .4 });
  document.querySelectorAll(".real video").forEach(v => io.observe(v));
})();
</script>
"""

src = open(os.path.join(HERE, "index.html")).read()
body = src.split("<!--ARTIFACT-START-->")[1].split("<!--ARTIFACT-END-->")[0]
os.makedirs(os.path.join(out, "a"), exist_ok=True)
used = set()


def swap(m):
    key = m.group(1)
    asset, cap = REAL[key]
    used.add(asset)
    if asset.endswith(".mp4"):
        poster = asset[:-4] + ".jpg"
        used.add(poster)
        media = f'<video src="a/{asset}" poster="a/{poster}" muted loop playsinline preload="metadata"></video>'
    else:
        media = f'<img src="a/{asset}" alt="" loading="lazy">'
    return f'<figure class="real" aria-hidden="true">{media}<figcaption>{cap}</figcaption></figure>'


keys = "|".join(REAL)
body = re.sub(rf'<div class="vis" aria-hidden="true" data-vis="({keys})"></div>', swap, body)
body = body.replace("</style>", CSS + "</style>", 1)
body = body.replace('<a href="#wild">In the wild</a>', '<a href="#wild">In the wild</a>\n    <a href="' + BOARD + '" target="_blank" rel="noopener">Reference board ↗</a>', 1)
body += JS
for f in used:
    shutil.copy(os.path.join(REFS, f), os.path.join(out, "a", f))
open(os.path.join(out, "card-game-playroom.html"), "w").write(body)
print(f"swapped {len(re.findall('class=\"real\"', body))} diagrams, {len(used)} files → {out}")
print("\n".join(sorted("a/" + f for f in used)))
