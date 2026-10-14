// Version History for Shivam's Lab. Newest first. Screenshots live in assets/changelog/<version>/.

window.VERSIONS = [
  {
    version: "2.1",
    date: "2026-10-14",
    title: "A second look at the magic",
    summary:
      "After building v2, I checked each idea against what I meant it to do. Six things fell short, so I fixed them.",
    changes: [
      "The flask's liquid is now a deep violet you can actually see. It fills up from empty when the page opens.",
      "A small flask sits beside the toolbar title once you scroll, so you can still see the liquid slosh.",
      "On Mac, icons only come alive when you point at them, not all at once when the page loads.",
      "Light icons are softened in Dark Mode so they no longer glow.",
      "Tile descriptions get a third line, so short ones are no longer cut off.",
      "Projects with a screenshot get a shorter header in their sheet, so the page doesn't show two big pictures in a row.",
    ],
    why:
      "The flask was meant to be the Lab's signature moment, but it read as a static logo and scrolled away before anyone saw it move. Icons waking up on their own on Mac broke the rule that motion only happens when you act.",
    shots: [
      { src: "assets/changelog/v2.1/phone.jpg", alt: "v2.1 on iPhone: violet liquid in the flask", kind: "phone" },
      { src: "assets/changelog/v2.1/phone-scrolled.jpg", alt: "v2.1 on iPhone, scrolled, with the small flask in the toolbar", kind: "phone" },
      { src: "assets/changelog/v2.1/desktop-dark.jpg", alt: "v2.1 on Mac in Dark Mode", kind: "wide" },
    ],
  },
  {
    version: "2.0",
    date: "2026-10-14",
    title: "A lab that’s alive",
    summary:
      "A rethink based on research into the Apple moments people call magical, from the torch in the Dynamic Island to the iPhone Duo opening.",
    changes: [
      "Projects are now grouped by the month you made them, newest first, instead of by type.",
      "Each project has a large colour tile with its icon, in a grid like the App Library.",
      "Every icon acts out its project: Brushwork paints itself, the Empires globe turns, the money pouch catches a coin, the stamp winks, the festival bars bounce.",
      "Tap a tile and it grows into the project sheet. Close it and the sheet shrinks back into the tile.",
      "The flask is now a button. Its liquid sloshes when you scroll, and tapping it bubbles over and opens a random project.",
      "On Mac, a soft light follows the pointer across each tile.",
      "This Version History page.",
    ],
    why:
      "v1.1 followed the guidelines, but it had no moment. It looked like an App Store page. The research found that Apple's magic comes from the interface becoming the thing itself, from motion that starts where it came from, and from staying quiet until you act.",
    report: { label: "Read the research and critique", url: "https://github.com/imshivam/shivams-lab/blob/main/MAGIC.md" },
    shots: [
      { src: "assets/changelog/v2.0/phone.jpg", alt: "v2.0 on iPhone: a timeline of colour tiles", kind: "phone" },
      { src: "assets/changelog/v2.0/phone-sheet-dark.jpg", alt: "v2.0 project sheet in Dark Mode", kind: "phone" },
      { src: "assets/changelog/v2.0/morph.jpg", alt: "Mid-transition: a tile growing into the project sheet", kind: "wide" },
      { src: "assets/changelog/v2.0/ipad.jpg", alt: "v2.0 on iPad", kind: "tablet" },
    ],
  },
  {
    version: "1.1",
    date: "2026-10-14",
    title: "Apple design review",
    summary: "A full review against Apple’s Human Interface Guidelines found 17 problems. All are fixed.",
    changes: [
      "Grey and blue text now meets Apple’s minimum contrast.",
      "The top bar blurs the content under it, so its title stays readable.",
      "On iPad and Mac, rows sit in two or three columns, so there are no empty gaps.",
      "Project sheets have one main button. Other links are in a list.",
      "Dark Mode panels no longer glow, and tap targets are at least 44 points.",
    ],
    report: { label: "Read the full review", url: "https://github.com/imshivam/shivams-lab/blob/main/REVIEW.md" },
    shots: [
      { src: "assets/changelog/v1.1/phone.jpg", alt: "v1.1 on iPhone", kind: "phone" },
      { src: "assets/changelog/v1.1/ipad.jpg", alt: "v1.1 on iPad", kind: "tablet" },
      { src: "assets/changelog/v1.1/desktop.jpg", alt: "v1.1 on Mac with a project sheet open, in Dark Mode", kind: "wide" },
    ],
  },
  {
    version: "1.0",
    date: "2026-10-14",
    title: "First version",
    summary:
      "Everything made with Claude, in one place, in the style of an iOS app: a Latest shelf and lists of apps, websites and artifacts.",
    changes: [
      "9 projects found in your Mac folders, Claude Code sessions, artifacts, Notion and GitHub.",
      "An icon drawn for each project.",
      "Search, a filter, and a detail sheet for each project.",
    ],
    shots: [
      { src: "assets/changelog/v1.0/phone.jpg", alt: "v1.0 on iPhone", kind: "phone" },
      { src: "assets/changelog/v1.0/ipad.jpg", alt: "v1.0 on iPad", kind: "tablet" },
      { src: "assets/changelog/v1.0/desktop-sheet.jpg", alt: "v1.0 on Mac with a project sheet open", kind: "wide" },
    ],
  },
];
