import ActivityKit
import AppIntents
import Foundation

struct WeekActivityAttributes: ActivityAttributes {
    /// The block happening now and the two after it. When the first one ends, the system marks the
    /// activity as stale and the views move on to the second, so the Lock Screen stays right even if
    /// the app doesn't get a chance to update it.
    struct ContentState: Codable, Hashable {
        var current: Slot
        var next: Slot
        var after: Slot
    }
}

extension WeekActivityAttributes.ContentState {
    /// What to show: the current block and the one after it, moved on by one once `current` has ended.
    func shown(isStale: Bool) -> (now: Slot, next: Slot) {
        isStale ? (next, after) : (current, next)
    }
}

enum LiveActivityManager {
    private static let startedKey = "liveActivityStartedAt"

    static func content(at date: Date = .now) -> ActivityContent<WeekActivityAttributes.ContentState> {
        let s = Schedule.slots(from: date, count: 3)
        let state = WeekActivityAttributes.ContentState(current: s[0], next: s[1], after: s[2])
        return ActivityContent(state: state, staleDate: s[0].end)
    }

    private static var running: [Activity<WeekActivityAttributes>] {
        Activity<WeekActivityAttributes>.activities.filter {
            $0.activityState == .active || $0.activityState == .stale
        }
    }

    /// Shows the Live Activity, or brings the one already showing up to date.
    /// iOS only lets an app start a Live Activity while it is open, and ends any Live Activity after
    /// 8 hours, so one that has been running for 7 hours or more is replaced with a fresh one.
    static func startOrUpdate() async {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        let started = UserDefaults.standard.object(forKey: startedKey) as? Date ?? .distantPast
        let current = running

        if let first = current.first, Date.now.timeIntervalSince(started) < 7 * 3600 {
            await first.update(content())
            for extra in current.dropFirst() { await extra.end(nil, dismissalPolicy: .immediate) }
            return
        }

        for activity in current { await activity.end(nil, dismissalPolicy: .immediate) }
        do {
            _ = try Activity<WeekActivityAttributes>.request(attributes: WeekActivityAttributes(),
                                                             content: content(),
                                                             pushType: nil)
            UserDefaults.standard.set(Date.now, forKey: startedKey)
        } catch {
            // Live Activities are turned off for the app in Settings, or too many are running.
        }
    }

    /// Updates a Live Activity that is already showing. Works in the background.
    static func update() async {
        for activity in running { await activity.update(content()) }
    }

    static func endAll() async {
        for activity in Activity<WeekActivityAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }
}

/// The refresh button on the Live Activity. iOS runs it in the app, in the background.
struct RefreshLiveActivityIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Refresh"
    static var description = IntentDescription("Brings the Live Activity up to the current time.")

    init() {}

    func perform() async throws -> some IntentResult {
        await LiveActivityManager.update()
        return .result()
    }
}
