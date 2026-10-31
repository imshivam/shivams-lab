#!/usr/bin/env python3
"""ref — collect real visual references into one tagged library.

Every asset lands in assets/<project>/ and gets a row in library.json saying
what it is, where it came from and when, so any board or page can be rebuilt
from the library alone.

  ref.py url   <image-url> --title "Balatro hand" --source "Mobbin" --link <page>
  ref.py store "Balatro" [--count 4] [--country gb]    App Store screenshots
  ref.py clip  <video-url> --start 1:10 --dur 4 --title "Pack opening"
  ref.py og    <page-url> --title "Donut site"       the page's share image (og:image)
  ref.py peek  <video-url> --from 60 --to 300 [--n 12]  contact sheet to pick a moment
  ref.py list  [--project card-game]

Common flags: --project (default card-game), --direction, --tags a,b.
Images are resized to 1200px on the long side (sips); clips become short,
silent, looping H.264 MP4s 540px wide (yt-dlp + ffmpeg).
"""
import argparse, html, json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(ROOT, "library.json")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15"}


def load():
    return json.load(open(LIB)) if os.path.exists(LIB) else []


def save(rows):
    json.dump(rows, open(LIB, "w"), indent=2, ensure_ascii=False)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "asset"


def outdir(project):
    d = os.path.join(ROOT, "assets", project)
    os.makedirs(d, exist_ok=True)
    return d


def unique(d, base, ext):
    p, n = os.path.join(d, base + ext), 2
    while os.path.exists(p):
        p, n = os.path.join(d, f"{base}-{n}{ext}"), n + 1
    return p


def record(a, path, kind, **extra):
    rows = load()
    row = {
        "file": os.path.relpath(path, ROOT), "kind": kind, "title": a.title,
        "project": a.project, "direction": a.direction or "",
        "tags": [t for t in (a.tags or "").split(",") if t],
        "source": a.source, "link": a.link or "", "added": date.today().isoformat(),
    }
    row.update(extra)
    rows = [r for r in rows if r["file"] != row["file"]] + [row]
    save(rows)
    print(row["file"])


def fetch(url, dest):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        f.write(r.read())
        return r.headers.get("Content-Type", "")


def image(url, a, base):
    tmp = tempfile.NamedTemporaryFile(delete=False).name
    fetch(url, tmp)
    dest = unique(outdir(a.project), base, ".jpg")
    # sips reads webp/png/jpg/heic; always store a resized JPEG.
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82",
                    "-Z", "1200", tmp, "--out", dest], check=True, capture_output=True)
    os.unlink(tmp)
    return dest


def cmd_url(a):
    a.source = a.source or urllib.parse.urlparse(a.url).netloc
    a.link = a.link or a.url
    record(a, image(a.url, a, slug(a.title)), "image")


def cmd_store(a):
    q = urllib.parse.urlencode({"term": a.name, "entity": "software", "country": a.country, "limit": 5})
    res = json.load(urllib.request.urlopen(f"https://itunes.apple.com/search?{q}", timeout=30))["results"]
    if not res:
        sys.exit(f"No App Store match for {a.name!r}")
    app = next((r for r in res if r["trackName"].lower().startswith(a.name.lower())), res[0])
    shots = app.get("screenshotUrls") or app.get("ipadScreenshotUrls") or []
    a.source, a.link = "App Store", app["trackViewUrl"]
    print(f"{app['trackName']} — {len(shots)} screenshots")
    for i, u in enumerate(shots[: a.count], 1):
        a.title = f"{app['trackName']} · screenshot {i}"
        record(a, image(u, a, slug(app["trackName"]) + f"-store-{i}"), "image", app=app["trackName"])


def cmd_og(a):
    req = urllib.request.Request(a.url, headers=UA)
    page = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    m = re.search(r'<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image)["\'][^>]+content=["\']([^"\']+)', page) or \
        re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\'](?:og:image|twitter:image)', page)
    if not m:
        sys.exit("No og:image on that page")
    a.source = a.source or urllib.parse.urlparse(a.url).netloc
    a.link = a.link or a.url
    record(a, image(urllib.parse.urljoin(a.url, html.unescape(m.group(1))), a, slug(a.title)), "image")


