#!/usr/bin/env python3
"""Fetch a photo for every wish and shop from its product page.

Run from the repository root:  python3 wishlist/tools/fetch_images.py
  --force           fetch every photo again
  --only id1,id2    fetch just these entries again

For each entry in wishlist/wishes.js with a url, it finds the product's photo, saves it as
wishlist/img/<id>.jpg (at most 800 px, on white) and lists it in wishlist/images.js. In order, it tries:
  1. the entry's `image` field, if set;
  (If the entry has `photoFrom`, the steps below read that page instead of `url`: another shop
   selling the same product, for shops that block automated visits.)
  2. on a Shopify store, the product's first photo from the store's product data;
  3. the page's product data or preview picture (og:image), unless it is a logo;
  4. in a real browser (needs Playwright), the largest photo near the top of the page.
A link that no longer exists, or now goes to a different product, is reported and gets no photo.
Resizing needs Pillow (pip install pillow); without it the photo is saved as downloaded.
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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "img")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
MAX = 800
# Preview pictures that show the shop rather than the product.
LOGO = re.compile(r"logo|seo_img|placeholder|favicon|/brand/|og-default|share-image", re.I)


def load_entries():
    # wishes.js is plain JavaScript, so let Node read it rather than parsing it by hand.
    js = ("global.window={};require(process.argv[1]);"
          "console.log(JSON.stringify([...window.WISHES,...window.BRANDS]))")
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
        if re.search(r'(property|name)\s*=\s*["\']%s["\']' % re.escape(name), tag, re.I):
            m = re.search(r'content\s*=\s*["\']([^"\']+)', tag, re.I)
            if m:
                return html.unescape(m.group(1)).strip()
    return None


def ld_image(page):
    """The first photo in the page's schema.org Product data."""
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        items = data if isinstance(data, list) else data.get("@graph", [data]) if isinstance(data, dict) else []
        for item in items:
            if not isinstance(item, dict) or "Product" not in str(item.get("@type", "")):
                continue
            img = item.get("image")
            if isinstance(img, list):
                img = img[0] if img else None
            if isinstance(img, dict):
                img = img.get("url") or img.get("contentUrl")
            if isinstance(img, str):
                return img
    return None


def page_image(page, final):
    for src in (ld_image(page), meta(page, "og:image:secure_url") or meta(page, "og:image"), meta(page, "twitter:image")):
        if src and not LOGO.search(src):
            return urllib.parse.urljoin(final, src)
    return None


class Gone(Exception):
    """The product page no longer exists, or now sends you to a different product."""


def handle(url):
    m = re.search(r"/products/([^/?#]+?)(\.js|\.json)?(?:[/?#]|$)", url)
    return m.group(1) if m else None


def check_same_product(url, final, product=True):
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


def find_image(url):
    src = shopify_image(url)
    if src:
        return src
    raw, final = get(url)  # a 404 here is checked again in the browser, as some shops refuse plain requests
    check_same_product(url, final)
    return page_image(raw.decode("utf-8", "replace"), final)


# In the browser: the largest photo near the top of the page, which on a product page is the product.
LARGEST = """() => {
  const seen = [...document.images]
    .map((i) => ({ src: i.currentSrc || i.src, r: i.getBoundingClientRect(), w: i.naturalWidth, h: i.naturalHeight }))
    .filter((i) => i.src && !i.src.startsWith("data:") && i.w >= 300 && i.h >= 300 && i.r.width >= 150 && i.r.top < 1400
      && i.r.height / i.r.width >= 0.75);  // product photos are square or tall; wide ones are banners
  seen.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
  return seen.length ? seen[0].src : null;
}"""


