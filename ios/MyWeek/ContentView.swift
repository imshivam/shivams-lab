import SwiftUI

// The timetable: what's happening now at the top, then one day at a time. Swipe to change days.

struct ContentView: View {
    @State private var selected = Schedule.dayIndex(of: Schedule.anchorDay(for: .now))
    @State private var detail: BlockDetail.Item?
    @AppStorage(LiveActivitySync.enabledKey) private var liveActivityOn = true
    @Environment(\.scenePhase) private var scenePhase
    /// Shrinks the header while reading the day, and grows it back on scrolling down.
    @State private var compact = false
    /// Bumped each time the app comes to the front, so today's page centres on the current time again.
    @State private var recenter = 0

    var body: some View {
        TimelineView(.periodic(from: .now, by: 30)) { context in
            let now = context.date
            let today = Schedule.dayIndex(of: Schedule.anchorDay(for: now))
            VStack(spacing: 0) {
                NowHeader(now: now, compact: compact, liveActivityOn: $liveActivityOn)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                DayPicker(selected: $selected, today: today)
                    .padding(.horizontal, 14)
                    .padding(.top, compact ? 10 : 18)
                    .padding(.bottom, 10)
                TabView(selection: $selected) {
                    ForEach(0..<7, id: \.self) { index in
                        DayPage(dayIndex: index, isToday: index == today, now: now, recenter: recenter,
                                onScroll: { compact = $0 }) { block in
                            detail = BlockDetail.Item(day: index, block: block)
                        }
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .animation(.snappy(duration: 0.3), value: compact)
            .background(Palette.bg.ignoresSafeArea())
        }
        .onChange(of: scenePhase) { _, phase in
            guard phase == .active else { return }
            selected = Schedule.dayIndex(of: Schedule.anchorDay(for: .now))
            compact = false
            recenter += 1
        }
        .sheet(item: $detail) { item in
            BlockDetail(item: item)
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .onChange(of: liveActivityOn) { _, _ in
            Task { await LiveActivitySync.run() }
        }
    }
}

// MARK: - Now

/// "Office till 5:30 pm", then how long until the next block. Compact: one smaller line, since the
/// day below already shows what comes next.
private struct NowHeader: View {
    let now: Date
    let compact: Bool
    @Binding var liveActivityOn: Bool

    var body: some View {
        let slots = Schedule.slots(from: now, count: 2)
        let current = slots[0], next = slots[1]
        let name = current.activity.category == .open ? "Open time" : current.activity.name
        HStack(alignment: compact ? .center : .top) {
            VStack(alignment: .leading, spacing: 6) {
                (Text(name) + Text(" till \(Format.clock(current.end))").italic().foregroundColor(Palette.muted))
                    .modifier(DisplaySize(size: compact ? 21 : 34))
                    .foregroundStyle(Palette.fg)
                    .lineLimit(compact ? 1 : 3)
                    .fixedSize(horizontal: false, vertical: true)
                if !compact {
                    Text("\(Format.duration(from: now, to: current.end)) until \(next.activity.name)")
                        .font(.subheadline)
                        .foregroundStyle(Palette.muted)
                        .monospacedDigit()
                        .transition(.opacity.combined(with: .offset(y: -6)))
                }
            }
            Spacer(minLength: 12)
            Menu {
                Toggle("Live Activity", isOn: $liveActivityOn)
            } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Palette.muted)
                    .frame(width: 36, height: 36)
                    .background(Palette.surface, in: Circle())
            }
            .accessibilityLabel("Settings")
        }
    }
}

/// The serif display font at a size that animates frame by frame, so the header shrinks smoothly
/// instead of jumping between two sizes.
private struct DisplaySize: ViewModifier, Animatable {
    var size: CGFloat
    var animatableData: CGFloat {
        get { size }
        set { size = newValue }
    }

    func body(content: Content) -> some View {
        content.font(.display(size))
    }
}

// MARK: - Day picker

private struct DayPicker: View {
    @Binding var selected: Int
    let today: Int

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<7, id: \.self) { index in
                let isSelected = index == selected
                Button {
                    withAnimation(.snappy) { selected = index }
                } label: {
                    Text(Schedule.dayNames[index].prefix(3))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(isSelected ? Palette.bg : (index == today ? Palette.accent : Palette.muted))
                        .frame(maxWidth: .infinity, minHeight: 44)
                    .background(isSelected ? Palette.fg : .clear, in: RoundedRectangle(cornerRadius: 10))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Schedule.dayNames[index])
                .accessibilityAddTraits(isSelected ? .isSelected : [])
            }
        }
    }
}

// MARK: - Day

private struct DayPage: View {
    let dayIndex: Int
    let isToday: Bool
    let now: Date
    let recenter: Int
    /// Called with true when the person scrolls further into the day, false when they scroll back.
    let onScroll: (Bool) -> Void
    let onSelect: (Block) -> Void

    private let hour: CGFloat = 56
    private let axis: CGFloat = 46

