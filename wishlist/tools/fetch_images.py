#!/usr/bin/env python3
"""Keep the wish list's photos, links and prices accurate.

Run from the repository root:  python3 wishlist/tools/fetch_images.py
  --force           fetch every photo again
  --only id1,id2    fetch just these photos again
  --check           also visit every wish's link: note whether it still works and read today's price

Photos. For each entry in wishlist/wishes.js with a url, it finds the product's photo and saves it twice:
wishlist/img/<id>.jpg (up to 1200 px) and wishlist/img/<id>-s.jpg (480 px, for small tiles). In order, it tries:
  1. the entry's `image` field, if set;
  (If the entry has `photoFrom`, the steps below read that page instead of `url`: another shop
   selling the same product, for shops that block automated visits.)
  2. on a Shopify store, the product's first photo from the store's product data;
  3. the page's product data or preview picture (og:image), unless it is a logo;
  4. in a real browser (needs Playwright), the largest photo near the top of the page.
It asks the shop for a larger copy of each photo where the photo's address has a size in it.
A link that no longer exists, or now goes to a different product, is reported and gets no photo.

Outputs: wishlist/images.js (each photo's size and edge colour, so the page can frame it),
wishlist/status.js (with --check: when each link was checked, whether it works, today's price),
and wishlist/og.jpg (the picture shown when the page's link is shared).
Needs Pillow (pip install pillow).
"""

import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from io import BytesIO

from PIL import Image, ImageDraw, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "img")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
BIG, SMALL = 1200, 480
# Preview pictures that show the shop rather than the product.
LOGO = re.compile(r"logo|seo_img|placeholder|favicon|/brand/|og-default|share-image", re.I)


def load():
    # wishes.js is plain JavaScript, so let Node read it rather than parsing it by hand.
    js = ("global.window={};require(process.argv[1]);"
          "console.log(JSON.stringify({wishes:window.WISHES,brands:window.BRANDS}))")
    out = subprocess.check_output(["node", "-e", js, os.path.join(ROOT, "wishes.js")])
    return json.loads(out)


def get(url, accept="text/html,*/*"):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept, "Accept-Language": "en-GB,en;q=0.9"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read(), r.geturl()
        except urllib.error.HTTPError as err:
            if err.code != 429 or attempt == 2:
                raise
            time.sleep(10 * (attempt + 1))  # rate-limited: wait and try again


def meta(page, name):
    for tag in re.findall(r"<meta\b[^>]*>", page, re.I):
        if re.search(r'(property|name|itemprop)\s*=\s*["\']%s["\']' % re.escape(name), tag, re.I):
            m = re.search(r'content\s*=\s*["\']([^"\']+)', tag, re.I)
            if m:
                return html.unescape(m.group(1)).strip()
    return None


def ld_products(page):
    """schema.org Product objects in the page's structured data."""
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        items = data if isinstance(data, list) else data.get("@graph", [data]) if isinstance(data, dict) else []
        for item in items:
            if isinstance(item, dict) and "Product" in str(item.get("@type", "")):
                yield item


def ld_image(page):
    for item in ld_products(page):
        img = item.get("image")
        if isinstance(img, list):
            img = img[0] if img else None
        if isinstance(img, dict):
            img = img.get("url") or img.get("contentUrl")
        if isinstance(img, str):
            return img
    return None


def money(amount):
    v = float(str(amount).replace(",", ""))
    return "£{:,.0f}".format(v) if v == int(v) else "£{:,.2f}".format(v)


def find_price(page):
    """Today's price in pounds, from the page's own product data. Only prices marked GBP count."""
    amount = meta(page, "product:price:amount") or meta(page, "og:price:amount")
    currency = meta(page, "product:price:currency") or meta(page, "og:price:currency")
    if amount and currency == "GBP":
        return money(amount)
    for item in ld_products(page):
        offers = item.get("offers")
        for offer in offers if isinstance(offers, list) else [offers]:
            if isinstance(offer, dict) and offer.get("priceCurrency") == "GBP":
                amount = offer.get("price") or offer.get("lowPrice")
                if amount not in (None, ""):
                    return money(amount)
    return None


