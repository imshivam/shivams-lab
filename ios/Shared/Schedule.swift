import Foundation

// The routine, shared by the app, the widgets and the Live Activity.
// Times are minutes after midnight. A day runs from waking (6:30 am) to waking the next morning,
// so anything after midnight is stored as 24 h + time (6:30 am the next day = 1830).

enum Category: String, Codable, Hashable {
    case sleep, rise, travel, work, move, food, walk, open

    var title: String {
        switch self {
        case .sleep: "Sleep"
        case .rise: "Morning"
        case .travel: "Commute"
        case .work: "Work"
        case .move: "Workout"
        case .food: "Cooking & dinner"
        case .walk: "Walk & wind down"
        case .open: "Open time"
        }
    }
}

struct Event: Hashable {
    let key: String
    let name: String
    let category: Category
    let symbol: String
    let note: String
    var ideas: [String] = []

    static let rise = Event(key: "rise", name: "Rise & get ready", category: .rise, symbol: "sunrise.fill",
                               note: "Wake up, freshen up and get ready for the day.")
    static let commute = Event(key: "commute", name: "Commute", category: .travel, symbol: "signpost.right.fill",
                                  note: "On the way to the office.")
    static let office = Event(key: "office", name: "Office", category: .work, symbol: "briefcase.fill",
                                 note: "Working at the office.")
    static let home = Event(key: "home", name: "Commute home", category: .travel, symbol: "house.fill",
                               note: "Heading back home.")
    static let workout = Event(key: "workout", name: "Workout", category: .move, symbol: "figure.run",
                                  note: "An hour of exercise before dinner.")
    static let cook = Event(key: "cook", name: "Cook dinner", category: .food, symbol: "frying.pan.fill",
                               note: "Cooking dinner at home.")
    static let dinner = Event(key: "dinner", name: "Dinner", category: .food, symbol: "fork.knife",
                                 note: "Sitting down to eat dinner.")
    static let walk = Event(key: "walk", name: "Walk & wind down", category: .walk, symbol: "figure.walk",
                               note: "A walk with my wife, then getting ready for bed.")
    static let sleep = Event(key: "sleep", name: "Sleep", category: .sleep, symbol: "bed.double.fill",
                                note: "Lights out. A full 7 hours 30 minutes before the alarm.")
    static let open = Event(key: "open", name: "Open day", category: .open, symbol: "sparkles",
                               note: "No commute and no office. Ten free hours to spend however we like.",
                               ideas: ["Brunch together", "Breakfast at a café we haven't tried",
                                       "A day out somewhere new", "Or nothing at all"])

    static let all: [Event] = [rise, commute, office, home, workout, cook, dinner, walk, sleep, open]
    static func named(_ key: String) -> Event { all.first { $0.key == key } ?? rise }
}

struct Block: Hashable, Identifiable {
    let start: Int
    let end: Int
    let activity: Event
    var id: Int { start }
    var minutes: Int { end - start }
}

/// A block placed on the calendar.
struct Slot: Hashable, Codable {
    let key: String
    let start: Date
    let end: Date
    var activity: Event { Event.named(key) }
}

enum Schedule {
    static let dayStart = 6 * 60 + 30
    static let dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    private static func t(_ h: Int, _ m: Int = 0) -> Int { h * 60 + m }

    static let weekday: [Block] = [
        Block(start: t(6, 30), end: t(8, 30), activity: .rise),
        Block(start: t(8, 30), end: t(9, 30), activity: .commute),
        Block(start: t(9, 30), end: t(17, 30), activity: .office),
        Block(start: t(17, 30), end: t(18, 30), activity: .home),
        Block(start: t(18, 30), end: t(19, 30), activity: .workout),
        Block(start: t(19, 30), end: t(20, 30), activity: .cook),
        Block(start: t(20, 30), end: t(21, 30), activity: .dinner),
        Block(start: t(21, 30), end: t(23), activity: .walk),
        Block(start: t(23), end: t(30, 30), activity: .sleep),
    ]

    static let weekend: [Block] = [
        Block(start: t(6, 30), end: t(8, 30), activity: .rise),
        Block(start: t(8, 30), end: t(18, 30), activity: .open),
    ] + weekday.suffix(5)

    /// Monday = 0 … Sunday = 6.
    static func blocks(forDay index: Int) -> [Block] { index >= 5 ? weekend : weekday }

    static func dayIndex(of date: Date, calendar: Calendar = .current) -> Int {
        (calendar.component(.weekday, from: date) + 5) % 7
    }

    /// The morning the current day began. Before 6:30 am still belongs to the night before.
    static func anchorDay(for date: Date, calendar: Calendar = .current) -> Date {
        let startOfDay = calendar.startOfDay(for: date)
        let minutes = calendar.component(.hour, from: date) * 60 + calendar.component(.minute, from: date)
        return minutes < dayStart ? calendar.date(byAdding: .day, value: -1, to: startOfDay)! : startOfDay
    }

    static func date(_ minutes: Int, on day: Date, calendar: Calendar = .current) -> Date {
        let base = calendar.date(byAdding: .day, value: minutes / 1440, to: day)!
        let m = minutes % 1440
        return calendar.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: base)!
    }

    static func slots(onDayStarting day: Date, calendar: Calendar = .current) -> [Slot] {
        blocks(forDay: dayIndex(of: day, calendar: calendar)).map {
            Slot(key: $0.activity.key,
                 start: date($0.start, on: day, calendar: calendar),
                 end: date($0.end, on: day, calendar: calendar))
        }
    }

    /// The block happening at `date`, followed by the ones after it.
    static func slots(from date: Date, count: Int, calendar: Calendar = .current) -> [Slot] {
        var result: [Slot] = []
        var day = anchorDay(for: date, calendar: calendar)
        while result.count < count {
            result += slots(onDayStarting: day, calendar: calendar).filter { $0.end > date }
            day = calendar.date(byAdding: .day, value: 1, to: day)!
        }
        return Array(result.prefix(count))
    }
}

enum Format {
    private static let clockFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "h:mm a"
        f.amSymbol = "am"
        f.pmSymbol = "pm"
        return f
    }()

    static func clock(_ date: Date) -> String { clockFormatter.string(from: date) }

    static func clock(minutes: Int) -> String {
        let m = minutes % 1440
        let h = m / 60
        return "\(h % 12 == 0 ? 12 : h % 12):\(String(format: "%02d", m % 60)) \(h < 12 ? "am" : "pm")"
    }

    /// 7:30 – 8:30 pm, or 11:00 pm – 6:30 am
    static func span(_ a: String, _ b: String) -> String {
        a.suffix(2) == b.suffix(2) ? "\(a.dropLast(3)) – \(b)" : "\(a) – \(b)"
    }

    static func span(minutes a: Int, _ b: Int) -> String { span(clock(minutes: a), clock(minutes: b)) }
    static func span(_ a: Date, _ b: Date) -> String { span(clock(a), clock(b)) }

    static func duration(minutes: Int) -> String {
        let h = minutes / 60, m = minutes % 60
        if h == 0 { return "\(m) min" }
        if m > 0 { return "\(h) h \(m) min" }
        return h == 1 ? "1 hour" : "\(h) hours"
    }

    static func duration(from a: Date, to b: Date) -> String {
        duration(minutes: max(0, Int((b.timeIntervalSince(a) / 60).rounded())))
    }
}
