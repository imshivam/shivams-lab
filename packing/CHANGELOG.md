# Changelog

Newest first.

## 2.1 · 31 October 2026 · Same plan on every device

- In Claude, the plan is now saved to your Claude account (the artifact's private per-person storage), so the iPad and iPhone show the same trip. Changes from another device appear while the page is open; if you're typing, they wait until you finish.
- The first time a device connects, a plan that only that device has is uploaded rather than replaced, so items added earlier on one device aren't lost.
- The note under the list says where the plan is saved. The Lab's GitHub Pages copy can't reach your account, so it stays on one device and links to the Claude version.
- The Lab's main "Open Packed" link now goes to the Claude version.
- Why: Shivam added items on his iPad and didn't see them on his iPhone, because 2.0 only saved in each browser.

## 2.0 · 31 October 2026 · Plan by day

- Rebuilt from scratch. It now starts empty and adds nothing you didn't choose.
- Plan tab: a card for each day with a short plan ("Beach", "Travel") and what you'll wear and need. A Whole trip card holds things you use every day, like a toothbrush.
- When you add to a day, things already in your trip are offered again, so a shirt worn on two days is one item.
- Pack tab: every item once, with the days it's for. Tick things off and set how many to bring.
- Optional first-day date turns "Day 1" into real dates. Remove a day or an item with Undo; start a new trip with a confirm step.
- Why: Shivam said 1.0 assumed too much and filled the list for him. He wanted help planning, and chose planning by day out of three options.

## 1.0 · 31 October 2026 · First version

- Trip details: destination, nights away, leaving date, weather (warm, cold, rain), what you'll be doing (city, beach, hiking, work, snow sports), going abroad, flying, hand luggage only, laundry there.
- The list is built from those details. Clothes are counted by nights, capped at four days' worth when you can do laundry. Passport, adapter and offline maps appear when going abroad; the liquids bag when flying with hand luggage only.
- Tick items off as they go in the bag. "To pack" shows only what's left. Edit removes items (with Undo) and can put them back; anyone can add their own items to any section.
- Two extra sections: "Pack on the day" for things you use until you leave, and "Before you leave" for jobs at home.
- Copy the list as text, untick everything for the next trip, and the list is saved in the browser.
- Follows the device's light or dark setting. Also published as a private artifact: https://claude.ai/artifact/B6fncirqAZDzv2kv8ckzdi
- Why: Shivam asked for an interactive web app that makes packing before a trip easy.
