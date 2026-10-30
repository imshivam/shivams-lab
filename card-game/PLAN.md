# Card game (working title): plan

A playful conversation card game for iPhone, later iPad and the web. Inspired by Gamely's *A Little More Conversation*: pick a card, pick one of its three questions, answer it, pass it on, and the next person answers too.

Started 30 October 2026. Research: `RESEARCH.md`. Interactive version of the research: `playroom/index.html`.

## What we are making

A deck of conversation cards that feels like a real, physical deck. You shake the phone to shuffle, draw a card off the stack, flip it, choose one of its three questions, and pass the phone (or the turn) to the next person, who answers the same question.

## Who it is for, in order

1. **Two people in a room** (a date, a friend, a one-on-one). One phone on the table between you.
2. **A group in a room** (dinner, friends, a team offsite). One phone passed around.
3. **A remote one-on-one or a remote team** (video call). Everyone sees the same card on their own screen. This is the web version.

## Phases

| Phase | Output | Decides |
|---|---|---|
| 0. Research (this) | `RESEARCH.md`, playroom | Which mechanics and sensors are worth it |
| 1. Feel prototype (web) | One page: the deck, shake to shuffle, draw, flip, pick a question, pass. Tested on Shivam's iPhone over HTTPS | Does the physical feel work? Which gestures feel natural, which are gimmicks? |
| 2. Content | Categories, first ~120 questions (3 per card, 40 cards), tone guide | Our own voice. We cannot copy Gamely's questions |
| 3. Design direction | Card art, deck look, sound and haptic palette, name | The identity |
| 4. iPhone app | SwiftUI + Core Motion + Core Haptics, TestFlight via the Lab's GitHub workflow | Native feel, real haptics |
| 5. Remote mode | Web room with a code (Jackbox style) and/or SharePlay on FaceTime | Team icebreakers and remote one-on-ones |
| 6. iPad | Larger table layout for the group-on-a-table case | |

## Core loop (draft)

1. **Pick a deck** (category). Each deck is a stack you can see.
2. **Shake to shuffle.** Cards jostle, a riffle sound and a run of light haptics. Also a button, for people who can't or won't shake.
3. **Draw.** Swipe the top card off the stack. It lands face down in front of you.
4. **Flip.** Tap, or turn the phone over and back. The card turns with a spring.
5. **Choose one of three.** Three questions, from light to deep. You pick one.
6. **Answer, then pass.** "Pass to the next person" hands the turn on. The next person answers the same question (this is what makes it a conversation, not an interview).
7. **Next card** when the question has gone round.

## Open questions for Shivam

- How many decks, and what are they? (The original has five themed rounds per its retailers; you remember four.)
- Do we track turns and names, or keep it anonymous and just "pass"?
- Is there a light "game" layer (a wildcard card, a timer, a skip token), or is it purely conversation?
- Sound on by default?
- Name.

## Constraints

- Questions must be our own. The original's questions are copyrighted.
- Accessibility from day one: every sensor gesture has a tap equivalent, Reduce Motion respected, VoiceOver reads the card.
- Shake and tilt need a real device; the Simulator has no motion sensors.
- On the web, iPhone Safari asks permission for motion, only after a tap, and only over HTTPS.