def page_image(page, final):
    for src in (ld_image(page), meta(page, "og:image:secure_url") or meta(page, "og:image"), meta(page, "twitter:image")):
        if src and not LOGO.search(src):
            return urllib.parse.urljoin(final, src)
    return None


class Gone(Exception):
    """The product page no longer exists, or now sends you to a different product."""


class Blocked(Exception):
    """The shop refused the visit, so the link couldn't be checked."""


def handle(url):
    m = re.search(r"/products/([^/?#]+?)(\.js|\.json)?(?:[/?#]|$)", url)
    return m.group(1) if m else None


LOCALE_HOME = re.compile(r"^/?([a-z]{2}([-_][a-z]{2})?)/?$", re.I)


def check_same_product(url, final, product=True):
    if LOCALE_HOME.match(urllib.parse.urlsplit(final).path) and not LOCALE_HOME.match(urllib.parse.urlsplit(url).path):
        raise Blocked("the shop sent the visit to another country's site: " + final)
    h = handle(url)
    if h and handle(final) != h:
        raise Gone("the link now goes to a different page: " + final)
    # Shops send a product that has gone to their home page or to search.
    path = urllib.parse.urlsplit(final).path.strip("/")
    moved = urllib.parse.urlsplit(url).path.strip("/") != path
    if product and moved and (path.count("/") < 2 or "search" in final.lower()):
        raise Gone("the link now goes to the shop's home page or search: " + final)


def shopify_image(url):
    """Shopify stores publish product data as JSON, which names the product's own photos."""
    parts = urllib.parse.urlsplit(url)
    path = parts.path.rstrip("/")
    base = "%s://%s" % (parts.scheme, parts.netloc)
    try:
        if "/products/" in path:
            raw, final = get(base + path + ".js", "application/json")
            check_same_product(url, final, product=False)  # same handle is enough for the data address
            data = json.loads(raw)
            img = data.get("featured_image") or (data.get("images") or [None])[0]
        elif "/collections/" in path:
            data = json.loads(get(base + path + "/products.json?limit=1", "application/json")[0])
            img = data["products"][0]["images"][0]["src"]
        else:
            return None
    except Gone:
        raise
    except Exception:
        return None
    return urllib.parse.urljoin(base + "/", img) if img else None


def bigger(src):
    """The same photo at a larger size, where its address says what size to send."""
    s = re.sub(r"@\d+\*\d+(?=\.\w+$|\?)", "", src)                       # DJI: name@374*374.png
    s = re.sub(r"\bw_(\d+),h_(\d+)", lambda m: "w_%d,h_%d" % (BIG, round(int(m.group(2)) * BIG / int(m.group(1)))), s)
    s = re.sub(r"/w_\d+,(?!h_)", "/w_%d," % BIG, s)                        # adidas: /images/w_600,
    s = re.sub(r"_(\d+x\d*|\d*x\d+)(?=\.\w+(\?|$))", "", s)              # Shopify: name_600x.jpg
    parts = urllib.parse.urlsplit(s)
    q = urllib.parse.parse_qsl(parts.query, keep_blank_values=True)
    out = []
    for k, v in q:
        if k.lower() in ("width", "w", "wid", "sw") and v.isdigit():
            out.append((k, str(BIG)))
        elif k.lower() in ("height", "h", "hei", "sh", "preset", "dpr"):
            continue                                                       # let the width set the size
        else:
            out.append((k, v))
    return urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(out, safe=",*")))


