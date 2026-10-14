# Design review: Shivam's Lab v1

Reviewed on 14 October 2026 against Apple's Human Interface Guidelines (current edition, including the Liquid Glass updates from June 2025 and June 2026). Tested at iPhone size (375 × 812), iPad portrait (768 × 1024) and desktop (1440 × 900), in light and dark appearance. Contrast was measured with the WCAG formula that Apple's Accessibility Inspector uses.

Severity: **High** = fails a guideline or blocks use. **Medium** = clearly off-platform or confusing. **Low** = polish.

## What already works

- System font with Apple's text styles at the Large (default) size, including Apple's tracking values. On iPhone and iPad, text follows the Dynamic Type setting.
- iOS dynamic system colours for backgrounds, labels and separators, with full Dark Mode. There is no in-page appearance switch (HIG Dark Mode: avoid an app-specific appearance setting).
- Liquid Glass only on the control layer: toolbar, search field and the sheet's Close button. Content uses solid surfaces (HIG Materials: don't use Liquid Glass in the content layer).
- Search sits at the bottom on iPhone, within thumb reach, and at the trailing end of the toolbar on iPad and Mac (HIG Search fields).
- The large title gives way to an inline title as you scroll (HIG Toolbars).
- Sheets have a grabber, swipe down to dismiss, Escape and the Back button close them, and focus stays inside while open (HIG Sheets).
- Reduce Motion, Reduce Transparency, Increase Contrast and forced colours are handled.

## Findings

| # | Severity | Finding | Guideline | Fix |
|---|---|---|---|---|
| 1 | High | Secondary text (taglines, meta, footer) is 3.3–3.4 : 1 on light backgrounds. | Accessibility: text up to 17 pt needs at least 4.5 : 1. Dark Mode: aim for 7 : 1 with custom colours. | Raise secondary label opacity in light mode to 0.76 (4.9–5.2 : 1). Dark mode already passes (5.3–6.4 : 1). |
| 2 | High | Blue text on white is 3.5 : 1. Blue labels on the grey secondary buttons are 2.8 : 1. White on the blue button is 3.5 : 1. | Accessibility: contrast minimums. Color: colours must work in light, dark and increased contrast. | Light-mode tint #0071E3 (4.7 : 1 both ways). Fills use the same blue in dark mode; blue text in dark mode stays #0091FF (5.3 : 1). |
| 3 | High | The scroll edge effect under the toolbar is too faint. The inline title and the search field sit on top of sharp content, which makes them hard to read. | Layout: use a scroll edge effect to lift controls above content. Color: keep controls legible over content. | A taller, stronger edge effect: solid background behind the bar, then a soft blur and fade. |
| 4 | Medium | Opening a sheet by tapping shows a blue focus ring on the Close button. iOS never does this for touch. | Accessibility: keep focus behaviour predictable. | Move focus to the sheet itself. Show focus rings only for keyboard use. |
| 5 | Medium | In the sheet, the title wraps next to the Close button ("Stay / Connected") because the button takes space from the heading. | Sheets and Toolbars: the Close button lives in the sheet's top bar, not inside the content. | Give the sheet a top bar for the Close button. The heading gets the full width. |
| 6 | Medium | Detail sheets can show three same-size capsule buttons (Joint Finances). On iPhone they stack into three heavy full-width bars. | Buttons: one or two prominent buttons per view. Too many choices increase cognitive load. | One prominent button for the main action. Other links move into a grouped Links list. |
| 7 | Medium | In Dark Mode the cream and mint panels on the Latest cards glow against black. | Dark Mode: soften white backgrounds so they don't glow. | Dimmer, darker tints for those panels in Dark Mode. |
| 8 | Medium | Latest cards show the same icon twice (large in the picture, small beside the text). On iPad the kicker wraps to two lines. | Designing for iOS: limit onscreen elements. Every element needs a purpose. | Remove the small icon. Shorter kicker. |
| 9 | Medium | List rows carry three lines, and the meta line breaks mid-phrase ("October / 2026"). | Lists and tables: keep item text succinct to avoid wrapping. | The meta line keeps only the kind and version. The date stays in the sheet and on Latest cards. |
| 10 | Medium | On iPad portrait, sections flow into two columns and Artifacts ends up alone, leaving a large empty area. | Layout: adapt gracefully and consistently across sizes. Collections: use standard row or grid layouts. | Sections stack at full width. On iPad and Mac the rows inside each section flow into two or three columns, as in the App Store. |
| 11 | Medium | Segmented control segments are 38 pt tall. | Accessibility: 44 × 44 pt default hit target on iOS and iPadOS. | 44 pt segments. |
| 12 | Low | The segment says "Web" while its section is called "Websites". | Writing: build language patterns and use terms consistently. | Use "Websites" in both places. |
| 13 | Low | Unlabelled numbers beside each section title repeat the summary under the title. | Layout: group related items and avoid redundant content. | Remove the numbers. |
| 14 | Low | The note for local projects says "Open the folder below", but there is no open action, only Copy. | Writing: be clear and give accurate next steps. | Plain wording: there's no link yet, and where the project lives. |
| 15 | Low | "Copied" appears and disappears, but screen readers don't hear it. | Accessibility: describe changes for VoiceOver. | Announce "Copied" through a live region. |
| 16 | Low | The desktop search field is 40 pt tall, while the iPad target is 44 pt. | Accessibility: control sizes. | 44 pt on iPad. Mac pointers can use smaller targets. |
| 17 | Low | The Latest cards' type is a little cramped on iPad: the name, kicker and tagline crowd together. | Typography: keep a clear hierarchy. | More space and a clearer order: kind and date, then name, then tagline. |

## Considered and kept

- **Chevrons in tertiary grey (1.7 : 1).** This matches iOS. The chevron is decoration on a row that is itself the control, so text contrast rules don't apply.
- **Page title is the site's name.** HIG Toolbars advises against titling windows with the app name, but here the page is the Lab itself, much like a root list such as Settings.
- **Search at the bottom on iPhone, alongside Safari's own bottom bar.** HIG prefers search at the bottom when it's a priority. Extra bottom padding keeps the last row clear.
- **No SF Symbols or SF Pro web font.** Apple's licence doesn't allow either on websites. The page uses the system font that the device already has, and custom icons drawn in the same style.
- **No screenshots for Stay Connected and Joint Finances.** Their screenshots show real names and real spending. The page is public, so those two use their icons.
