"""Read subtitled screenings at London & surrounding cinemas from yourlocalcinema.com
and write listings.json. Standard library only, so it runs anywhere (GitHub Actions too).

Usage: python3 scrape.py [output.json]

Where the data comes from:
- index.html: the films now showing (film page, poster, one-line blurb).
- each film page: rating/runtime/genre line and the "London & surround" screenings.
- more.html: extra films without their own page; London screenings are kept.
- titles: the site shows titles only inside poster images, so the title comes from the
  film's YouTube trailer (oEmbed), with trailer words like "Official Trailer" removed.
"""
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

BASE = "https://www.yourlocalcinema.com/"
UA = "Mozilla/5.0 (compatible; subtitled-listings/1.0)"
MONTHS = {m: i for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}


def get(url):
    if not url.startswith("http"):
        url = BASE + url
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3)


def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def parse_times(line, today):
    """'Wed 16 Dec 10:20, 17:10, Thu 17 Dec 17:10' -> ['2026-12-16T10:20', ...]"""
    out, day = [], None
    for m in re.finditer(r"(?:(\d{1,2})\s+([A-Z][a-z]{2})\s+)?(\d{1,2}):(\d{2})", line):
        if m.group(1):
            mon = MONTHS.get(m.group(2))
            if not mon:
                continue
            d, year = int(m.group(1)), today.year
            # Listings have no year: a date more than two months back means next year.
            if dt.date(year, mon, d) < today - dt.timedelta(days=60):
                year += 1
            day = dt.date(year, mon, d)
        if day:
            out.append(f"{day.isoformat()}T{int(m.group(3)):02d}:{m.group(4)}")
    return out


def details(desc):
    """'(15) 2h 54m. Documentary. Before she's sent...' -> rating, runtime, blurb"""
    m = re.match(r"\(([^)]+)\)\s*(?:(\d+h(?:\s*\d+m)?)\.?)?\s*(.*)", desc)
    if not m:
        return None, None, desc
    return m.group(1).upper(), m.group(2), m.group(3).strip()


def trailer_title(url):
    if not url:
        return None
    try:
        q = urllib.parse.urlencode({"url": url, "format": "json"})
        t = json.loads(get("https://www.youtube.com/oembed?" + q))["title"]
    except Exception:
        return None
    t = t.split("|")[0]
    t = re.split(r"\s*[(\[]", t)[0]
    t = re.split(r"\s*[\-–—:]\s*(?:official|final|teaser|new|uk|us|main|exclusive|live on stage|\d{4})\b", t, flags=re.I)[0]
    t = re.sub(r"\b(official|final|teaser|trailer|uk|hd|4k)\b", "", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).replace(" :", ":").strip(" -–—:")
    if t.isupper() and len(t) > 3:
        t = t.title().replace("'S ", "'s ")
    return t or None


def venue_name(area, cinema):
    """'Acton' + 'Act One' -> 'Acton Act One'; tidy the site's repeats and 'London ' prefixes."""
    if area.startswith("London ") and len(area) > 7:
        area = area[7:]
    if cinema.lower().startswith(area.lower()):
        return cinema
    if area.lower().endswith(cinema.lower()):
        return area
    return f"{area} {cinema}".strip()


def entries(section, today, inline):
    """Screenings in a block of <p><strong><a href=town>Area</a></strong> Cinema ...</p>."""
    out = []
    if inline:  # more.html: cinema and times on one line
        pat = r'<p><strong><a href="([^"]+)">(.*?)</a></strong>(.*?)</p>'
        for town, area, rest in re.findall(pat, section, re.S):
            rest = text(rest)
            m = re.search(r"\s(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d", " " + rest)
            cinema = rest[:m.start()].strip() if m else rest
            out.append((town, text(area), cinema, parse_times(rest, today)))
    else:
        pat = r'<p><strong><a href="([^"]+)">(.*?)</a></strong>(.*?)</p>\s*<p class="showtime">(.*?)</p>'
        for town, area, cinema, times in re.findall(pat, section, re.S):
            out.append((town, text(area), text(cinema), parse_times(text(times), today)))
    return out


TMDB_KEY = __import__("os").environ.get("TMDB_API_KEY", "")
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"


def tmdb(path, **params):
    params["api_key"] = TMDB_KEY
    url = f"https://api.themoviedb.org/3/{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
        return json.load(r)


