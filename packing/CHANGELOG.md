# Changelog

Newest first.

## 4.6 · 1 November 2026 · An opened pouch comes into view

Opening the medicine pouch while scrolled down the toiletry bag folded the toiletry bag away, and the medicine pouch jumped off the top of the screen.
- Now the header you tapped stays where it was while the list above folds. Then the page glides so the opened pouch sits just under the top bar, with its first things showing. With reduced motion turned on, it moves without the glide.
- The same happens when finishing one pouch opens the next.

## 4.5 · 1 November 2026 · A calmer options sheet

The options for one thing looked like the whole page had changed: no visible motion, the same colour as the page, eight choices at once, and a green focus ring on the close button.
- Sheets now slide up from the bottom over a dimmed page and slide down when closed. Sheets are a lighter surface than the page in dark mode. This applies to the options, the menu and Add something. With reduced motion turned on, they appear and close without sliding.
- Options for one thing are cut to four:
  - Pack it in the morning / Pack it tonight instead
  - Buy it there instead / Pack it after all
  - Move to another bag ›
  - Not taking it
  Each label says what happens, and the header says where the thing is now.
- The list of bags and pouches only appears after "Move to another bag", on its own panel with Back. The current one reads "Here now".
- No focus ring on open.

## 4.4 · 1 November 2026 · Morning, buy there, move

From six comments left while packing. Some things are still in use or charging, some will be bought on arrival, some belong in another bag, and several toiletries seemed to be missing (they were hidden in the morning step).
- Each thing has one quiet "more" button. It opens one sheet with these options:
  - **Pack it in the morning**
  - **Buy it there**, at the airport or at the destination
  - **Goes in**: move it to any bag or pouch
  - **Not taking it**, with Undo
- Things for the morning stay in their pouch's overview, under an "In the morning" divider. They don't count against tonight's step, and the pouch header reads, for example, "6 of 6 · 13 in the morning".
- **Tomorrow morning** is now built from everything left for the morning, grouped by where it goes, for example "Into the toiletry bag" and "Into the backpack".
- **To buy there** shows at the top of Your days, and in the menu with a count. Tick each thing once it's bought.
- Changes to the trip plan:
  - The morning toiletries (toothbrush, toothpaste, tongue cleaner, face wash, sinus rinse, moisturisers, hair serum and cream, bidet) now sit in the toiletry bag, marked for the morning.
  - Beard trimmer (charging) and nail clipper are marked for the morning.
  - Lip balm moved to the backpack, marked for the morning.
  - Phone charger is in the backpack, marked for the morning.
- "Start packing again" keeps your moves and the things you're not taking, and clears morning and buy marks.
- Plan fields: `step.bag`, `step.morning`, `item.later`. Progress fields: `where`, `later`, `buy`, `skip`.

## 4.3 · 1 November 2026 · Pouches

Small things were listed one by one ("Shampoo", "Conditioner", "Body wash"…), but they actually go into a pouch first and then into the bag. A plan can now group things by the pouch they go in. Each pouch works like an outfit:
- one pouch is open at a time
- you tick its pieces
- it folds away when done, and the next one opens
- ticking a pouch's circle ticks everything in it
- Suitcase:
  - toiletry bag, with a note to leave room for the morning things
  - medicine pouch
  - glasses kit
  - towel, mints, book and bottle stay as single rows
- Backpack: jewellery pouch (watches, Apple Watch straps, rings, necklaces), after the laptop, iPad, power banks and AirPods.
- An idea you add joins its pouch (deodorant joins the toiletry bag).
- The morning step now says to put each thing in the toiletry bag after you use it.
- Under the hood, outfits and pouches are one kind of group, `step.groups` with `item.group`.

## 4.2 · 1 November 2026 · Suitcase and backpack