def download(src, fetcher):
    """Try the larger copy first; keep whichever decodes and is larger."""
    best = None
    for cand in dict.fromkeys([bigger(src), src]):
        try:
            data = fetcher(cand)
            im = Image.open(BytesIO(data))
            im.load()
        except Exception:
            continue
        if not best or im.width * im.height > best[1].width * best[1].height:
            best = (cand, im)
    if not best:
        raise ValueError("the photo could not be downloaded: " + src)
    return best


def fetch_plain(e):
    url = e.get("photoFrom") or e.get("url")
    src = e.get("image") or shopify_image(url)
    if not src:
        raw, final = get(url)  # a 404 here is checked again in the browser, as some shops refuse plain requests
        check_same_product(url, final)
        src = page_image(raw.decode("utf-8", "replace"), final)
    if not src:
        raise ValueError("no product photo in the page's source")
    return download(src, lambda u: get(u, "image/avif,image/webp,image/*,*/*")[0])


# In the browser: the largest photo near the top of the page, which on a product page is the product.
LARGEST = """() => {
  const seen = [...document.images]
    .map((i) => ({ src: i.currentSrc || i.src, r: i.getBoundingClientRect(), w: i.naturalWidth, h: i.naturalHeight }))
    .filter((i) => i.src && !i.src.startsWith("data:") && i.w >= 300 && i.h >= 300 && i.r.width >= 150 && i.r.top < 1400
      && i.r.height / i.r.width >= 0.75);  // product photos are square or tall; wide ones are banners
  seen.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
  return seen.length ? seen[0].src : null;
}"""


class Browser:
    """One real browser for the whole run. A visible Chrome under xvfb passes bot checks that stop headless ones."""

    def __init__(self):
        self.pw = self.browser = None

    def open(self, url, product=True):
        if not self.browser:
            from playwright.sync_api import sync_playwright
            self.pw = sync_playwright().start()
            opts = {"headless": os.environ.get("WISHLIST_HEADED") != "1",
                    "args": ["--disable-blink-features=AutomationControlled"]}
            try:
                self.browser = self.pw.chromium.launch(channel="chrome", **opts) if not opts["headless"] else None
            except Exception:
                self.browser = None
            self.browser = self.browser or self.pw.chromium.launch(**opts)
        ctx = self.browser.new_context(user_agent=UA, locale="en-GB", viewport={"width": 1280, "height": 1000})
        page = ctx.new_page()
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined })")
        resp = page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(6000)
        status = resp.status if resp else 0
        if status in (404, 410):
            ctx.close()
            raise Gone("the product page no longer exists (%d)" % status)
        title = page.title()
        if status in (401, 403, 429) or re.search(r"access denied|just a moment|attention required", title, re.I):
            ctx.close()
            raise Blocked("the shop refused the visit (status %d, %r)" % (status, title[:60]))
        check_same_product(url, page.url, product)
        return ctx, page

    def photo(self, e):
        url = e.get("photoFrom") or e.get("url")
        ctx, page = self.open(url or e["image"], "line" not in e)
        try:
            page.mouse.wheel(0, 600)
            page.wait_for_timeout(1500)
            src = e.get("image") or page_image(page.content(), page.url) or page.evaluate(LARGEST)
            if not src:
                raise ValueError("no product photo found on the page (%r)" % page.title()[:60])
            def fetch(u):  # same browser session and referrer, which some image servers require
                r = ctx.request.get(urllib.parse.urljoin(page.url, u), headers={"Referer": page.url})
                if not r.ok:
                    raise ValueError("photo download returned %d" % r.status)
                return r.body()

            try:
                return download(urllib.parse.urljoin(page.url, src), fetch)
            except ValueError:
                if e.get("image"):
                    raise
                return download(urllib.parse.urljoin(page.url, page.evaluate(LARGEST) or src), fetch)
        finally:
            ctx.close()

    def page(self, url):
        ctx, page = self.open(url)
        try:
            return page.content(), page.url
        finally:
            ctx.close()

    def close(self):
        if self.browser:
            self.browser.close()
            self.pw.stop()