    /// Where the last change of direction happened, and whether the person's finger is moving the page.
    /// Scrolling the app does itself (centring on now) has no scroll phase, so it's ignored.
    @State private var anchorOffset: CGFloat = 0
    @State private var userScrolling = false

    private var blocks: [Block] { Schedule.blocks(forDay: dayIndex) }

    /// Minutes since the start of this day (6:30 am = 390), or nil when the day isn't today.
    private var nowMinutes: Double? {
        guard isToday else { return nil }
        let anchor = Schedule.anchorDay(for: now)
        return now.timeIntervalSince(anchor) / 60
    }

    private func y(_ minutes: Double) -> CGFloat { CGFloat(minutes - Double(Schedule.dayStart)) / 60 * hour }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(Schedule.dayNames[dayIndex])
                            .font(.display(30))
                            .foregroundStyle(isToday ? Palette.accent : Palette.fg)
                        Spacer()
                        Text(dayIndex >= 5 ? "WEEKEND" : "WORKDAY")
                            .font(.mono(10.5))
                            .tracking(0.8)
                            .foregroundStyle(Palette.muted)
                    }
                    .padding(.leading, axis + 6)
                    .padding(.trailing, 4)
                    .padding(.top, 18)
                    .padding(.bottom, 14)

                    ZStack(alignment: .topLeading) {
                        hourGrid
                        ForEach(Array(blocks.enumerated()), id: \.element.id) { index, block in
                            BlockView(block: block, height: CGFloat(block.minutes) / 60 * hour, state: state(of: index))
                                .frame(height: CGFloat(block.minutes) / 60 * hour - 2)
                                .padding(.leading, axis + 3)
                                .padding(.trailing, 3)
                                .padding(.top, y(Double(block.start)) + 1)
                                .onTapGesture { onSelect(block) }
                        }
                        if let m = nowMinutes {
                            // A spacer above the marker, so the id sits on the marker alone and
                            // scrolling to it lands on the line, not on the middle of the spacer.
                            VStack(spacing: 0) {
                                Color.clear.frame(height: max(0, y(m) - 12))
                                NowMarker(time: Format.clock(now), axis: axis)
                                    .id("now")
                            }
                        }
                    }
                    .frame(height: hour * 24, alignment: .topLeading)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 40)
            }
            .scrollIndicators(.hidden)
            .onScrollPhaseChange { _, phase in
                userScrolling = phase == .interacting || phase == .decelerating
            }
            .onScrollGeometryChange(for: CGFloat.self) { geo in
                geo.contentOffset.y + geo.contentInsets.top
            } action: { _, offset in
                guard userScrolling else { anchorOffset = offset; return }
                if offset < 12 {
                    onScroll(false)
                    anchorOffset = offset
                } else if offset - anchorOffset > 24 {
                    onScroll(true)
                    anchorOffset = offset
                } else if anchorOffset - offset > 24 {
                    onScroll(false)
                    anchorOffset = offset
                }
            }
            .onAppear { centreOnNow(proxy) }
            .onChange(of: recenter) { _, _ in centreOnNow(proxy) }
        }
    }

    /// Puts the current-time line in the middle of the screen. Early in the day the page can't
    /// scroll that far, so the line simply sits nearer the top.
    private func centreOnNow(_ proxy: ScrollViewProxy) {
        guard isToday else { return }
        DispatchQueue.main.async {
            proxy.scrollTo("now", anchor: .center)
        }
    }

    private var hourGrid: some View {
        ZStack(alignment: .topLeading) {
            ForEach(7...30, id: \.self) { h in
                let top = y(Double(h * 60))
                Rectangle()
                    .fill(Palette.line)
                    .frame(height: 1)
                    .padding(.leading, axis)
                    .padding(.top, top)
                Text(Format.clock(minutes: h * 60).replacingOccurrences(of: ":00", with: ""))
                    .font(.mono(10.5, weight: .regular))
                    .foregroundStyle(Palette.muted.opacity(h >= 24 ? 0.5 : 1))
                    .frame(width: axis - 8, alignment: .trailing)
                    .padding(.top, top - 7)
            }
        }
        .accessibilityHidden(true)
    }

    private func state(of index: Int) -> BlockView.Phase {
        guard let m = nowMinutes else { return .normal }
        let block = blocks[index]
        if Double(block.end) <= m { return .past }
        if Double(block.start) <= m { return .current }
        return .normal
    }
}

private struct BlockView: View {
    enum Phase { case normal, past, current }

    let block: Block
    let height: CGFloat
    let state: Phase

