Put the My Week iPhone app on my iPhone through TestFlight, the same way Stay Connected and Joint Finances were shipped. Do every step yourself; only ask me for something that truly needs me.

1. Clone https://github.com/imshivam/shivams-lab into this folder (skip if it's already here), then check out the branch `claude/determined-ride-f66k6s` and pull it.
2. Read `CLAUDE.md` and `ios/README.md` in that repository.
3. Open `ios/MyWeek.xcodeproj`. Set the Team to my paid Apple developer team for both targets, `MyWeek` and `MyWeekWidget`, using the team Xcode is already signed in with (the same one Stay Connected uses).
4. Archive the `MyWeek` scheme for "Any iOS Device" and upload it to App Store Connect for TestFlight. Bundle ID: `com.imshivam.myweek` (widget: `com.imshivam.myweek.widget`). Let Xcode register the IDs and create the App Store Connect app record ("My Week") if they don't exist yet.
5. Make the build available to me in TestFlight (internal testing), so it appears in the TestFlight app on my iPhone.
6. Commit any project changes (such as the Team ID) to `claude/determined-ride-f66k6s` and push.
7. When done, tell me in one or two short lines. Keep all replies short.
