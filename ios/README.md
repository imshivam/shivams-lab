# My Week (iPhone app)

The weekly timetable as an iPhone app, with:

- **The app:** what you're doing now at the top ("Office till 5:30 pm", then the time until the next thing), and one day at a time. Swipe or tap a day to change it. Today shows the current time in a pill on the hour axis. Tap a block for details.
- **Home Screen widgets:** small (now and a countdown), medium (now, plus the next three blocks) and large (all of today).
- **Lock Screen widgets:** rectangular, circular (a ring that fills as the block goes by) and inline (above the clock).
- **Live Activity:** on the Lock Screen and in Notification Centre, with a countdown to the next block.
- **Dynamic Island:** the block's symbol and a countdown. Touch and hold it for the expanded view.

The routine is set in `Shared/Schedule.swift`. Change times or names there.

## Put it on your iPhone

Like Stay Connected and Joint Finances, My Week reaches the phone through **TestFlight**, on Shivam's paid Apple developer account. GitHub Actions does the upload (`.github/workflows/testflight.yml`): every change to `ios/` builds the app on one of GitHub's Macs, signs it and sends it to TestFlight. No Mac needed.

### One-time setup (about 10 minutes, signed in as Shivam)

1. **Register the app's ID.** At [developer.apple.com → Identifiers](https://developer.apple.com/account/resources/identifiers/list), tap **+**, choose **App IDs → App**, enter the description `My Week` and the explicit Bundle ID `com.imshivam.myweek`, then **Continue → Register**.
2. **Create the app.** In [App Store Connect → Apps](https://appstoreconnect.apple.com/apps), tap **+ → New App**. Platform **iOS**, name `My Week` (if taken, any unused name), language **English (UK)**, Bundle ID `com.imshivam.myweek`, SKU `myweek`.
3. **Make an API key.** In App Store Connect, go to **Users and Access → Integrations → App Store Connect API → Team Keys**, tap **+**, name it `GitHub`, and pick **Admin** access. Download the `.p8` file (it can only be downloaded once). Note the **Key ID** and the **Issuer ID** shown above the list.
4. **Find your Team ID** at [developer.apple.com → Account → Membership details](https://developer.apple.com/account#MembershipDetailsCard).
5. **Add four secrets** at [GitHub → shivams-lab → Settings → Secrets and variables → Actions](https://github.com/imshivam/shivams-lab/settings/secrets/actions), each with **New repository secret**:
   - `APPLE_TEAM_ID`: the Team ID
   - `APP_STORE_CONNECT_KEY_ID`: the Key ID
   - `APP_STORE_CONNECT_ISSUER_ID`: the Issuer ID
   - `APP_STORE_CONNECT_KEY`: open the `.p8` file in TextEdit and paste all of it, including the BEGIN and END lines
6. **Let builds reach the phone.** In App Store Connect, open **My Week → TestFlight**, add an **Internal Testing** group, add yourself, and turn on **automatic distribution**.

After that, run **Actions → TestFlight → Run workflow**, or push any change to `ios/`. Each build shows up in the TestFlight app on the iPhone about 10 to 30 minutes later.

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

- `.github/workflows/ios.yml` builds the app for the iOS Simulator whenever anything in `ios/` changes. It needs no account, so it also catches errors before the TestFlight job runs.
- `.github/workflows/testflight.yml` uploads to TestFlight. Until the secrets are added, it stops with a note instead of failing.
