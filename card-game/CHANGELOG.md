# Changelog

Newest first.

## 0.4 · 31 October 2026 · Openers and the apps already out there

- `RESEARCH.md` covers:
  - **Openers**, the closest rival Shivam found: an in-person question card app with 10,000+ questions, three depths per deck and a strong illustrated look, from one indie developer with 23 US ratings
  - **21 Questions, Get Closer, Gottman Card Decks, Party Qs and Flamingo Cards**, with their rating counts
  - what is still open for us: three questions per card, the pass, the physical feel and remote play
- The reference board has a new "Already out there" section with 17 store screenshots from these apps.
- `RESEARCH.md` explains why my first search missed Openers: brand-name queries, a search engine that isn't Google, and no sweep of the App Store itself. Competitor scans now include an App Store keyword sweep and plain shopper-style queries.

## 0.3 · 31 October 2026 · Real references

- New private reference board with 73 real screenshots and clips from games and apps, grouped into six visual directions: printed, editorial, playful, holographic, arcade, tabletop. Each one has Keep / Drop and a note, saved where Claude can read them back. https://claude.ai/artifact/5odjRkw1ivwmXGFKZ8AuDR
- In the private playroom artifact, "In the wild" now shows real footage and screens instead of drawings: Gamely's box, WNRS and Esther Perel's decks in hand, Heads Up, a TCG Pocket pack reveal, Balatro, Jackbox, Donut and others. The Swipe, Tilt, Flip and Room code mechanics show a real example too. `playroom/make-private.py` builds this copy.
- The public Lab page keeps the drawings and links, because the screenshots and footage belong to their makers.
- Why: Shivam said drawn stand-ins don't help him decide, and real assets do. The tools that collect them live in `~/Documents/references` (the Reference Kit), so any project can use them.

## 0.2 · 30 October 2026 · Visual references

- Every mechanic, app, principle and sensor in the playroom now has a small animated diagram: the phone shaking, the card swiping off, the pack tearing in TCG Pocket, the Heads Up nod, depth as steps going down, and so on. Sensors get an icon each.
- Mechanics and apps get a "Watch examples" or "See it" link to real footage or the official page.
- Why: Shivam asked for visuals beside each item. The diagrams are drawn in the page rather than taken from the apps, because the page is public and artifacts can't load outside images. They animate only while on screen and stop with Reduce Motion.

## 0.1 · 30 October 2026 · Research and playroom

- Researched the original game (Gamely's *A Little More Conversation*), other conversation games and apps, games that use the phone's body (Heads Up, Ocarina, TCG Pocket, Balatro), remote icebreakers, and what each iPhone sensor can do in a native app versus the web. Written up in `RESEARCH.md` with sources.
- Wrote `PLAN.md`: who it's for, the core loop, seven phases from research to iPad, and open questions.
- Built the playroom (`playroom/index.html`): a live deck with shake to shuffle, swipe to draw, tap to flip, choose one of three, pass across the table, tilt shine, face down to talk and blow to draw, with sound, haptics where the browser allows, a live sensor readout, and the research as a browsable guide.
- Why a web playroom first: it runs on Shivam's iPhone today over HTTPS, so we can feel which gestures work before building the app. The questions in it are placeholders I wrote; Gamely's are copyrighted.
- Published at https://imshivam.github.io/shivams-lab/card-game/ (motion works here) and as an artifact at https://claude.ai/artifact/1d5PF4Jm4JCXPV5a8K77n2 (motion is blocked inside artifacts; buttons work).
