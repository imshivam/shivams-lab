#!/usr/bin/env python3
"""Fetch a photo for every wish and shop from its product page.

Run from the repository root:  python3 wishlist/tools/fetch_images.py
Add --force to fetch again photos that already exist.

For each entry in wishlist/wishes.js with a url, it reads the product page's preview picture
(og:image, else twitter:image, else the first image in the page's product data), saves it as
wishlist/img/<id>.jpg (at most 800 px, on white) and lists it in wishlist/images.js.
An entry's `image` field, if set, is used instead of the page's picture.
Resizing needs Pillow (pip install pillow); without it the photo is saved as downloaded.
If a shop refuses a plain request and Playwright is installed (pip install playwright;
playwright install chromium), it tries again in a real browser.
"""

import html
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "img")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
MAX = 800


def load_entries():
    # wishes.js is plain JavaScript, so let Node read it rather than parsing it by hand.
    js = ("global.window={};require(process.argv[1]);"
          "console.log(JSON.stringify([...window.WISHES,...window.BRANDS]))")
    out = subprocess.check_output(["node", "-e", js, os.path.join(ROOT, "wishes.js")])
    return json.loads(out)


def get(url, accept="text/html,*/*"):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept, "Accept-Language": "en-GB,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read(), r.geturl()


def meta(page, name):
    for tag in re.findall(r"<meta\b[^>]*>", page, re.I):
        if re.search(r'(property|name)\s*=\s*["\']%s["\']' % re.escape(name), tag, re.I):
            m = re.search(r'content\s*=\s*["\']([^"\']+)', tag, re.I)
            if m:
                return html.unescape(m.group(1)).strip()
    return None


def ld_image(page):
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        for item in data if isinstance(data, list) else [data]:
            img = item.get("image") if isinstance(item, dict) else None
            if isinstance(img, list):
                img = img[0] if img else None
            if isinstance(img, dict):
                img = img.get("url")
            if isinstance(img, str):
                return img
    return None


def find_image(url):
    raw, final = get(url)
    page = raw.decode("utf-8", "replace")
    src = meta(page, "og:image:secure_url") or meta(page, "og:image") or meta(page, "twitter:image") or ld_image(page)
    return urllib.parse.urljoin(final, src) if src else None


def fetch_with_browser(url, given):
    """Open the page in headless Chromium, which most shops accept, and download the photo in the same session."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(user_agent=UA, locale="en-GB", viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(4000)
        src = given
        if not src:
            content = page.content()
            src = meta(content, "og:image:secure_url") or meta(content, "og:image") or meta(content, "twitter:image") or ld_image(content)
        if not src:
            browser.close()
            raise ValueError("no preview picture on the page")
        src = urllib.parse.urljoin(page.url, src)
        r = ctx.request.get(src, headers={"Referer": page.url})
        if not r.ok:
            browser.close()
            raise ValueError("photo download returned %d" % r.status)
        data = r.body()
        browser.close()
        return src, data


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


def main():
    force = "--force" in sys.argv
    os.makedirs(IMG_DIR, exist_ok=True)
    images, failed = {}, []
    for e in load_entries():
        path = os.path.join(IMG_DIR, e["id"] + ".jpg")
        rel = "img/" + e["id"] + ".jpg"
        if os.path.exists(path) and not force:
            images[e["id"]] = rel
            continue
        if not e.get("url") and not e.get("image"):
            continue
        try:
            try:
                src = e.get("image") or find_image(e["url"])
                if not src:
                    raise ValueError("no preview picture on the page")
                data, _ = get(src, "image/avif,image/webp,image/*,*/*")
            except Exception as plain_err:
                try:
                    import playwright  # noqa: F401
                except ImportError:
                    raise plain_err
                print("retry ", e["id"], "in a browser after:", plain_err)
                src, data = fetch_with_browser(e.get("url") or e["image"], e.get("image"))
            save(data, path)
            images[e["id"]] = rel
            print("ok    ", e["id"], "<-", src)
        except Exception as err:  # keep going; report every failure at the end
            failed.append((e["id"], str(err)))
            print("failed", e["id"], "-", err)
    with open(os.path.join(ROOT, "images.js"), "w") as f:
        f.write("// Written by tools/fetch_images.py. Each photo comes from the product page linked in wishes.js.\n")
        f.write("window.WISH_IMAGES = " + json.dumps(images, indent=2, sort_keys=True) + ";\n")
    print("\n%d photos, %d failed" % (len(images), len(failed)))
    for id_, err in failed:
        print("  ", id_, err)


if __name__ == "__main__":
    main()
