# Changelog

Newest first.

## 0.1 · 31 October 2026 · First kit and the Card Game board

- `ref.py` collects real references:
  - App Store screenshots through Apple's search API
  - any image link, such as a Mobbin screen
  - a page's share image
  - YouTube moments, with `peek` to choose the moment by eye and `clip` to cut a short, silent, looping MP4
  - Every asset is logged in `library.json` with its source and date.
- `board.py` builds a private Keep / Drop board from the library. Picks and notes are saved in the artifact's database, so Claude can read them and narrow the next round.
- First board: Card Game, 73 assets in six directions (printed, editorial, playful, holographic, arcade, tabletop): 61 screenshots and 12 clips.
- Why: Shivam asked for real references instead of drawn stand-ins, and for tools that keep this working beyond one project. Assets stay on this Mac and in private artifacts because they belong to their makers. Only the code goes to the Lab.
