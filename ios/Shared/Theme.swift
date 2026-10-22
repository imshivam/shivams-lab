import SwiftUI
import UIKit

// The same palette as the web timetable, in light and dark.

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255,
                  green: CGFloat((hex >> 8) & 0xFF) / 255,
                  blue: CGFloat(hex & 0xFF) / 255,
                  alpha: 1)
    }
}

extension Color {
    init(light: UInt32, dark: UInt32) {
        self.init(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }

    init(hex: UInt32) { self.init(uiColor: UIColor(hex: hex)) }
}

enum Palette {
    static let bg = Color(light: 0xF6F7F4, dark: 0x111312)
    static let surface = Color(light: 0xFFFFFF, dark: 0x1A1D1B)
    static let fg = Color(light: 0x1B1F1C, dark: 0xECEEEA)
    static let muted = Color(light: 0x646B66, dark: 0x99A09B)
    static let line = Color(light: 0xE4E7E2, dark: 0x252926)
    static let lineStrong = Color(light: 0xC9CEC8, dark: 0x3A3F3B)
    static let accent = Color(light: 0xC23F22, dark: 0xFF7357)
    static let onAccent = Color(light: 0xFFFFFF, dark: 0x1A0D09)
}

extension Category {
    /// Soft fill behind a block.
    var fill: Color {
        switch self {
        case .sleep: Color(light: 0xE8E9F4, dark: 0x202236)
        case .rise: Color(light: 0xF5EBD6, dark: 0x33291A)
        case .travel: Color(light: 0xECEDE9, dark: 0x202321)
        case .work: Color(light: 0xDEE8EF, dark: 0x19262F)
        case .move: Color(light: 0xDCEEE1, dark: 0x18291E)
        case .food: Color(light: 0xF6E1D6, dark: 0x33211A)
        case .walk: Color(light: 0xEEE0EC, dark: 0x2E1E2B)
        case .open: Palette.bg
        }
    }

    /// Text and icons on that fill.
    var ink: Color {
        switch self {
        case .sleep: Color(light: 0x3A4072, dark: 0xBDC1F2)
        case .rise: Color(light: 0x74501A, dark: 0xEBCB8F)
        case .travel: Color(light: 0x565B57, dark: 0xABB0AC)
        case .work: Color(light: 0x2A5170, dark: 0xA3C7E2)
        case .move: Color(light: 0x28603C, dark: 0xA0D7AF)
        case .food: Color(light: 0x86402A, dark: 0xF0B89E)
        case .walk: Color(light: 0x6A3560, dark: 0xE2B4D7)
        case .open: Palette.fg
        }
    }

    /// The Dynamic Island is always black, so it always uses the dark-mode ink.
    var islandInk: Color {
        switch self {
        case .sleep: Color(hex: 0xBDC1F2)
        case .rise: Color(hex: 0xEBCB8F)
        case .travel: Color(hex: 0xC4C8C5)
        case .work: Color(hex: 0xA3C7E2)
        case .move: Color(hex: 0xA0D7AF)
        case .food: Color(hex: 0xF0B89E)
        case .walk: Color(hex: 0xE2B4D7)
        case .open: Color(hex: 0xFF7357)
        }
    }
}

extension Font {
    /// New York, Apple's serif, in place of the web page's display face.
    static func display(_ size: CGFloat) -> Font { .system(size: size, weight: .regular, design: .serif) }
    static func mono(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }
}