def fetch_with_browser(url, given, product=True):
    """Open the page in headless Chromium, which most shops accept, and download the photo in the same session."""
    from playwright.sync_api import sync_playwright
    # A visible, real Chrome (run under xvfb on a server) gets past bot checks that stop headless browsers.
    headed = os.environ.get("WISHLIST_HEADED") == "1"
    with sync_playwright() as p:
        opts = {"headless": not headed, "args": ["--disable-blink-features=AutomationControlled"]}
        try:
            browser = p.chromium.launch(channel="chrome", **opts) if headed else p.chromium.launch(**opts)
        except Exception:
            browser = p.chromium.launch(**opts)
        try:
            ctx = browser.new_context(user_agent=UA, locale="en-GB", viewport={"width": 1280, "height": 1000})
            page = ctx.new_page()
            page.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined })")
            resp = page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(6000)
            if resp and resp.status in (404, 410):
                raise Gone("the product page no longer exists (%d)" % resp.status)
            check_same_product(url, page.url, product)
            page.mouse.wheel(0, 600)
            page.wait_for_timeout(1500)
            src = given or page_image(page.content(), page.url) or page.evaluate(LARGEST)
            if not src:
                raise ValueError("no product photo found on the page (status %s, title %r)"
                                 % (resp.status if resp else "?", page.title()[:80]))
            src = urllib.parse.urljoin(page.url, src)
            r = ctx.request.get(src, headers={"Referer": page.url})
            if not r.ok and not given:  # the preview picture is broken: use the largest photo on the page
                src = page.evaluate(LARGEST)
                r = ctx.request.get(src, headers={"Referer": page.url}) if src else r
            if not r.ok:
                raise ValueError("photo download returned %d" % r.status)
            return src, r.body()
        finally:
            browser.close()


def save(data, path):
    try:
        from io import BytesIO
        from PIL import Image
    except ImportError:
        open(path, "wb").write(data)
        return
    im = Image.open(BytesIO(data))
    im.thumbnail((MAX, MAX))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    im.convert("RGB").save(path, "JPEG", quality=84, optimize=True, progressive=True)


def fetch(e):
    url = e.get("photoFrom") or e.get("url")
    product = "line" not in e  # shops in "Shops I like" are not single products
    try:
        src = e.get("image") or find_image(url)
        if not src:
            raise ValueError("no product photo in the page's source")
        return src, get(src, "image/avif,image/webp,image/*,*/*")[0]
    except Gone:
        raise
    except Exception as plain_err:
        try:
            import playwright  # noqa: F401
        except ImportError:
            raise plain_err
        print("retry ", e["id"], "in a browser after:", plain_err)
        return fetch_with_browser(url or e["image"], e.get("image"), product)


def main():
    force = "--force" in sys.argv
    only = set()
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    os.makedirs(IMG_DIR, exist_ok=True)
    images, failed = {}, []
    for e in load_entries():
        path = os.path.join(IMG_DIR, e["id"] + ".jpg")
        rel = "img/" + e["id"] + ".jpg"
        if os.path.exists(path) and not force and e["id"] not in only:
            images[e["id"]] = rel
            continue
        if e.get("gone") or (not e.get("url") and not e.get("image")):
            continue
        try:
            src, data = fetch(e)
            save(data, path)
            images[e["id"]] = rel
            print("ok    ", e["id"], "<-", src)
        except Exception as err:  # keep going; report every failure at the end
            failed.append((e["id"], str(err)))
            print("failed", e["id"], "-", err)
            if isinstance(err, Gone) and os.path.exists(path):
                os.remove(path)  # a photo of some other page is worse than none
            elif os.path.exists(path):  # an old photo that was asked to be replaced is kept
                images[e["id"]] = rel
        time.sleep(3)  # be gentle: some shops limit how often one visitor can ask
    with open(os.path.join(ROOT, "images.js"), "w") as f:
        f.write("// Written by tools/fetch_images.py. Each photo comes from the product page linked in wishes.js.\n")
        f.write("window.WISH_IMAGES = " + json.dumps(images, indent=2, sort_keys=True) + ";\n")
    print("\n%d photos, %d failed" % (len(images), len(failed)))
    for id_, err in failed:
        print("  ", id_, err)


if __name__ == "__main__":
    main()
