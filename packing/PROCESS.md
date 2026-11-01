# How Packed 3 was made

A record of the double diamond for Packed 3.0 (1 November 2026). For each phase it covers what was done, what was found, and what moved on to the next phase and why. Personal details from the brief (the trip, the items, the calendar) are kept out of this public file. They live only in Shivam's private Claude storage.

## The brief

Shivam was flying to Barcelona the next morning for twelve days. Typing items into Packed 2 "wasn't cutting it". Instead he talked through his packing in one long voice note:
- what he does each morning
- what he'll wear on each kind of day
- things he noticed around the house
- open questions, such as an outfit for an event, whether to bring a jacket, and new boots to buy

He asked for help working out what to pack first, what next, and what last. He also wanted something he can come back to next trip.

## 1. Discover

**What was done**
- Took the voice note apart into about 70 separate things, decisions and open questions. Merged in 14 toiletries he'd added on his iPad the night before; Packed 2.1's sync had put them in his account.
- Read his calendar for the trip dates. His work event wasn't there (the calendar is his personal one), but there was a daily evening routine that implies supplements and the gym.
- Searched his email for a booking to confirm the airline and the apartment, and found none. The trip was probably booked through work.
- Desk research:
  - Barcelona's November climate
  - UK and Spanish airport rules for liquids
  - 2026 power bank rules
  - Spain's plug type
  - ADHD packing advice: ADDitude, Understood, and practitioner write-ups
  - styling for a black-and-pink "glam" dress code
- Looked at how existing apps handle packing, using Mobbin: Wanderlog, Trip.com, Whering and Alta.

**What was found**
- **How he thinks:** he can only picture packing a day at a time. His attention jumps, so a voice note captured far more than typing ever did. Talking is the right way to get things in.
- **His own words point to the goal:** "just look at one thing and just do that… feel confident". He needs one step on screen at a time, not a long list.
- **Some things block everything else.** Outfits, the event look, boots and the warm layer have to be decided before anything goes in a bag. One of them (buying boots) is time-boxed: London shops close around 6pm on Sundays, and most Barcelona shops are closed on Sundays.
- **Some steps have a natural order:**
  - Charging takes hours, so it comes first.
  - Things used on the morning of departure are packed last.
  - Liquids in the checked bag sidestep the 100ml rule, which Barcelona airport still applies on the way home.
  - Power banks can only go in the cabin bag, two at most.
  - Valuables, medicine and tech go in the cabin bag in case the checked bag is late.
- **ADHD sources agree on this approach:**
  - short, specific steps
  - laying things out physically to see what's missing
  - deciding outfits early
  - a final check at the door
- **Every app reviewed works the same way:** one long list by category (Trip.com, Wanderlog) or a wardrobe grid (Whering, Alta). None of them puts the steps in order or shows one step at a time, which is exactly the shape that failed him in 1.0 and 2.0.
- **Gaps he didn't mention:**
  - a plug adapter
  - an Apple Watch charger
  - deodorant
  - a weekend outfit
  - a laundry bag
  - liquids-bag rules for the sprays

**Carried into Define:** the item list, the four facts that decide the order (charge time, morning use, liquids, power banks), the decisions that block packing, and the finding that every existing app is a list.

## 2. Define

**Problem:** Shivam can't hold a packing list in his head or build one by typing. He pictures his days and talks, and he needs to be told the next single thing to do until he's sure everything is in.

**How might we** turn what Shivam says out loud into a packing run he does one step at a time, which gets quicker every trip?

**Principles**
1. **Talk, don't type.** Claude builds the plan from what he says. The page never asks him to build a list.
2. **One thing at a time.** One step on screen, with Next.
3. **Decide before packing.** Open questions come first, as blanks to fill.
4. **Days are the check.** A day-by-day view shows whether each day's things are in the bag.
5. **Only his things.** Anything he didn't say is marked as a suggestion and can be dismissed. This carries forward the lesson from 1.0.
6. **Next trip starts here.** His items stay. Only the ticks and answers reset.

**Carried into Develop:** the problem, these six principles, and the order of the steps.

## 3. Develop