def frame(im):
    """The colour around the photo's edge, and whether that edge is one plain colour (a studio background)."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    b = max(2, min(w, h) // 40)
    strips = [rgb.crop((0, 0, w, b)), rgb.crop((0, h - b, w, h)), rgb.crop((0, 0, b, h)), rgb.crop((w - b, 0, w, h))]
    stats = [ImageStat.Stat(s) for s in strips]
    mean = [sum(s.mean[i] for s in stats) / 4 for i in range(3)]
    spread = max(max(s.stddev) for s in stats)
    even = max(abs(s.mean[i] - mean[i]) for s in stats for i in range(3))
    return "#%02x%02x%02x" % tuple(round(c) for c in mean), spread < 12 and even < 10


def save(id_, im):
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    im = im.convert("RGB")
    for size, suffix in ((BIG, ""), (SMALL, "-s")):
        copy = im.copy()
        copy.thumbnail((size, size), Image.LANCZOS)
        copy.save(os.path.join(IMG_DIR, id_ + suffix + ".jpg"), "JPEG", quality=84, optimize=True, progressive=True)


def describe(id_):
    path = os.path.join(IMG_DIR, id_ + ".jpg")
    im = Image.open(path)
    bg, plain = frame(im)
    small = os.path.exists(os.path.join(IMG_DIR, id_ + "-s.jpg"))
    return {"src": "img/%s.jpg" % id_, "small": "img/%s-s.jpg" % id_ if small else "img/%s.jpg" % id_,
            "w": im.width, "h": im.height, "bg": bg, "plain": plain}


def check(e, browser):
    """Whether the wish's own link still works, and its price today if the page states one in pounds."""
    url = e["url"]
    try:
        try:
            raw, final = get(url)
            check_same_product(url, final)
            page = raw.decode("utf-8", "replace")
        except Gone:
            raise
        except Exception:
            if not browser:
                raise
            page, final = browser.page(url)
        return {"ok": True, "price": find_price(page)}
    except Gone as err:
        return {"ok": False, "gone": True, "why": str(err)}
    except Exception as err:
        return {"ok": None, "why": str(err)[:160]}


