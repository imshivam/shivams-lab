# Working with Shivam

Shivam is a designer who builds personal apps, sites and artifacts with Claude. This repository is public, so nothing personal goes in here or anywhere else in it.

Keep this file current: when you learn something durable about how Shivam works or how projects are built and shipped, add it here in the same commit as the work.

## How to answer

- Verify before answering and cite credible sources. Never guess. If something can't be checked, say so.
- Write plainly, in specific, well-formed sentences. Avoid metaphors.
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
- Apple's API can't create a new app record, so each new app is created once by Shivam on the App Store Connect website, with its bundle ID registered first.
- `.github/workflows/ios.yml` builds the app for the iOS Simulator on every change, as a compile check that needs no account.
- Apps use SwiftUI, with WidgetKit for widgets and ActivityKit for Live Activities.

## Earlier projects

- **Stay Connected** (iPhone app with widgets) and **Joint Finances** (iPhone and Android apps with widgets) live on Shivam's Mac, not on GitHub. Their changelogs are artifacts linked from `data.js`, and record decisions, including the move to TestFlight.
- **My Week** (`ios/`): the weekly timetable as an iPhone app, with widgets, a Live Activity and the Dynamic Island. Bundle ID `com.imshivam.myweek`. The web version is `timetable/index.html`.
- Each app gets a changelog artifact with its changes and decisions.

## This site

- Add projects in `data.js` and log site changes in `changelog.js` (see `README.md`).
- `wishlist/` and `timetable/` are separate pages with their own styles.
- Publishing: `.github/workflows/pages.yml` deploys `main` to GitHub Pages, so anything merged becomes public.
