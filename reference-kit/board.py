#!/usr/bin/env python3
"""board — build a private Keep / Drop reference board from library.json.

  board.py card-game directions.json OUT_DIR

directions.json lists the board's sections in order:
  [{"id": "holo", "name": "Holographic collectible", "about": "…", "look": "…"}, …]

Writes OUT_DIR/board.html (page content for the Artifact tool, which adds the
document skeleton) and OUT_DIR/a/<asset files>. Publish with the Artifact tool:
file_path OUT_DIR/board.html, files {"a/x.jpg": "OUT_DIR/a/x.jpg", …},
capabilities {"db": {}}. Picks live in the artifact's db collection "picks"
(doc id = asset id), so Claude can read them back with ArtifactData.
"""
import html, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
project, dirs_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
directions = json.load(open(dirs_path))
rows = [r for r in json.load(open(os.path.join(ROOT, "library.json"))) if r["project"] == project]
os.makedirs(os.path.join(out, "a"), exist_ok=True)

items = []
for r in rows:
    name = os.path.basename(r["file"])
    shutil.copy(os.path.join(ROOT, r["file"]), os.path.join(out, "a", name))
    poster = ""
    if r.get("poster"):
        poster = "a/" + os.path.basename(r["poster"])
        shutil.copy(os.path.join(ROOT, r["poster"]), os.path.join(out, poster))
    link = r["link"]
    if r["source"] == "YouTube" and r.get("start"):
        link += ("&" if "?" in link else "?") + "t=" + str(int(float(r["start"])))
    items.append({
        "id": re.sub(r"\.[a-z0-9]+$", "", name), "src": "a/" + name, "poster": poster,
        "kind": r["kind"], "title": r["title"], "dir": r["direction"], "tags": r["tags"],
        "source": r["source"], "link": link,
    })

data = json.dumps({"directions": directions, "items": items}, ensure_ascii=False).replace("</", "<\\/")
page = open(os.path.join(ROOT, "board-template.html")).read()
page = page.replace("__TITLE__", html.escape(project.replace("-", " ").title()) + " references")
page = page.replace("__DATA__", data)
open(os.path.join(out, "board.html"), "w").write(page)
files = {f"a/{f}": os.path.join(out, "a", f) for f in sorted(os.listdir(os.path.join(out, "a")))}
json.dump(files, open(os.path.join(out, "files.json"), "w"), indent=1)
print(f"{len(items)} items, {len(files)} files → {out}")