    var body: some View {
        let cat = block.activity.category
        let shape = RoundedRectangle(cornerRadius: 10, style: .continuous)
        Group {
            if cat == .open {
                openDay
            } else if height < 46 {
                HStack(spacing: 8) {
                    Text(block.activity.name).font(.system(size: 14, weight: .medium)).lineLimit(1)
                    Text(Format.clock(minutes: block.start).dropLast(3)).font(.mono(11, weight: .regular)).opacity(0.78)
                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 10)
                .frame(maxHeight: .infinity)
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    Text(block.activity.name).font(.system(size: 14, weight: .medium))
                    Text(Format.span(minutes: block.start, block.end)).font(.mono(11, weight: .regular)).opacity(0.78)
                    Spacer(minLength: 0)
                    if height > 120 {
                        Text(Format.duration(minutes: block.minutes)).font(.mono(11, weight: .regular)).opacity(0.6)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .foregroundStyle(cat.ink)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(cat.fill, in: shape)
        .overlay {
            if cat == .open {
                shape.strokeBorder(state == .current ? Palette.fg : Palette.lineStrong,
                                   style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
            } else if state == .current {
                shape.strokeBorder(cat.ink, lineWidth: 1.5)
            }
        }
        .opacity(state == .past ? 0.5 : 1)
        .contentShape(shape)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isButton)
    }

    private var openDay: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(Format.span(minutes: block.start, block.end)).font(.mono(11, weight: .regular)).opacity(0.78)
            (Text("Open ") + Text("day").italic()).font(.display(28))
            Text("\(Format.duration(minutes: block.minutes)) free").font(.mono(11, weight: .regular)).opacity(0.78)
            VStack(alignment: .leading, spacing: 6) {
                ForEach(block.activity.ideas, id: \.self) { idea in
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Circle().fill(Palette.lineStrong).frame(width: 5, height: 5)
                        Text(idea).font(.system(size: 13)).foregroundStyle(Palette.muted)
                    }
                }
            }
            .padding(.top, 10)
        }
        .padding(14)
    }
}

/// The current time in a pill on the hour axis, with a line across today's blocks.
private struct NowMarker: View {
    let time: String
    let axis: CGFloat

    var body: some View {
        ZStack(alignment: .leading) {
            Rectangle()
                .fill(Palette.accent)
                .frame(height: 1.5)
                .padding(.leading, axis + 3)
                .padding(.trailing, 3)
            HStack(spacing: 6) {
                PulseDot()
                Text(time).font(.mono(11))
            }
            .foregroundStyle(Palette.onAccent)
            .padding(.leading, 8)
            .padding(.trailing, 9)
            .padding(.vertical, 3)
            .background(Palette.accent, in: Capsule())
            .fixedSize()
        }
        .frame(height: 24)
        .allowsHitTesting(false)
        .accessibilityLabel("Now, \(time)")
    }
}

private struct PulseDot: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var animate = false

    var body: some View {
        Circle()
            .fill(Palette.onAccent)
            .frame(width: 6, height: 6)
            .background {
                Circle()
                    .stroke(Palette.onAccent.opacity(animate ? 0 : 0.7), lineWidth: 1.5)
                    .scaleEffect(animate ? 3 : 1)
            }
            .onAppear {
                guard !reduceMotion else { return }
                withAnimation(.easeOut(duration: 2.4).repeatForever(autoreverses: false)) { animate = true }
            }
    }
}

// MARK: - Details

struct BlockDetail: View {
    struct Item: Identifiable {
        let day: Int
        let block: Block
        var id: String { "\(day)-\(block.start)" }
    }

    let item: Item
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let activity = item.block.activity, cat = activity.category
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(cat == .open ? Color.clear : cat.fill)
                        .overlay {
                            if cat == .open {
                                RoundedRectangle(cornerRadius: 3)
                                    .strokeBorder(Palette.lineStrong, style: StrokeStyle(lineWidth: 1.5, dash: [3, 2]))
                            }
                        }
                        .frame(width: 10, height: 10)
                    Text("\(Schedule.dayNames[item.day]) · \(cat.title)".uppercased())
                        .font(.mono(11))
                        .tracking(0.8)
                        .foregroundStyle(Palette.muted)
                }
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Palette.fg)
                        .frame(width: 36, height: 36)
                        .background(Palette.bg, in: Circle())
                }
                .accessibilityLabel("Close")
            }
            Text(activity.name)
                .font(.display(40))
                .foregroundStyle(Palette.fg)
            HStack(spacing: 8) {
                Text(Format.span(minutes: item.block.start, item.block.end))
                    .font(.mono(12))
                    .foregroundStyle(cat.ink)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(cat == .open ? Palette.bg : cat.fill, in: Capsule())
                Text(Format.duration(minutes: item.block.minutes))
                    .font(.mono(12))
                    .foregroundStyle(Palette.muted)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Palette.bg, in: Capsule())
            }
            Text(activity.note)
                .foregroundStyle(Palette.muted)
            if !activity.ideas.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(activity.ideas, id: \.self) { idea in
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Circle().fill(Palette.lineStrong).frame(width: 5, height: 5)
                            Text(idea).foregroundStyle(Palette.muted)
                        }
                    }
                }
            }
            Spacer(minLength: 0)
        }
        .padding(22)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Palette.surface.ignoresSafeArea())
    }
}

#Preview {
    ContentView()
}
