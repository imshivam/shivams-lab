import SwiftUI
import WidgetKit

@main
struct MyWeekWidgets: WidgetBundle {
    var body: some Widget {
        NowWidget()
        WeekLiveActivity()
    }
}