def cmd_clip(a):
    a.source = a.source or urllib.parse.urlparse(a.url).netloc
    a.link = a.link or a.url
    start = a.start
    secs = sum(float(x) * 60 ** i for i, x in enumerate(reversed(start.split(":"))))
    tmpd = tempfile.mkdtemp()
    raw = os.path.join(tmpd, "raw.%(ext)s")
    subprocess.run(["yt-dlp", "-q", "--no-playlist", "-f", "bv*[height<=720]+ba/b[height<=720]/b",
                    "--download-sections", f"*{secs}-{secs + a.dur}", "--force-keyframes-at-cuts",
                    "-o", raw, a.url], check=True)
    src = os.path.join(tmpd, next(f for f in os.listdir(tmpd) if f.startswith("raw.")))
    crop = {"portrait": "crop=min(iw\\,ih*9/16):ih,", "square": "crop=min(iw\\,ih):min(iw\\,ih),"}.get(a.crop, "")
    width = 360 if a.crop == "portrait" else 540
    dest = unique(outdir(a.project), slug(a.title), ".mp4")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-t", str(a.dur), "-an",
                    "-vf", f"{crop}scale={width}:-2,fps=30", "-c:v", "libx264", "-crf", "26",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", dest], check=True)
    poster = dest[:-4] + ".jpg"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", dest, "-frames:v", "1", "-q:v", "4", poster], check=True)
    record(a, dest, "video", poster=os.path.relpath(poster, ROOT), start=start, seconds=a.dur)


def cmd_peek(a):
    """Tile n evenly spaced frames from a stretch of video so a clip start can be chosen by eye."""
    tmpd = tempfile.mkdtemp()
    subprocess.run(["yt-dlp", "-q", "--no-playlist", "-f", "bv*[height<=360]/b[height<=360]/b",
                    "--download-sections", f"*{a.frm}-{a.to}", "-o", os.path.join(tmpd, "raw.%(ext)s"), a.url], check=True)
    src = os.path.join(tmpd, next(f for f in os.listdir(tmpd) if f.startswith("raw.")))
    step = (a.to - a.frm) / max(a.n, 1)
    out = a.out or os.path.join(tmpd, "peek.jpg")
    cols = 4
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vf",
                    f"fps=1/{step},scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2,"
                    f"tile={cols}x{-(-a.n // cols)}:padding=4", "-frames:v", "1", out], check=True)
    print(out)
    print("frames at seconds:", ", ".join(f"{a.frm + i * step:.0f}" for i in range(a.n)))


def cmd_list(a):
    for r in load():
        if not a.project or r["project"] == a.project:
            print(f"{r['direction'] or '-':12} {r['kind']:5} {r['title']}  ({r['source']})")


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = p.add_subparsers(dest="cmd", required=True)
for name in ("url", "og", "store", "clip", "peek", "list"):
    s = sub.add_parser(name)
    s.add_argument("--project", default="card-game" if name != "list" else None)
    s.add_argument("--direction")
    s.add_argument("--tags")
    s.add_argument("--source")
    s.add_argument("--link")
    s.add_argument("--title", default="")
    if name in ("url", "og", "clip"):
        s.add_argument("url")
    if name == "peek":
        s.add_argument("url")
        s.add_argument("--from", dest="frm", type=float, default=0)
        s.add_argument("--to", type=float, default=120)
        s.add_argument("--n", type=int, default=12)
        s.add_argument("--out")
    if name == "store":
        s.add_argument("name")
        s.add_argument("--count", type=int, default=4)
        s.add_argument("--country", default="gb")
    if name == "clip":
        s.add_argument("--start", default="0")
        s.add_argument("--dur", type=float, default=4)
        s.add_argument("--crop", choices=["none", "portrait", "square"], default="none")
a = p.parse_args()
{"url": cmd_url, "og": cmd_og, "store": cmd_store, "clip": cmd_clip, "peek": cmd_peek, "list": cmd_list}[a.cmd](a)
