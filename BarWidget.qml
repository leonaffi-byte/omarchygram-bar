import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import qs.Commons
import qs.Ui
import "Model.js" as Model

BarWidget {
  id: root
  moduleName: "leoom.omarchygram"

  property var status: null
  property double nowMs: Date.now()

  readonly property string configuredStatusPath: String(setting("statusPath", ""))
  readonly property string stateHome: {
    var xdg = Quickshell.env("XDG_STATE_HOME")
    if (xdg && xdg.indexOf("/") === 0) return xdg
    var home = Quickshell.env("HOME")
    return home ? home + "/.local/state" : ""
  }
  readonly property string statusFilePath: configuredStatusPath !== ""
    ? configuredStatusPath
    : (stateHome !== "" ? stateHome + "/omarchygram/status.json" : "")
  readonly property string statusDirectory: directoryOf(statusFilePath)
  readonly property string statusParentDirectory: directoryOf(statusDirectory)
  readonly property var model: Model.view(status, {
    icon: setting("icon", "\uf1d8"),
    showCount: setting("showCount", true),
    countMuted: setting("countMuted", false),
    hideWhenIdle: setting("hideWhenIdle", false)
  }, nowMs)

  function directoryOf(path) {
    if (!path) return ""
    var slash = path.lastIndexOf("/")
    if (slash < 0) return ""
    return slash === 0 ? "/" : path.slice(0, slash)
  }

  function apply(text) {
    root.nowMs = Date.now()
    root.status = Model.parse(text)
  }

  function reload() {
    statusFile.reload()
  }

  function activateOrLaunch() {
    var appId = setting("appId", "dev.leoom.Omarchygram")
    var launchCommand = setting("launchCommand", "omarchygram")
    var list = ToplevelManager.toplevels && ToplevelManager.toplevels.values
    if (list) {
      for (var i = 0; i < list.length; i++) {
        var t = list[i]
        if (t && t.appId === appId) {
          t.activate()
          return
        }
      }
    }

    if (root.bar) root.bar.run(launchCommand)
  }

  visible: model.visible
  implicitWidth: content.implicitWidth
  implicitHeight: content.implicitHeight

  FileView {
    id: statusFile
    path: root.statusFilePath
    watchChanges: true
    printErrors: false
    onLoaded: root.apply(text())
    onFileChanged: reload()
    onLoadFailed: root.apply("")
  }

  FileView {
    id: stateDirWatch
    path: root.statusDirectory
    watchChanges: true
    printErrors: false
    // Coalesce bursts: a busy parent directory (other apps writing state)
      // must not turn into a reload storm that stalls the shell.
      onFileChanged: Qt.callLater(statusFile.reload)
  }

  FileView {
    id: stateParentWatch
    path: root.statusParentDirectory
    watchChanges: true
    printErrors: false
    // Coalesce bursts: a busy parent directory (other apps writing state)
      // must not turn into a reload storm that stalls the shell.
      onFileChanged: Qt.callLater(statusFile.reload)
  }

  Timer {
    interval: model.callActive ? 1000 : 60000
    running: model.live || model.callActive
    repeat: true
    onTriggered: root.nowMs = Date.now()
  }

  IpcHandler {
    target: "leoom.omarchygram"

    function refresh(): void {
      root.broadcast("reload")
    }
  }

  Row {
    id: content
    spacing: root.vertical ? 0 : Style.spacing.xxs

    BarIconButton {
      id: button
      bar: root.bar
      slotSize: Style.bar.statusSlot
      fontSize: Style.font.caption
      text: model.glyph
      tooltipText: model.tooltip
      // In a call: tint with the theme accent — the shell's highlight token
      // (selection, borders, countdowns). The button's default activeColor is
      // `bar.urgent`, the theme's red, which would read as an alarm.
      active: model.inCall
      activeColor: Color.accent
      // Not running / stale: dimmed the way Workspaces dims unoccupied slots.
      opacity: model.live ? 1 : 0.5
      onPressed: root.activateOrLaunch()
    }

    Text {
      textFormat: Text.PlainText
      visible: !root.vertical && model.badge !== ""
      height: button.implicitHeight
      text: model.badge
      color: Color.foreground
      font.family: Style.font.family
      // Same size as the workspace digits and the agents badge (bar icon font),
      // not the smaller caption size.
      font.pixelSize: Style.bar.iconFont
      renderType: Text.NativeRendering
      verticalAlignment: Text.AlignVCenter
    }
  }
}