def make_og(data, images):
    """1200 × 630 share picture: four product photos, one from each category, on the page's background."""
    picks, seen = [], set()
    for w in data["wishes"]:
        if w["id"] in images and not w.get("gone") and w["cat"] not in seen and len(picks) < 4:
            picks.append(w["id"])
            seen.add(w["cat"])
    for w in data["wishes"]:
        if len(picks) < 4 and w["id"] in images and w["id"] not in picks and not w.get("gone"):
            picks.append(w["id"])
    W, H, pad, gap = 1200, 630, 48, 24
    og = Image.new("RGB", (W, H), "#F2F2F7")
    cw = (W - 2 * pad - 3 * gap) // 4
    ch = H - 2 * pad
    for i, id_ in enumerate(picks):
        info = images[id_]
        card = Image.new("RGB", (cw, ch), info["bg"])
        im = Image.open(os.path.join(ROOT, info["src"])).convert("RGB")
        if info["plain"]:
            im.thumbnail((int(cw * 0.86), int(ch * 0.86)), Image.LANCZOS)
        else:  # a full-bleed photo fills the card
            scale = max(cw / im.width, ch / im.height)
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
            left, top = (im.width - cw) // 2, (im.height - ch) // 2
            im = im.crop((left, top, left + cw, top + ch))
        card.paste(im, ((cw - im.width) // 2, (ch - im.height) // 2))
        mask = Image.new("L", (cw, ch), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=28, fill=255)
        og.paste(card, (pad + i * (cw + gap), pad), mask)
    og.save(os.path.join(ROOT, "og.jpg"), "JPEG", quality=86, optimize=True, progressive=True)


def main():
    force = "--force" in sys.argv
    only = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else set()
    os.makedirs(IMG_DIR, exist_ok=True)
    data = load()
    entries = data["wishes"] + data["brands"]
    try:
        import playwright  # noqa: F401
        browser = Browser()
    except ImportError:
        browser = None
    report = []

    # Links and prices first, so a wish whose page has gone doesn't get a new photo.
    status_path = os.path.join(ROOT, "status.js")
    status = {}
    if os.path.exists(status_path):
        status = json.loads(re.search(r"=\s*(\{.*\});", open(status_path).read(), re.S).group(1))
    if "--check" in sys.argv:
        today = date.today().isoformat()
        for e in data["wishes"]:
            if not e.get("url") or e.get("gone"):
                continue
            result = check(e, browser)
            result["checked"] = today
            status[e["id"]] = result
            if result["ok"] is False:
                report.append("- **%s**: the link may no longer work (%s). Check it, and set `gone: true` in wishes.js if so." % (e["name"], result["why"]))
            elif result["ok"] is None:
                report.append("- %s: couldn't check (%s)" % (e["name"], result["why"]))
            elif result.get("price") and e.get("price") and result["price"] != e["price"]:
                report.append("- %s: the shop's page says %s; wishes.js says %s. Check it and update wishes.js if right." % (e["name"], result["price"], e["price"]))
            print("check ", e["id"], json.dumps(result))
            time.sleep(3)  # be gentle: some shops limit how often one visitor can ask

    for e in entries:
        id_ = e["id"]
        have = os.path.exists(os.path.join(IMG_DIR, id_ + ".jpg"))
        gone = e.get("gone")
        if (have and not force and id_ not in only) or gone or not (e.get("url") or e.get("image")):
            continue
        try:
            try:
                src, im = fetch_plain(e)
            except Gone:
                raise
            except Exception as plain_err:
                if not browser:
                    raise
                print("retry ", id_, "in a browser after:", plain_err)
                src, im = browser.photo(e)
            save(id_, im)
            print("ok    ", id_, "<-", src, im.size)
        except Exception as err:  # keep going; report every failure at the end
            report.append("- %s: no photo (%s)" % (e.get("name") or e.get("brand"), str(err)[:160]))
            print("failed", id_, "-", err)
            if isinstance(err, Gone) and have:
                for suffix in ("", "-s"):  # a photo of some other page is worse than none
                    p = os.path.join(IMG_DIR, id_ + suffix + ".jpg")
                    if os.path.exists(p):
                        os.remove(p)
        time.sleep(3)
    if browser:
        browser.close()

    for e in entries:  # photos saved before small copies existed
        big = os.path.join(IMG_DIR, e["id"] + ".jpg")
        if os.path.exists(big) and not os.path.exists(os.path.join(IMG_DIR, e["id"] + "-s.jpg")):
            save(e["id"], Image.open(big))
    images = {e["id"]: describe(e["id"]) for e in entries if os.path.exists(os.path.join(IMG_DIR, e["id"] + ".jpg"))}
    with open(os.path.join(ROOT, "images.js"), "w") as f:
        f.write("// Written by tools/fetch_images.py: each photo, its size, and the colour around its edge (bg).\n")
        f.write("// plain: the edge is one even colour, so the page can frame the photo with it.\n")
        f.write("window.WISH_IMAGES = " + json.dumps(images, indent=2, sort_keys=True) + ";\n")
    with open(status_path, "w") as f:
        f.write("// Written by tools/fetch_images.py --check: whether each wish's link worked and its price that day.\n")
        f.write("window.WISH_STATUS = " + json.dumps(status, indent=2, sort_keys=True, ensure_ascii=False) + ";\n")
    make_og(data, images)

    print("\n%d photos" % len(images))
    print("\n".join(report) or "Nothing to report.")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as f:
            f.write("## Wish list check\n\n%d photos.\n\n%s\n" % (len(images), "\n".join(report) or "Nothing to report."))


if __name__ == "__main__":
    main()
