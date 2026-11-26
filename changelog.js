// Version History for Shivam's Lab. Newest first. Screenshots live in assets/changelog/<version>/.

window.VERSIONS = [
  {
    version: "2.9",
    date: "2026-11-26",
    title: "Subtitled films 2.0",
    summary: "Subtitled films has a new design, a dark mode and official film pictures.",
    changes: [
      "Subtitled films: big official film pictures, a film page with travel from both work and home on every show, ratings, trailers and a maps choice for each cinema.",
      "It follows the device's light or dark setting.",
      "The morning update now also fetches film details from TMDB and Letterboxd.",
    ],
    why: "Shivam explored the design on a Claude Design canvas and chose a calm, picture-led direction inspired by mindmarket.com.",
    shots: [],
  },
  {
    version: "2.8",
    date: "2026-11-25",
    title: "Subtitled films",
    summary: "A new page for subtitled film shows in London.",
    changes: [
      "Added Subtitled films, a page of subtitled screenings at London-area cinemas that fit weekday evenings and weekends, with travel times. Its listings refresh every morning.",
      "Publish site now also runs after the daily listings update.",
    ],
    why: "Shivam needs subtitles and was scrolling every film's full UK list to find a time and a cinema that work. Home and work are saved only on his devices, never in this public repository.",
    shots: [],
  },
  {
    version: "2.7",
    date: "2026-11-22",
    title: "Warm Jackets",
    summary: "A new private shopping guide.",
    changes: [
      "Added Warm Jackets, a private guide to the warmest jackets from London menswear brands, with its own icon.",
    ],
    why: "The weekly check found it in Claude. It's about shopping and prices, so it's private and its description leaves out sizes and amounts.",
    shots: [],
  },
  {
    version: "2.6",
    date: "2026-11-21",
    title: "Tidier privacy",
    summary: "Writing Calibration is off the Lab, and Packed and Joint Finances are now marked private.",
    changes: [
      "Removed Writing Calibration.",
      "Packed and Joint Finances show the Private label. Their links already opened only for Shivam.",
    ],
    why: "Shivam asked which projects are really public, and wanted personal ones labelled private.",
    shots: [],
  },
  {
    version: "2.5",
    date: "2026-11-15",
    title: "India Culture Map",
    summary: "A new private guide, and one more board under Reference Kit.",
    changes: [
      "Added India Culture Map, a private trip guide to India's classical arts, with its own icon.",
      "Reference Kit now links to the Pink and Black board, a Keep / Drop board of outfits.",
    ],
    why: "The weekly check found both in Claude. The guide is about a trip, so it's private and leaves out dates. The board was made with the Reference Kit, so it sits under that entry.",
    shots: [],
  },
  {
    version: "2.4",
    date: "2026-11-08",
    title: "Barcelona planners",
    summary: "The Barcelona entry now holds the two planners made alongside the trip guide.",
    changes: [
      "Barcelona links to two more private pages: After Hours, for evenings out, and Inspiration Week, which shows what's open right now.",
      "Its description and highlights cover all three pages, still without dates or personal details.",
    ],
    why: "The weekly check found two new Barcelona pages in Claude. They belong to the same trip, so they sit under that entry instead of becoming new ones.",
    shots: [],
  },
  {
    version: "2.3",
    date: "2026-11-02",
    title: "Private projects",
    summary: "Personal projects stay on the Lab, but only Shivam can open them.",
    changes: [
      "A Private label with a lock on personal projects: Income Bridge London, Referral Map, Weekly Life List, Barcelona and the Cowork deck.",
      "Their links go to claude.ai pages that are private, so anyone else gets a sign-in page.",
      "Their descriptions no longer mention people or personal details.",
    ],
    why: "Shivam wants one page listing everything, without exposing anything personal to visitors.",
    shots: [],
  },
  {
    version: "2.2",
    date: "2026-11-02",
    title: "Everything, not just the code",
    summary:
      "The Lab only listed projects made in Claude Code. It now also lists what was made in Claude chat and Cowork: 15 more, for 27 in all.",
    changes: [
      "Added Game Shelf, Style Atlas, The Handloom Trail, 3D Playground, The Fragrance Canon, Income Bridge London, Weekly Life List, Referral Map, Barcelona, Off the Tourist Map, Personal Concierge and Writing Calibration.",
      "Added the What Were They Thinking explainer reels, My Week (the iPhone app called In a day on TestFlight), the Wish List page and a Cowork slide deck.",
      "A new Videos filter holds the two explainers.",
      "Joint Finances now links to its States and References boards.",
      "Each new project has its own icon. Names of other people are left out, because this page is public.",
    ],
    why:
      "You said the game shelf and the explainer video were missing. The Lab had only looked at Claude Code projects, so anything made in chat or Cowork never reached it.",
    shots: [
      { src: "assets/changelog/v2.2/phone.jpg", alt: "v2.2 on iPhone: November and October with the new projects", kind: "phone" },
      { src: "assets/changelog/v2.2/desktop.jpg", alt: "v2.2 on Mac", kind: "wide" },
    ],
  },
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