def enrich(f, today):
    """Official 16:9 picture, synopsis, release date and genre from TMDB; Letterboxd score."""
    vid = urllib.parse.parse_qs(urllib.parse.urlparse(f.get("trailer") or "").query).get("v", [None])[0]
    if vid:
        f["image"] = f"https://i.ytimg.com/vi/{vid}/maxresdefault.jpg"  # fallback picture
    if not TMDB_KEY:
        return
    results = tmdb("search/movie", query=f["title"]).get("results", [])
    # Only recent or upcoming films, so an older film with the same name isn't picked.
    recent = [m for m in results if (m.get("release_date") or "") >= str(today.year - 1)]
    if not recent:
        return
    m = max(recent, key=lambda x: x.get("popularity", 0))
    d = tmdb(f"movie/{m['id']}", append_to_response="images", include_image_language="null")
    f["tmdb"] = m["id"]
    f["overview"] = d.get("overview") or f.get("blurb")
    f["released"] = d.get("release_date")
    f["genre"] = (d.get("genres") or [{}])[0].get("name")
    backs = sorted((d.get("images") or {}).get("backdrops", []), key=lambda x: -x.get("vote_average", 0))
    path = backs[0]["file_path"] if backs else d.get("backdrop_path")
    if path:
        f["image"] = "https://image.tmdb.org/t/p/w1280" + path
    try:
        req = urllib.request.Request(f"https://letterboxd.com/tmdb/{m['id']}/", headers={"User-Agent": BROWSER_UA})
        page = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace")
        lb = re.search(r'name="twitter:data2" content="([\d.]+) out of 5"', page)
        if lb:
            f["ratings"] = [{"source": "Letterboxd", "value": f"{float(lb.group(1)):.1f} / 5"}]
    except Exception:
        pass
    time.sleep(0.3)


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else "listings.json"
    today = dt.date.today()
    index = get("index.html")
    tiles = re.findall(r'<div class="tile" data-href="([^"]+\.html)"><img src="([^"]+)">', index)
    skip = {"locations.html", "trailers.html", "explain.html", "more.html", "foreignlanguage.html"}
    films, london_towns = [], set()

    for page, poster in tiles:
        if page in skip or page.startswith("http"):
            continue
        try:
            h = get(page)
        except Exception as e:
            print("skip", page, e, file=sys.stderr)
            continue
        desc_m = re.search(r'<div class="desc">(.*?)<strong>', h, re.S)
        trailer = re.search(r'href="(https://www\.youtube\.com/watch[^"]+)"', h)
        start = h.find("London &amp; surround")
        end = h.find("<strong>UK:</strong>", start)
        section = h[start:end] if start >= 0 and end > 0 else ""
        rating, runtime, blurb = details(text(desc_m.group(1)) if desc_m else "")
        shows = entries(section, today, inline=False)
        london_towns.update(s[0] for s in shows)
        films.append({"id": page[:-5].lstrip("-"), "page": BASE + page, "poster": BASE + poster,
                      "trailer": trailer.group(1) if trailer else None, "rating": rating,
                      "runtime": runtime, "blurb": blurb, "shows": shows})
        time.sleep(0.7)

    # Extra films on more.html: keep the ones showing at a London & surround cinema.
    try:
        more = get("more.html")
        for block in more.split('<div class="post-prev-img">')[1:]:
            poster = re.search(r'<img[^>]*src="([^"]+)"', block)
            trailer = re.search(r'href="(https://www\.youtube\.com/watch[^"]+)"', block)
            desc = re.search(r"<em>(.*?)</em>", block, re.S)
            fb = re.search(r'<div class="film-block">(.*?)</div>', block, re.S)
            if not (poster and fb):
                continue
            shows = [s for s in entries(fb.group(1), today, inline=True) if s[0] in london_towns]
            if not shows:
                continue
            rating, runtime, blurb = details(text(desc.group(1)) if desc else "")
            films.append({"id": poster.group(1).rsplit(".", 1)[0], "page": BASE + "more.html",
                          "poster": BASE + poster.group(1), "trailer": trailer.group(1) if trailer else None,
                          "rating": rating, "runtime": runtime, "blurb": blurb, "shows": shows})
    except Exception as e:
        print("skip more.html", e, file=sys.stderr)

    films = [f for f in films if f["shows"]]
    if len(films) < 3:
        sys.exit(f"Only {len(films)} films found; the site may have changed. Keeping the old listings.")
    for f in films:
        f["title"] = trailer_title(f["trailer"]) or f["id"].replace("-", " ").title()
        f["shows"] = [{"venue": venue_name(area, cinema), "times": times}
                      for _town, area, cinema, times in f["shows"] if times]
        time.sleep(0.2)

    # Bank holidays count as weekend days on the page (any time works).
    holidays = []
    try:
        gov = json.loads(get("https://www.gov.uk/bank-holidays.json"))
        holidays = [e["date"] for e in gov["england-and-wales"]["events"]
                    if today.isoformat() <= e["date"] <= (today + dt.timedelta(days=120)).isoformat()]
    except Exception as e:
        print("skip bank holidays", e, file=sys.stderr)

    for f in films:
        try:
            enrich(f, today)
        except Exception as e:
            print("skip details", f["id"], e, file=sys.stderr)

    data = {"updated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes"),
            "source": BASE, "holidays": holidays, "films": films}
    with open(out_path, "w") as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
    venues = {s["venue"] for f in films for s in f["shows"]}
    n = sum(len(s["times"]) for f in films for s in f["shows"])
    print(f"{len(films)} films, {len(venues)} London-area venues, {n} showtimes -> {out_path}")


if __name__ == "__main__":
    main()
