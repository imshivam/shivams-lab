# My Week (iPhone app)

The weekly timetable as an iPhone app, with:

- **The app:** what you're doing now at the top ("Office till 5:30 pm", then the time until the next thing), and one day at a time. Swipe or tap a day to change it. Today shows the current time in a pill on the hour axis. Tap a block for details.
- **Home Screen widgets:** small (now and a countdown), medium (now, plus the next three blocks) and large (all of today).
- **Lock Screen widgets:** rectangular, circular (a ring that fills as the block goes by) and inline (above the clock).
- **Live Activity:** on the Lock Screen and in Notification Centre, with a countdown to the next block.
- **Dynamic Island:** the block's symbol and a countdown. Touch and hold it for the expanded view.

The routine is set in `Shared/Schedule.swift`. Change times or names there.

## Put it on your iPhone

Like Stay Connected and Joint Finances, My Week goes to the phone through **TestFlight**, on Shivam's paid Apple developer account. The upload runs on the Mac:

1. Open `ios/MyWeek.xcodeproj` in Xcode on the Mac.
2. Under **Signing & Capabilities**, set **Team** to Shivam's paid team for both targets, **MyWeek** and **MyWeekWidget**.
3. Create the app in [App Store Connect](https://appstoreconnect.apple.com) (**Apps → + → New App**) with the bundle ID `com.imshivam.myweek`.
4. Choose **Any iOS Device**, then **Product → Archive**, then **Distribute App → TestFlight & App Store**.
5. When the build has processed, it appears in the TestFlight app on the iPhone.

For a quick test without TestFlight, connect the iPhone and press **⌘R** in Xcode instead.

### Add the widgets

- **Home Screen:** touch and hold an empty spot, tap **Edit → Add Widget**, find **My Week**, and pick a size.
- **Lock Screen:** touch and hold the Lock Screen, tap **Customize → Lock Screen**, tap the widget area, and pick **My Week**.

## How the Live Activity stays up to date

iOS sets these limits (from Apple's [Displaying live data with Live Activities](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities)):

- An app can only **start** a Live Activity while it's open. My Week starts one every time you open it. Turn it off in the app's **•••** menu.
- A Live Activity can run for **at most 8 hours**. After that, iOS ends it and removes it from the Dynamic Island, and the Lock Screen keeps it for up to 4 more hours. Opening the app replaces any Live Activity older than 7 hours with a fresh one, so open the app once in the morning and once in the evening.
- Without a server sending push notifications, the app can only update the Live Activity when iOS gives it background time, and iOS decides when that happens. To cover this, the Live Activity also holds the next block and moves on to it by itself when the current one ends. If it falls further behind, tap its **refresh** button or open the app.

The widgets don't have these limits. The routine is fixed, so their timeline is worked out days in advance and is always on time.

## Checks

GitHub Actions builds the app for the iOS Simulator whenever anything in `ios/` changes (`.github/workflows/ios.yml`). It doesn't sign the app or need any account.
