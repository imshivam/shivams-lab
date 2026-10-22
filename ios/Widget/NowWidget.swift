import SwiftUI
import WidgetKit

// Home Screen and Lock Screen widgets. The routine never changes, so the timeline is worked out in
// advance: one entry at the start of every block for the next few days. Countdowns tick on their own.

struct NowEntry: TimelineEntry {
    let date: Date
    let slots: [Slot]
    var current: Slot { slots[0] }
    var next: Slot { slots[1] }
}

struct NowProvider: TimelineProvider {
    func placeholder(in context: Context) -> NowEntry { entry(at: .now) }

    func getSnapshot(in context: Context, completion: @escaping (NowEntry) -> Void) {
        completion(entry(at: .now))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NowEntry>) -> Void) {
        let now = Date.now
        let upcoming = Schedule.slots(from: now, count: 30)
        let entries = [entry(at: now)] + upcoming.dropFirst().map { entry(at: $0.start) }
        completion(Timeline(entries: entries, policy: .atEnd))
    }

    private func entry(at date: Date) -> NowEntry {
        NowEntry(date: date, slots: Schedule.slots(from: date, count: 4))
    }
}

struct NowWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NowWidget", provider: NowProvider()) { entry in
            NowWidgetView(entry: entry)
        }
        .configurationDisplayName("My Week")
        .description("What you're doing now and how long is left.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge,
                            .accessoryRectangular, .accessoryInline, .accessoryCircular])
    }
}

struct NowWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: NowEntry

    var body: some View {
        switch family {
        case .systemMedium: MediumView(entry: entry)
        case .systemLarge: LargeView(entry: entry)
        case .accessoryRectangular: RectangularView(entry: entry)
        case .accessoryInline: InlineView(entry: entry)
        case .accessoryCircular: CircularView(entry: entry)
        default: SmallView(entry: entry)
        }
    }
}

// MARK: - Home Screen

/// "Office till 5:30 pm" and a countdown to the next block.
private struct NowSummary: View {
    let entry: NowEntry
    var nameSize: CGFloat = 24

