# Shivam's Lab

Everything I've made with Claude, in one place: apps, websites and artifacts.

Live: https://imshivam.github.io/shivams-lab/

## Add a project

1. Open `data.js` and copy an entry.
2. Change the details. `kind` is `app`, `web` or `artifact`. `updated` (YYYY-MM-DD) controls what shows under Latest.
3. Pick an icon from `icons.js`, or draw a new one there on the 100 × 100 grid.
4. Optional: add a screenshot to `assets/shots/` and set `shot`. Only use pictures without personal data, because this page is public.

The design follows Apple's Human Interface Guidelines (see `REVIEW.md`) and research into Apple's most magical motion design (see `MAGIC.md`).

When you change the site, add an entry to `changelog.js`. It feeds the Version History page (`changelog.html`).

## Wish list

`wishlist/` is a separate page: things I'd love as gifts, at https://imshivam.github.io/shivams-lab/wishlist/

- Wishes and shops live in `wishlist/wishes.js`. Each wish has a stable `id`; don't rename one after the page is shared, because reservations will be keyed on it later.
- Photos come from each product page. After adding a wish, run `python3 wishlist/tools/fetch_images.py` from the repository root. It saves the page's preview picture to `wishlist/img/` and lists it in `wishlist/images.js`. If a page's picture is wrong, set `image` on that wish to the right photo's URL and run it again with `--force`.
- It reuses the Lab's `styles.css`, so both pages share one design system.
