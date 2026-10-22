# Working with Shivam

Shivam is a designer who builds personal apps, sites and artifacts with Claude. This repository is public, so nothing personal goes in here or anywhere else in it.

Keep this file current: when you learn something durable about how Shivam works or how projects are built and shipped, add it here in the same commit as the work.

## How to answer

- Verify before answering and cite credible sources. Never guess. If something can't be checked, say so.
- Write plainly, in specific, well-formed sentences. Avoid metaphors.
- Take the simplest path, and ask Shivam only for what genuinely needs him. When he needs to look at something (a design, a page, a sign-in), open it for him and say "tell me when you're done".
- Question boxes and reply buttons are useful when they offer a real choice. Use them with judgement: a button must do something he'd otherwise type, and its label must answer the question asked. Example of a bad one: "Which direction should I build?" with a single button, "Pick on the canvas", which only sent a message saying he'd pick later. Overused, these lose their value.
- Use connected tools (GitHub, Notion, Gmail, Google Drive, Calendar) when they would make the answer better. If a needed one isn't connected, ask Shivam to connect it.
- Check how earlier projects were done before proposing a way to do something (see "Earlier projects" below).
- Claude Code sessions don't have Claude chat's memory. This file is the memory. Notion Memory is a different thing: don't use it unless Shivam asks.

## Design

- Minimal, clean and calm. Follow the device's light or dark setting.
- Every element must tell the viewer something. No decorative labels, no lines that repeat each other, no progress bars or indicators that don't help a decision. If unsure whether an element earns its place, leave it out.
- The Lab follows Apple's Human Interface Guidelines (`REVIEW.md`) and the motion research in `MAGIC.md`.

## iPhone apps

- Shivam has a paid Apple Developer Program membership (since 7 October 2026). Apps reach the phone through **TestFlight**. Never suggest free-account installs that expire after 7 days.
- Cloud sessions can't reach Shivam's Mac. For apps in a GitHub repository, upload to TestFlight with GitHub Actions: `.github/workflows/testflight.yml` here, which uses the repository secrets `APPLE_TEAM_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID` and `APP_STORE_CONNECT_KEY` (an App Store Connect API key with Admin access).
- `.github/workflows/ios.yml` builds the app for the iOS Simulator on every change, as a compile check that needs no account.
- Apps use SwiftUI, with WidgetKit for widgets and ActivityKit for Live Activities.

### Shipping to TestFlight from the Mac (how Stay Connected, Joint Finances and My Week went up)

Do all of this yourself. Shivam does none of it unless a step below says so.

1. **Check before asking.** Search past sessions (`search_session_transcripts`) for how the last app shipped, and copy it.
2. **Team:** `QYWDXVK7V9` for every target.
3. **API key:** an App Store Connect API key (Admin) is already on the Mac in `~/.appstoreconnect/private_keys/`. One key works for every app. Claude Code's safety check blocks using its Issuer ID if you copy it from another session, so ask Shivam to paste it, with this link: [App Store Connect API page](https://appstoreconnect.apple.com/access/integrations/api).
4. **Register the bundle IDs** (app and widget) through the API (`POST /v1/bundleIds`). Xcode's automatic signing doesn't do it: it falls back to a wildcard profile.
5. **Create the app record** ("New App") on the App Store Connect website, in the **built-in browser pane** of the Claude app. Shivam is signed in there. If the pane isn't signed in, open it and ask Shivam to sign in. Don't use Chrome, 1Password or Xcode's menus for this. Apple's API can't create app records.
6. **Archive** with `xcodebuild archive -allowProvisioningUpdates` plus the key flags (`-authenticationKeyPath/-authenticationKeyID/-authenticationKeyIssuerID`). Run it outside the sandbox, or Xcode reports "No Accounts".
7. **Upload** with `xcodebuild -exportArchive` and **manual** signing: create `IOS_APP_STORE` profiles through the API (`POST /v1/profiles`) with the local "Apple Distribution" certificate, then name them in the export options. Automatic export fails with a cloud-signing error.
8. **Internal testing:** create an internal group called "Me" with access to all builds, then add Shivam on the group's web page in the built-in browser. The API refuses internal testers (409).

## Earlier projects

- **Stay Connected** (iPhone app with widgets) and **Joint Finances** (iPhone and Android apps with widgets) live on Shivam's Mac, not on GitHub. Their changelogs are artifacts linked from `data.js`, and record decisions, including the move to TestFlight.
- **My Week** (`ios/`): the weekly timetable as an iPhone app, with widgets, a Live Activity and the Dynamic Island. Bundle ID `com.imshivam.myweek`. On App Store Connect and TestFlight it's called **In a day**. The web version is `timetable/index.html`.
- Each app gets a changelog artifact with its changes and decisions.

## This site

- Add projects in `data.js` and log site changes in `changelog.js` (see `README.md`).
- `wishlist/` and `timetable/` are separate pages with their own styles.
- Publishing: `.github/workflows/pages.yml` deploys `main` to GitHub Pages, so anything merged becomes public.
