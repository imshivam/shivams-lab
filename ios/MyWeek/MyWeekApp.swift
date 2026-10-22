import BackgroundTasks
import SwiftUI
import WidgetKit

@main
struct MyWeekApp: App {
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                Task { await LiveActivitySync.run() }
            }
        }
        .backgroundTask(.appRefresh(BackgroundRefresh.id)) {
            await LiveActivityManager.update()
            BackgroundRefresh.schedule()
        }
    }
}

enum LiveActivitySync {
    static let enabledKey = "liveActivityOn"

    static var isEnabled: Bool {
        UserDefaults.standard.object(forKey: enabledKey) as? Bool ?? true
    }

    /// Called whenever the app opens and when the Live Activity switch changes.
    static func run() async {
        if isEnabled {
            await LiveActivityManager.startOrUpdate()
            BackgroundRefresh.schedule()
        } else {
            await LiveActivityManager.endAll()
        }
        WidgetCenter.shared.reloadAllTimelines()
    }
}

/// Asks iOS to wake the app when the current block ends, to move the Live Activity on.
/// iOS decides when this actually runs, so the Live Activity also moves itself on once (see
/// WeekActivityAttributes) and has a refresh button.
enum BackgroundRefresh {
    static let id = "com.imshivam.myweek.refresh"

    static func schedule() {
        let request = BGAppRefreshTaskRequest(identifier: id)
        request.earliestBeginDate = Schedule.slots(from: .now, count: 1)[0].end
        try? BGTaskScheduler.shared.submit(request)
    }
}
