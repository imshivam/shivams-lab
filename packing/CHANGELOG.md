# Changelog

Newest first.

## 3.0.1 · 1 November 2026 · Sync note fix

- The note under the list could stay on "Connecting…" when this device already had the latest plan. It now says the plan is saved to your account.
- The project now has its own folder, ~/Documents/packed: the app, trips, test page, changelog and process record.

## 3.0 · 1 November 2026 · Pack one step at a time

- Rebuilt around a packing run. Pack shows one step at a time, in the order things should happen: decide what you'll wear, put things on charge, lay out clothes, pack the big bag, pack the cabin bag, the morning of departure, and the door. A rail shows where you are and lets you jump between steps.
- Decisions come first, as blanks to fill. Where there are only a few sensible answers (which day, buy or bring), you can tap one.
- Things you didn't mention are kept apart under "You didn't mention these", and each one can be dismissed.
- Add something to any step, or tap "Thought of something?", say it out loud, and Claude puts each thing in the right step.
- Days shows the trip a day at a time: what you'll wear, gym, night, and whether that day's things are packed.
- Claude writes the plan from what you tell it, into your private storage. The page saves your ticks and answers as small changes, so two devices ticking at once don't overwrite each other, and it keeps working offline.
- "Start packing again" clears ticks and answers but keeps your items for the next trip.
- The GitHub Pages copy no longer holds any trip; it links to the Claude version.
- How it was made, step by step: PROCESS.md.
- Why: typing items in wasn't working for Shivam. He talks through his packing and pictures it a day at a time, and asked to be told what to pack first, next and last, one thing at a time.

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