The plan assumed a cabin bag, but the trip has one checked suitcase and a backpack. That made it unclear whether the big-bag step meant "pack now".
- "Pack the big bag" is now "Pack your suitcase", with the hint "The one you check in. Pack it now."
- "Pack your cabin bag" is now "Pack your backpack", holding only what can't go in the suitcase: laptop, iPad, AirPods, power banks and valuables.
- Medicines, glasses kit, lip balm, mints, the book, the bottle and the straps moved to the suitcase. Ticks moved with them.
- The liquids-bag idea is gone, since no liquids travel in the backpack.
- Step names now come from the plan (`short`), so a trip can name its own bags.

## 4.1 · 1 November 2026 · Outfits become lists to tick

At "Lay out your clothes", an outfit you'd typed showed as one long paragraph to read. The lines you typed were also squashed together. Now:
- An answer with several pieces becomes a list of tidy, tickable pieces under the outfit's name, for example "Black Uniqlo sweatshirt" or "Olive puffer jacket · Flying out".
- Claude tidies what you typed or dictated:
  - short names that keep the colour and brand
  - a small note when a piece is only for one part of the trip
  - comments dropped
  Without Claude, each line you typed is one piece.
- Only one outfit is open at a time. Tick its pieces, and once it's complete the next one opens. Ticking an outfit's circle ticks all of its pieces.
- A long answer that isn't a list is cut to two lines.
- Your days lists the tidied pieces too.

## 4.0 · 1 November 2026 · One thing per screen (in packing/v4, next to 3.0.2)

Version 3 was overwhelming: every feature showed at once, and the biggest words ("Barcelona", "Decide what you'll wear") didn't say what to do. Version 4 is a redesign built on written principles (DESIGN.md), drawn from GOV.UK "one thing per page", W3C COGA (cognitive accessibility), NN/g and real apps on Mobbin. 3.0.2 is kept as it was, so the two can be compared.

| First screen, iPhone width | 3.0.2 | 4.0 |
| --- | --- | --- |
| Questions shown | 13 | 1 |
| Buttons and fields | 39 | 5 |
| Words | 342 | 23 |
| Page height | 3.9 screens | 1 screen |
| Text styles | 15 | 4 |

- Each question gets its own screen, worded as a question ("What will you wear to the airport?"). Choices are big rows, and tapping one moves you on. "Something else" opens a box to type or dictate.
- Each packing step shows one instruction, one short hint and the things to tick. One button at the bottom fills in when the step is done.
- A seven-part bar at the top shows where you are, replacing the step rail and the "Step 1 of 7 · 0 of 13 done" line.
- These moved into one menu, which also shows the trip name:
  - adding things
  - the steps
  - your days
  - starting again
- Ideas you didn't mention are folded into one row. You can add or skip each one, and they no longer count against a step until you add them.
- "Add something" replaces both the add box and "Thought of something?". Claude sorts what you say into the right steps.
- One symbol per step, plus symbols for wear, gym, night and the event in Your days.
- The sync status only shows when you're offline.
- The trip plan has shorter wording (`q`, `tip`, `do`, `icon`, `tips`), which version 3 ignores.
- Tested at 320px and 375px, light and dark:
  - questions and auto-advance
  - ticking
  - ideas, and adding with and without Claude
  - offline and back
  - reset
  - signed out, outside Claude, and no answer
  - back and forward across steps

## 3.0.2 · 1 November 2026 · QA fixes

A full QA pass: 22 checks in test/QA.md, run at 320px and 375px in light and dark mode. Fixed:
- "Start packing again" deleted the things you'd added yourself. It now clears only ticks and answers, as it says.
- A typed answer could be lost if you closed the app within half a second. It's now kept on the device straight away.
- An update from your other device that arrived while you were typing could be held back until you typed again. It now applies when you leave the box, tap anywhere, or come back to the app.
- The same thing could be added twice, by typing it or through Claude's sorting. Duplicates are skipped, with a note.
- With no saved trip, being offline or signed out told you to "tell Claude about your trip". It now says what's actually wrong.
- Outside Claude, the same message appeared twice.
- The step rail could hide the current step off to the side. It now scrolls it into view.
- Long answers showed one line after a reload. The box now grows to fit.
- The step rail now reads as navigation to VoiceOver, and there's no empty badge on a day with nothing to pack.

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