**Options considered**
- **A. A better list by category.** Rejected: this is what every app does, and it's what failed in 1.0.
- **B. Packed 2's day planner, with more typing.** Rejected as the main view. Typing was the problem. Its day-by-day picture is kept as the Days view (principle 4).
- **C. A guided packing run, chosen.** Seven steps in the order things should happen: decide, charge, lay out, big bag, cabin bag, morning, door. One step shows at a time, with progress and a rail to jump between steps.
- **D. "Thought of something?"** Added to C. He dictates into a box and Claude sorts each thing into the right step (the artifact's `sample` capability). This keeps talking as the way in on future trips, without needing a Claude Code session.

**Why C + D:** C does what he asked for: an order, and one thing at a time. D covers the second goal of reusing it next trip by talking. Together they follow all six principles.

**Carried into Deliver:** the step structure, the data model (a plan written by Claude, plus progress that the page writes), and a test plan.

## 4. Deliver

**What was built:** Packed 3.0.
- **Pack:** shows one step at a time.
- **Decide step:** blanks to fill, with tap-to-pick options where there are only a few sensible answers.
- **Suggestions:** set apart under "You didn't mention these", each with ×.
- **Adding:** add to any step, or say it and let Claude sort it.
- **Days:** one card per day of the trip showing what you'll wear and do, and whether that day's things are packed.
- **Where it's saved:**
  - The plan and progress are two documents in the artifact's private per-person storage. Progress is written as small merged changes, so ticks from two devices don't overwrite each other.
  - The last copy stays on the device, so it works offline at the airport.
  - The GitHub Pages copy holds no trip data, so nothing personal is public.

**Tested** in a browser at phone size with a stand-in account:
- answers and options save
- ticks and the counts update
- dismissing a suggestion, with Undo
- adding items
- Claude's sorting, with a stand-in answer
- changes from another device appear
- an old copy on one device doesn't overwrite newer ticks from another
- light and dark mode

**Not tested:** the real Claude account on his phone. The browser pane wasn't signed in to Claude.

## What we learned

- **Capture by voice and organise with Claude.** That beat every form of in-app typing for this person, and it's worth reusing in other personal tools.
- **Decisions are tasks too.** Putting them first, with a deadline where there is one (shops shutting), turned "I haven't figured it out" into a step.
- **A mistake.** While setting up the test server, a shared dev-server config file was overwritten and then rebuilt from past sessions. Next time, read a shared config before writing to it.
- **Data gaps.** The work calendar and the trip booking weren't reachable. The event date and the apartment's towels and laundry stayed as questions for Shivam rather than guesses.

## Sources

- Barcelona November climate: [weather2travel](https://weather2travel.com/spain/barcelona/november/), [holiday-weather](https://www.holiday-weather.com/barcelona_airport/averages/november/)
- UK liquids rules 2026: [Which?](https://www.which.co.uk/news/article/100ml-rule-at-uk-airport-security-new-scanners-avLDH4E9xSVg)
- Barcelona airport liquids: [The Local Spain](https://www.thelocal.es/20250826/when-will-airports-in-spain-scrap-the-100ml-liquids-rule), [Euro Weekly News](https://euroweeklynews.com/2026/02/02/goodbye-100ml-rule-where-europes-airports-now-let-you-fly-with-full-size-liquids/)
- Power banks 2026: [Lufthansa Group](https://business.lufthansagroup.com/gb/en/program/experts/news/power-banks-on-board--updated-regulations-from-january-2026), [AirHelp](https://www.airhelp.com/en-int/blog/power-bank-electronics-on-a-plane/)
- ADHD and packing: [ADDitude master packing list](https://www.additudemag.com/download/master-packing-list/), [Understood](https://www.understood.org/en/blog/adhd-and-travel-expert-tips-for-a-smooth-journey)
- App patterns (Mobbin): [Wanderlog checklist](https://mobbin.com/flows/45d647b3-4be4-443e-876c-2d20ee32cdc3), [Whering packing list](https://mobbin.com/flows/31b343b8-bb61-42a7-9dde-04f471d944c3), [Alta](https://mobbin.com/flows/d8d2a20f-a756-45e8-b040-e0910d38b003), [Trip.com](https://mobbin.com/flows/7c8267e0-8920-4c4a-8314-83c98f6ceedc)
