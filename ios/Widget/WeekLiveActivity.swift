import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

// The Live Activity on the Lock Screen and in Notification Centre, and its Dynamic Island.

struct WeekLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WeekActivityAttributes.self) { context in
            let r = context.state.ribbon(isStale: context.isStale)
            LockScreenView(previous: r.previous, now: r.now, next: r.next, at: r.at)
                .activityBackgroundTint(Palette.card)
                .activitySystemActionForegroundColor(Palette.fg)
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


/// The Lock Screen card: the current block's name and time left, then a zoomed-in strip of the day
/// with a peek of the block before and after, the current-time line, and what's next.
private struct LockScreenView: View {
    let previous: Slot
    let now: Slot
    let next: Slot
    /// The moment the line marks. iOS can't move it continuously, so it moves when the app updates.
    let at: Date

    private let ribbonHeight: CGFloat = 44
    private let gap: CGFloat = 3

    /// A long block fills the strip on its own, with no peek of the one before.
    private var showsPrevious: Bool { now.end.timeIntervalSince(now.start) <= 3 * 3600 }

    private var progress: CGFloat {
        let total = now.end.timeIntervalSince(now.start)
        guard total > 0 else { return 0 }
        return CGFloat(min(max(at.timeIntervalSince(now.start) / total, 0), 1))
    }

    var body: some View {
        VStack(spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text(now.activity.name)
                    .font(.display(24))
                    .foregroundStyle(Palette.fg)
                    .lineLimit(1)
                Spacer(minLength: 12)
                // Minutes only, counting down by itself. A seconds timer shows "29:--" on the Lock Screen.
                HStack(spacing: 5) {
                    Text(now.end, style: .relative)
                        .multilineTextAlignment(.trailing)
                    Text("left")
                }
                .font(.mono(13))
                .monospacedDigit()
                .foregroundStyle(Palette.fg)
                .lineLimit(1)
                .fixedSize()
            }
            .padding(.horizontal, 20)

            GeometryReader { geo in
                let width = geo.size.width
                let previousWidth: CGFloat = showsPrevious ? 56 : 0
                let nextWidth = (110 / 380) * width
                let currentWidth = width - previousWidth - nextWidth - gap * (showsPrevious ? 2 : 1)
                let lineX = previousWidth + (showsPrevious ? gap : 0) + progress * currentWidth
                let label = "\(next.activity.name) \(Format.clock(next.start).dropLast(3)) →"
                let labelWidth = CGFloat(label.count) * 7.4
                let pillHalf: CGFloat = 28
                let pillX = min(max(lineX, pillHalf + 8), width - 20 - labelWidth - 8 - pillHalf)

                ZStack(alignment: .topLeading) {
                    HStack(spacing: gap) {
                        if showsPrevious {
                            Rectangle()
                                .fill(previous.activity.category.fill)
                                .frame(width: previousWidth)
                                .clipShape(UnevenRoundedRectangle(bottomTrailingRadius: 8, topTrailingRadius: 8))
                        }
                        currentBlock
                            .frame(width: currentWidth)
                        Rectangle()
                            .fill(next.activity.category.fill)
                            .clipShape(UnevenRoundedRectangle(topLeadingRadius: 8, bottomLeadingRadius: 8))
                    }
                    .frame(height: ribbonHeight)

                    // Fades at both ends, so the day reads as carrying on past the card.
                    HStack {
                        LinearGradient(colors: [Palette.card, Palette.card.opacity(0)], startPoint: .leading, endPoint: .trailing)
                            .frame(width: 48)
                        Spacer()
                        LinearGradient(colors: [Palette.card.opacity(0), Palette.card], startPoint: .leading, endPoint: .trailing)
                            .frame(width: 48)
                    }
                    .frame(height: ribbonHeight)

                    Rectangle()
                        .fill(Palette.accent)
                        .frame(width: 2, height: ribbonHeight + 11)
                        .offset(x: lineX - 1)

                    HStack(spacing: 6) {
                        Circle().fill(Palette.onAccent).frame(width: 6, height: 6)
                        Text(Format.clock(at).dropLast(3))
                            .font(.mono(11))
                            .monospacedDigit()
                    }
                    .foregroundStyle(Palette.onAccent)
                    .padding(.leading, 8)
                    .padding(.trailing, 9)
                    .frame(height: 22)
                    .background(Palette.accent, in: Capsule())
                    .fixedSize()
                    .frame(width: pillHalf * 2)
                    .offset(x: pillX - pillHalf, y: ribbonHeight + 10)

                    Text(label)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(next.activity.category.ink)
                        .lineLimit(1)
                        .frame(width: width - 20, height: 22, alignment: .trailing)
                        .offset(y: ribbonHeight + 10)
                }
            }
            .frame(height: ribbonHeight + 10 + 22)
        }
        .padding(.top, 18)
        .padding(.bottom, 14)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(now.activity.name) till \(Format.clock(now.end)). Then \(next.activity.name) at \(Format.clock(next.start)).")
    }

    /// The current block: its colour with a tick every 10 minutes (every hour for a long block), the
    /// part already gone a little darker, and a border like the current block in the app.
    private var currentBlock: some View {
        let cat = now.activity.category
        let minutes = now.end.timeIntervalSince(now.start) / 60
        let step = minutes > 180 ? 60.0 : 10.0
        let shape = RoundedRectangle(cornerRadius: 8, style: .continuous)
        return ZStack(alignment: .leading) {
            cat.fill
            Canvas { context, size in
                var m = step
                while m < minutes {
                    let x = size.width * CGFloat(m / minutes)
                    context.fill(Path(CGRect(x: x, y: 0, width: 1, height: size.height)), with: .color(cat.ink.opacity(0.18)))
                    m += step
                }
            }
            GeometryReader { geo in
                cat.ink.opacity(0.14).frame(width: geo.size.width * progress)
            }
        }
        .clipShape(shape)
        .overlay(shape.strokeBorder(cat.ink, lineWidth: 1.5))
    }
}