    var body: some View {
        let now = entry.current, cat = now.activity.category
        VStack(alignment: .leading, spacing: 0) {
            Image(systemName: now.activity.symbol)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(cat.ink)
            Spacer(minLength: 8)
            Text(now.activity.name)
                .font(.display(nameSize))
                .foregroundStyle(cat.ink)
                .lineLimit(2)
                .minimumScaleFactor(0.75)
            Text("till \(Format.clock(now.end))")
                .font(.display(nameSize * 0.72).italic())
                .foregroundStyle(cat.ink.opacity(0.7))
                .lineLimit(1)
            Spacer(minLength: 8)
            Text(timerInterval: now.start...now.end, countsDown: true)
                .font(.mono(15, weight: .semibold))
                .foregroundStyle(cat.ink)
            Text("until \(entry.next.activity.name)")
                .font(.caption)
                .foregroundStyle(cat.ink.opacity(0.7))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

private struct SmallView: View {
    let entry: NowEntry
    var body: some View {
        NowSummary(entry: entry)
            .containerBackground(entry.current.activity.category.fill, for: .widget)
    }
}

private struct MediumView: View {
    let entry: NowEntry
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            NowSummary(entry: entry, nameSize: 22)
            VStack(alignment: .leading, spacing: 10) {
                ForEach(entry.slots.dropFirst(), id: \.self) { slot in
                    UpcomingRow(slot: slot)
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .containerBackground(for: .widget) {
            HStack(spacing: 0) {
                entry.current.activity.category.fill
                Palette.surface
            }
        }
    }
}

private struct UpcomingRow: View {
    let slot: Slot
    var body: some View {
        let cat = slot.activity.category
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(cat == .open ? Palette.lineStrong : cat.ink)
                .frame(width: 3, height: 28)
            VStack(alignment: .leading, spacing: 1) {
                Text(slot.activity.name)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Palette.fg)
                    .lineLimit(1)
                Text(Format.span(slot.start, slot.end))
                    .font(.mono(10.5, weight: .regular))
                    .foregroundStyle(Palette.muted)
                    .lineLimit(1)
            }
        }
    }
}

/// Today from waking to sleep, with the current block marked.
private struct LargeView: View {
    let entry: NowEntry

    var body: some View {
        let day = Schedule.anchorDay(for: entry.date)
        let slots = Schedule.slots(onDayStarting: day)
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(Schedule.dayNames[Schedule.dayIndex(of: day)])
                    .font(.display(26))
                    .foregroundStyle(Palette.accent)
                Spacer()
                Text(Schedule.dayIndex(of: day) >= 5 ? "WEEKEND" : "WORKDAY")
                    .font(.mono(10))
                    .tracking(1)
                    .foregroundStyle(Palette.muted)
            }
            .padding(.bottom, 6)
            ForEach(slots, id: \.self) { slot in
                let cat = slot.activity.category
                let isNow = slot == entry.current
                let isPast = slot.end <= entry.date
                HStack(spacing: 10) {
                    Text(Format.clock(slot.start).dropLast(3))
                        .font(.mono(11, weight: .regular))
                        .foregroundStyle(Palette.muted)
                        .frame(width: 38, alignment: .trailing)
                    HStack(spacing: 8) {
                        Image(systemName: slot.activity.symbol)
                            .font(.system(size: 11, weight: .semibold))
                            .frame(width: 16)
                        Text(slot.activity.name)
                            .font(.system(size: 14, weight: .medium))
                            .lineLimit(1)
                        Spacer(minLength: 4)
                        if isNow {
                            Text(timerInterval: slot.start...slot.end, countsDown: true)
                                .font(.mono(11))
                                .multilineTextAlignment(.trailing)
                                .frame(width: 64, alignment: .trailing)
                        } else {
                            Text(Format.duration(from: slot.start, to: slot.end))
                                .font(.mono(10.5, weight: .regular))
                                .opacity(0.7)
                        }
                    }
                    .foregroundStyle(cat.ink)
                    .padding(.horizontal, 10)
                    .frame(maxHeight: .infinity)
                    .background(cat.fill, in: RoundedRectangle(cornerRadius: 8))
                    .overlay {
                        if isNow {
                            RoundedRectangle(cornerRadius: 8).strokeBorder(cat.ink, lineWidth: 1.5)
                        } else if cat == .open {
                            RoundedRectangle(cornerRadius: 8)
                                .strokeBorder(Palette.lineStrong, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        }
                    }
                }
                .opacity(isPast ? 0.45 : 1)
            }
        }
        .containerBackground(Palette.bg, for: .widget)
    }
}

// MARK: - Lock Screen

private struct RectangularView: View {
    let entry: NowEntry
    var body: some View {
        let now = entry.current
        VStack(alignment: .leading, spacing: 1) {
            Label(now.activity.name, systemImage: now.activity.symbol)
                .font(.headline)
                .lineLimit(1)
            Text("till \(Format.clock(now.end))")
                .font(.subheadline)
                .lineLimit(1)
            (Text(timerInterval: now.start...now.end, countsDown: true) + Text(" left"))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .containerBackground(.clear, for: .widget)
    }
}

private struct InlineView: View {
    let entry: NowEntry
    var body: some View {
        Label("\(entry.current.activity.name) till \(Format.clock(entry.current.end))",
              systemImage: entry.current.activity.symbol)
            .containerBackground(.clear, for: .widget)
    }
}

private struct CircularView: View {
    let entry: NowEntry
    var body: some View {
        let now = entry.current
        ProgressView(timerInterval: now.start...now.end, countsDown: false) {
            EmptyView()
        } currentValueLabel: {
            Image(systemName: now.activity.symbol)
        }
        .progressViewStyle(.circular)
        .containerBackground(.clear, for: .widget)
    }
}
