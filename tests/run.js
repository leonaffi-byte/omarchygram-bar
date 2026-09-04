"use strict"

const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")

const root = path.resolve(__dirname, "..")
const source = fs.readFileSync(path.join(root, "Model.js"), "utf8")
const Model = vm.runInNewContext(
  source + "\n;({ parse: parse, view: view, formatElapsed: formatElapsed })",
  { JSON, Date, Math, Number, String, Array, Object, isFinite }
)

const nowMs = Date.parse("2026-09-04T06:12:33Z")
const defaults = {
  icon: "\uf1d8",
  showCount: true,
  countMuted: false,
  hideWhenIdle: false
}

const cases = [
  ["absent", "absent", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["absent-hide-when-idle", "absent", { hideWhenIdle: true }, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["invalid-json", "invalid-json", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["wrong-version", "wrong-version", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["not-running", "not-running", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["not-running-hide-when-idle", "not-running", { hideWhenIdle: true }, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["stale", "stale", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["live-45s", "live-45s", {}, [true, true, "\uf1d8", "3", "3 unread in 2 chats", false, false]],
  ["stale-90s-plus", "stale-90s-plus", {}, [false, true, "\uf1d8", "", "Omarchygram is not running", false, false]],
  ["idle", "idle", {}, [true, true, "\uf1d8", "", "Omarchygram", false, false]],
  ["idle-hide-when-idle", "idle-hide-when-idle", { hideWhenIdle: true }, [true, false, "\uf1d8", "", "Omarchygram", false, false]],
  ["idle-hide-when-idle-string", "idle-hide-when-idle", { hideWhenIdle: "true" }, [true, false, "\uf1d8", "", "Omarchygram", false, false]],
  ["unread", "unread", {}, [true, true, "\uf1d8", "3", "3 unread in 2 chats", false, false]],
  ["unread-hidden-count", "unread-hidden-count", { showCount: false }, [true, true, "\uf1d8", "•", "3 unread in 2 chats", false, false]],
  ["unread-hidden-count-string", "unread-hidden-count", { showCount: "false" }, [true, true, "\uf1d8", "•", "3 unread in 2 chats", false, false]],
  ["unread-count-muted", "unread-count-muted", { countMuted: true }, [true, true, "\uf1d8", "7", "7 unread in 4 chats", false, false]],
  ["unread-count-muted-string", "unread-count-muted", { countMuted: "true" }, [true, true, "\uf1d8", "7", "7 unread in 4 chats", false, false]],
  ["malformed-counts", "malformed-counts", { countMuted: true }, [true, true, "\uf1d8", "", "Omarchygram", false, false]],
  ["incoming", "incoming", {}, [true, true, "\uf095", "", "Incoming call from Marta", true, false]],
  ["connecting-incoming", "connecting-incoming", {}, [true, true, "\uf095", "", "Connecting to Marta…", true, false]],
  ["outgoing", "outgoing", {}, [true, true, "\uf095", "", "Calling Marta…", true, false]],
  ["active", "active", {}, [true, true, "\uf095", "", "In call with Marta · 02:32", true, true]],
  ["active-muted", "active-muted", {}, [true, true, "\uf095", "", "In call with Marta · 02:32 · muted", true, true]],
  ["active-no-connected-at", "active-no-connected-at", {}, [true, true, "\uf095", "", "In call with Marta", true, false]],
  ["active-future-connected-at", "active-future-connected-at", {}, [true, true, "\uf095", "", "In call with Marta · 00:00", true, true]],
  ["unknown-phase", "unknown-phase", {}, [true, true, "\uf1d8", "", "Omarchygram", false, false]],
  ["empty-peer", "empty-peer", {}, [true, true, "\uf095", "", "Incoming call from Unknown caller", true, false]],
  ["empty-icon", "idle", { icon: "" }, [true, true, "\uf1d8", "", "Omarchygram", false, false]]
]

function snapshot(view) {
  return [view.live, view.visible, view.glyph, view.badge, view.tooltip, view.inCall, view.callActive]
}

let failed = 0
for (const [name, fixture, overrides, expected] of cases) {
  try {
    const text = fs.readFileSync(path.join(__dirname, "fixtures", fixture + ".json"), "utf8")
    const status = Model.parse(text)
    const actual = snapshot(Model.view(status, { ...defaults, ...overrides }, nowMs))
    assert.deepEqual(actual, expected)
    process.stdout.write("ok " + name + "\n")
  } catch (error) {
    failed++
    process.stderr.write("not ok " + name + ": " + error.message + "\n")
  }
}

for (const name of ["absent", "invalid-json", "wrong-version"]) {
  try {
    const text = fs.readFileSync(path.join(__dirname, "fixtures", name + ".json"), "utf8")
    assert.equal(Model.parse(text), null)
    process.stdout.write("ok parse " + name + "\n")
  } catch (error) {
    failed++
    process.stderr.write("not ok parse " + name + ": " + error.message + "\n")
  }
}

const elapsedCases = [
  ["0 s", "2026-09-04T06:12:33Z", "00:00"],
  ["59 s", "2026-09-04T06:11:34Z", "00:59"],
  ["3599 s", "2026-09-04T05:12:34Z", "59:59"],
  ["3600 s", "2026-09-04T05:12:33Z", "1:00:00"],
  ["null", null, ""],
  ["garbage", "not-a-date", ""]
]

for (const [name, value, expected] of elapsedCases) {
  try {
    assert.equal(Model.formatElapsed(value, nowMs), expected)
    process.stdout.write("ok formatElapsed " + name + "\n")
  } catch (error) {
    failed++
    process.stderr.write("not ok formatElapsed " + name + ": " + error.message + "\n")
  }
}

if (failed > 0) process.exit(1)
