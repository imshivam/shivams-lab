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

- Wishes and shops live in `wishlist/wishes.js`. Each wish has a stable `id`; don't rename one after the page is shared.
- Photos, link checks and prices are kept up to date by `wishlist/tools/fetch_images.py`, which GitHub Actions runs on the 1st of every month and whenever `wishes.js` changes (`.github/workflows/wishlist-photos.yml`). Each run's summary lists dead links, price changes and photos it couldn't get.
- If a shop blocks automated visits, set `photoFrom` on the wish to another shop's page for the same product. If a page's photo is wrong, set `image` to the right photo's address.
- The page has its own copy of the Lab's design system (`wishlist/base.css`), so changes to the Lab's `styles.css` can't break it.
