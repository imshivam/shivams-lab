import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

// The Live Activity on the Lock Screen and in Notification Centre, and its Dynamic Island.

struct WeekLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WeekActivityAttributes.self) { context in
            let shown = context.state.shown(isStale: context.isStale)
            LockScreenView(now: shown.now, next: shown.next)
                .activityBackgroundTint(shown.now.activity.category.fill)
                .activitySystemActionForegroundColor(shown.now.activity.category.ink)
        } dynamicIsland: { context in
            let shown = context.state.shown(isStale: context.isStale)
            let now = shown.now, next = shown.next
            let ink = now.activity.category.islandInk
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: now.activity.symbol)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(ink)
                        .frame(width: 44, height: 44)
                        .background(ink.opacity(0.16), in: Circle())
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(now.activity.name)
                            .font(.display(21))
                            .foregroundStyle(.white)
                            .lineLimit(1)
                        Text("till \(Format.clock(now.end))")
                            .font(.display(16).italic())
                            .foregroundStyle(.white.opacity(0.6))
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: now.start...now.end, countsDown: true)
                        .font(.mono(15, weight: .semibold))
                        .foregroundStyle(ink)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 76, alignment: .trailing)
                        .padding(.top, 6)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text("Then \(next.activity.name) at \(Format.clock(next.start))")
                            .font(.footnote)
                            .foregroundStyle(.white.opacity(0.6))
                            .lineLimit(1)
                        Spacer()
                        Button(intent: RefreshLiveActivityIntent()) {
                            Image(systemName: "arrow.clockwise")
                                .font(.footnote.weight(.semibold))
                        }
                        .buttonStyle(.plain)
                        .foregroundStyle(.white.opacity(0.6))
                        .accessibilityLabel("Refresh")
                    }
                    .padding(.top, 4)
                }
            } compactLeading: {
                Image(systemName: now.activity.symbol)
                    .foregroundStyle(ink)
            } compactTrailing: {
                Text(timerInterval: now.start...now.end, countsDown: true)
                    .font(.system(size: 14, weight: .semibold).monospacedDigit())
                    .foregroundStyle(ink)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 58)
            } minimal: {
                ProgressView(timerInterval: now.start...now.end, countsDown: true) {
                    EmptyView()
                } currentValueLabel: {
                    Image(systemName: now.activity.symbol)
                        .font(.system(size: 10, weight: .bold))
                }
                .progressViewStyle(.circular)
                .tint(ink)
                .foregroundStyle(ink)
            }
            .keylineTint(ink)
        }
    }
}

private struct LockScreenView: View {
    let now: Slot
    let next: Slot

    var body: some View {
        let cat = now.activity.category
        HStack(alignment: .center, spacing: 14) {
            Image(systemName: now.activity.symbol)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(cat.ink)
                .frame(width: 46, height: 46)
                .background(cat.ink.opacity(0.12), in: Circle())

            VStack(alignment: .leading, spacing: 3) {
                (Text(now.activity.name).font(.display(24))
                    + Text(" till \(Format.clock(now.end))").font(.display(20).italic()).foregroundColor(cat.ink.opacity(0.65)))
                    .foregroundStyle(cat.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                (Text(timerInterval: now.start...now.end, countsDown: true).monospacedDigit()
                    + Text(" until \(next.activity.name)"))
                    .font(.subheadline)
                    .foregroundStyle(cat.ink.opacity(0.75))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button(intent: RefreshLiveActivityIntent()) {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 13, weight: .semibold))
                    .frame(width: 32, height: 32)
                    .background(cat.ink.opacity(0.1), in: Circle())
            }
            .buttonStyle(.plain)
            .foregroundStyle(cat.ink.opacity(0.8))
            .accessibilityLabel("Refresh")
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
    }
}
