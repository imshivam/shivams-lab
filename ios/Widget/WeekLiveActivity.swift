import ActivityKit
import AppIntents
import SwiftUI
import WidgetKit

// The Live Activity on the Lock Screen and in Notification Centre, and its Dynamic Island.

struct WeekLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WeekActivityAttributes.self) { context in
            let r = context.state.ribbon(isStale: context.isStale)
            LockScreenView(blocks: r.blocks, now: r.now, next: r.next, at: r.at)
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


/// The Lock Screen card: the current block's name and time left, then a zoomed-in strip of the day.
/// The current-time line and its pill stay put a third of the way across; the strip sits so that
/// now is under the line, with the block before peeking in on the left and what's next on the right.
private struct LockScreenView: View {
    let blocks: [Slot]
    let now: Slot
    let next: Slot
    /// The moment under the line. iOS can't move the strip continuously, so it moves when the app updates.
    let at: Date

    private let ribbonHeight: CGFloat = 44
    private let gap: CGFloat = 3
    /// How much of the day the strip shows, in minutes.
    private let window: Double = 150
    /// Where the line sits, as a share of the width.
    private let lineShare: CGFloat = 0.3

    var body: some View {
        VStack(spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text(now.activity.name)
                    .font(.display(24))
                    .foregroundStyle(Palette.fg)
                    .lineLimit(1)
                Spacer(minLength: 12)
                // Counts down by itself, in whole minutes (or hours for a long block).
                // The live text claims as much width as it might ever need, so it's right-aligned
                // inside a fixed space.
                HStack(spacing: 5) {
                    Text(.currentDate, format: .offset(to: now.end, allowedFields: [.hour, .minute],
                                                       maxFieldCount: 1, sign: .never))
                        .multilineTextAlignment(.trailing)
                    Text("left")
                }
                .font(.mono(13))
                .foregroundStyle(Palette.fg)
                .lineLimit(1)
                .frame(width: 140, alignment: .trailing)
            }
            .padding(.horizontal, 20)

            GeometryReader { geo in
                // iOS sometimes measures the card before it knows the width; fall back to a phone's width.
                let width = geo.size.width.isFinite && geo.size.width > 0 ? geo.size.width : 360
                let lineX = (width * lineShare).rounded()
                let perMinute = width / CGFloat(window)

                ZStack(alignment: .topLeading) {
                    ForEach(blocks, id: \.start) { slot in
                        let x = lineX + CGFloat(slot.start.timeIntervalSince(at) / 60) * perMinute
                        let w = max(CGFloat(slot.end.timeIntervalSince(slot.start) / 60) * perMinute - gap, 1)
                        if x < width && x + w > 0 {
                            block(slot, width: w, elapsed: max(min(lineX - x, w), 0), perMinute: perMinute)
                                .offset(x: x)
                        }
                    }

                    // Fades at both ends, so the day reads as carrying on past the card.
                    HStack(spacing: 0) {
                        LinearGradient(colors: [Palette.card, Palette.card.opacity(0)], startPoint: .leading, endPoint: .trailing)
                            .frame(width: 44)
                        Spacer(minLength: 0)
                        LinearGradient(colors: [Palette.card.opacity(0), Palette.card], startPoint: .leading, endPoint: .trailing)
                            .frame(width: 44)
                    }
                    .frame(width: width, height: ribbonHeight)

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
                    .frame(width: 80, height: 22)
                    .offset(x: lineX - 40, y: ribbonHeight + 10)

                    Text("\(next.activity.name) \(Format.clock(next.start).dropLast(3)) →")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(next.activity.category.ink)
                        .lineLimit(1)
                        .frame(width: max(width - lineX - 60, 1), height: 22, alignment: .trailing)
                        .offset(x: lineX + 40, y: ribbonHeight + 10)
                }
                .frame(width: width, height: ribbonHeight + 32, alignment: .topLeading)
                .clipped()
            }
            .frame(height: ribbonHeight + 32)
        }
        .padding(.top, 18)
        .padding(.bottom, 14)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(now.activity.name) till \(Format.clock(now.end)). Then \(next.activity.name) at \(Format.clock(next.start)).")
    }

    /// One block of the strip. The current one gets a tick every 10 minutes, the part already gone
    /// a little darker, and a border like the current block in the app.
    @ViewBuilder
    private func block(_ slot: Slot, width: CGFloat, elapsed: CGFloat, perMinute: CGFloat) -> some View {
        let cat = slot.activity.category
        let shape = RoundedRectangle(cornerRadius: 8, style: .continuous)
        if slot.start == now.start {
            let tickSpacing = 10 * perMinute
            let ticks = max(Int(width / tickSpacing), 0)
            ZStack(alignment: .leading) {
                cat.fill
                HStack(spacing: 0) {
                    ForEach(0..<ticks, id: \.self) { _ in
                        Spacer(minLength: 0).frame(width: tickSpacing - 1)
                        cat.ink.opacity(0.18).frame(width: 1)
                    }
                    Spacer(minLength: 0)
                }
                cat.ink.opacity(0.14).frame(width: elapsed)
            }
            .frame(width: width, height: ribbonHeight)
            .clipShape(shape)
            .overlay(shape.strokeBorder(cat.ink, lineWidth: 1.5))
        } else {
            shape.fill(cat.fill).frame(width: width, height: ribbonHeight)
        }
    }
}
