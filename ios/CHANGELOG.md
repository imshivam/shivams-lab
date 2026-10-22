# My Week changelog

On TestFlight the app is called **In a day**. Newest first.

## Build 8 · 22 October 2026

- Apple Watch gets its own Live Activity in the Smart Stack: the same zoomed-in strip as the iPhone, with only the current block lit and the rest of the day dimmed (W7 on the Live Activity canvas). Before, the watch reused the small Dynamic Island pieces.

**Why:** the watch should match the iPhone design rather than be a separate idea. Tried a self-updating clock in the pill; iOS draws self-updating text wider and greyed out, so the pill keeps the time of the line.

## Build 7 · 22 October 2026

- A new app icon: a frosted strip of the day on a clay-red ground, with the current block in front, the now-line through it and the pill below. It has its own dark and tinted versions.
- The source drawings are in `ios/design/`.

**Why:** picked from eight glass versions of the day ribbon (G3 on the icon canvas), made after studying how Apple's 2025 icons are built: a lit gradient ground, a few thick translucent layers, edge light. The old icon was a tiny copy of the app's screen, which Apple's guidelines advise against.

## Build 6 · 22 October 2026

- The Live Activity shows again. Build 5's version crashed while iOS drew it on the Lock Screen, so it never appeared.
- The current-time line and its pill stay a third of the way across the card. The strip of the day slides left under them, instead of the pill moving along it.
- The time left reads "9 minutes left" and counts down by itself.

**Why:** a fixed pill is easier to find at a glance, and it matches how the app keeps now in the middle. The crash came from laying the card out before iOS knew its width; the layout now falls back to a phone's width.

## Build 5 · 22 October 2026

- A new Live Activity: the current block and time left, then a zoomed-in strip of the day with a peek of the block before and after. The current block has a border and a tick every 10 minutes, with a current-time line and pill, and what's next at the bottom right.
- It follows the phone's light or dark setting.
- Background refresh asks to run every 15 minutes, so the line keeps moving.

**Why:** chosen from eight Live Activity ideas and eight variations of the day ribbon (the Live Activity canvas). iOS can't animate a Live Activity continuously, so the line moves when the app updates it.

## Build 4 · 22 October 2026

- The day picker shows only the day names. WORK and FREE are gone.

**Why:** each day's page already says whether it's a workday or the weekend.

## Build 3 · 22 October 2026

- The header shrinks to one line while you scroll into the day, and grows back when you scroll up. The "minutes until" line hides while it's small.
- The minimum iOS version is now 18.

**Why:** build 2 tracked scrolling in a way that never fired inside the swipeable day pages. iOS 18's scroll tracking works there and ignores the app's own scrolling.

## Build 2 · 22 October 2026

- Opening the app puts the current-time line in the middle of the screen.
- More space under the day picker.

**Why:** the app scrolled to the middle of an invisible spacer above the line, so it often showed empty space.

## Build 1 · 22 October 2026

- First TestFlight build: the weekly timetable, Home Screen and Lock Screen widgets, a Live Activity and the Dynamic Island.

**Why TestFlight:** the paid Apple developer account means builds last 90 days and reach the phone without the Mac, like Stay Connected and Joint Finances.
