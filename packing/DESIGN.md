# Packed 4: design principles and plan

Version 3 worked, but it was hard to use. Shivam opened it and his eye went to "Barcelona" and "Decide what you'll wear". Neither told him what to do. The rest of the screen was text, text, text. This file covers what was wrong, the principles version 4 is built on, and how each screen follows them.

## 1. What was wrong (audit of 3.0.2, first screen, iPhone width)

| Measure | 3.0.2 |
| --- | --- |
| Questions on the first screen | 13, all at once |
| Buttons and text fields on the page | 39 |
| Words on the page | 342, of which 105 fit on the first screen |
| Page height | 3.9 screens of scrolling |
| Different text styles (size, weight, colour) | 15 |
| Biggest things on screen | The trip name and the step name, which don't tell you what to do |

Every feature showed at once:
- the step rail
- the counter
- the explanation
- the progress meter
- the questions
- the add box
- Back and Next
- "Thought of something?"
- the sync note
- "Start packing again"

Nothing was clearly first, so nothing was.

## 2. Principles

Each principle is drawn from a credible source and from looking at real apps.

1. **One job per screen.** A screen asks one question, or shows one small set of things to do. Sources: GOV.UK "one thing per page"; W3C COGA 4.4.9 "Separate each instruction".
2. **The biggest thing on screen is what to do now.** Use the question or the instruction itself, such as "What will you wear to the airport?" or "Put these on charge". Never the trip name or a category label. Source: COGA 4.2.1 "Make the purpose of your page clear" and 4.3.4 "Make it easy to find the most important actions".
3. **One main button, always in the same place.** It sits at the bottom, where your thumb is. It fills in when you're ready to move on. Sources: COGA 4.6.2 "Make short critical paths"; Apple HIG.
4. **Three levels of text, no more.**
   - What to do: large and bold.
   - The things themselves: regular.
   - A short hint: small and grey.
   Everything else is cut or moved. Sources: COGA 4.4.5 "Keep text succinct" and 4.6.3 "Avoid too much content".
5. **Show progress as a picture, not a sentence.** A segmented bar at the top replaces "Step 1 of 7 · 0 of 13 done". Source: COGA 4.2.4 "Make each step clear".
6. **Hide what you don't need right now.** These sit behind one menu:
   - adding things
   - the days
   - jumping between steps
   - starting again
   Ideas Claude suggests stay folded until you open them. The sync status only shows when something is wrong. Sources: NN/g progressive disclosure; COGA 4.6.1 "Limit interruptions".
7. **Icons only where they help you recognise something faster.** Each of the seven steps has one symbol, and so do the repeated parts of a day (wear, gym, night). There are no icons on individual items and no illustrations. Source: COGA 4.2.7 "Use icons that help the user".
8. **Tapping is faster than typing.** Choices are big, full-width rows, and picking one moves you on. Typing is there when you want your own words, one tap away. Sources: real one-question screens in Cleo, MyFitnessPal and Me+, seen on Mobbin.
9. **Nothing moves under your finger.** Ticked things stay where they are and go grey. Source: Apple HIG on stable layouts.

## 3. What each screen does now

- **Top bar:**
  - Back.
  - The seven-part progress bar, which opens the menu.
  - A menu button.
  - The trip name only appears in the menu.
- **A question (step 1):**
  - The question, large.
  - One short hint.
  - The choices as big rows, with "Something else" to type your own.
  - One button: "Next", or "Skip for now" while nothing is chosen.
  - Thirteen questions become thirteen calm screens, each with a small "3 of 13" counter so you know where the end is.
- **A packing step:**
  - The instruction, large.
  - One short hint.
  - Big rows to tick.
  - Ideas you didn't mention fold into one row at the end.
  - One button for the next step, which fills in when everything is ticked.
- **Menu:**
  - The trip and its dates.
  - Add something, by typing or saying it. Claude sorts it into the right step.
  - The seven steps with what's left in each.
  - Your days.
  - Start again.
- **Days:**
  - Each day is a card, with a symbol per line (wear, evening, gym, night).
  - A short "good to know" list at the top.
- **All packed:** one tick and one sentence.

## 4. Measured result

See the table in CHANGELOG 4.0. It is taken the same way as the audit above.

## Sources

- GOV.UK Design System, [question pages](https://design-system.service.gov.uk/patterns/question-pages), and GDS, [one thing per page](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/)
- W3C, [Making Content Usable for People with Cognitive and Learning Disabilities (COGA)](https://www.w3.org/TR/coga-usable/), design patterns 4.2.1, 4.2.4, 4.2.7, 4.3.4, 4.4.5, 4.4.9, 4.4.10, 4.6.1–4.6.3
- Nielsen Norman Group, [managing visual complexity](https://www.nngroup.com/videos/managing-visual-complexity/): predictable places, clear hierarchy, progressive disclosure
- Apple Human Interface Guidelines: hierarchy, layout and consistency
- Real screens on Mobbin:
  - one question at a time: [Cleo](https://mobbin.com/screens/bcbee3ed-e21f-46e9-872d-fcb3013ee223), [MyFitnessPal](https://mobbin.com/screens/2e29bccc-ee71-4b9f-b59e-9efc0d7df557), [Me+](https://mobbin.com/screens/594a1cfb-101c-40da-a436-ac6a44456820)
  - short checklists with one button: [Numo](https://mobbin.com/screens/18dcb032-3a08-48e1-9760-c682d602fc06), [Asana](https://mobbin.com/screens/1e24b1d6-bf16-4a38-871d-bdacbfabc8cf)
- ADHD-specific design: no peer-reviewed guidance for adults turned up. The practitioner advice found agrees with COGA: fewer choices, smaller chunks, and forgiving when you skip. COGA is used as the standard here.
