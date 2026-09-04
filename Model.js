var DEFAULT_ICON = "\uf1d8"
var PHONE_ICON = "\uf095"
var CALL_PHASES = {
  requesting: true,
  incoming: true,
  exchanging: true,
  connecting: true,
  active: true
}

function finiteNumber(value) {
  return typeof value === "number" && isFinite(value)
}

function count(value) {
  return finiteNumber(value) && value >= 0 && Math.floor(value) === value ? value : 0
}

function parsedTime(value) {
  if (typeof value !== "string") return NaN
  var parsed = Date.parse(value)
  return isFinite(parsed) ? parsed : NaN
}

function normalizeCall(value) {
  if (value === null) return null
  if (typeof value !== "object" || Array.isArray(value)) return null
  if (typeof value.phase !== "string" || CALL_PHASES[value.phase] !== true) return null
  if (typeof value.peer !== "string") return null
  if (typeof value.outgoing !== "boolean" || typeof value.muted !== "boolean") return null

  var connectedAtMs = NaN
  if (value.connected_at !== null) {
    connectedAtMs = parsedTime(value.connected_at)
    if (!isFinite(connectedAtMs)) return null
  }

  return {
    phase: value.phase,
    peer: value.peer.length > 0 ? value.peer : "Unknown caller",
    outgoing: value.outgoing,
    muted: value.muted,
    connected_at: value.connected_at,
    connectedAtMs: connectedAtMs
  }
}

function parse(text) {
  var value
  try {
    value = JSON.parse(text)
  } catch (error) {
    return null
  }

  if (value === null || typeof value !== "object" || Array.isArray(value)) return null
  if (value.version !== 1 || typeof value.running !== "boolean") return null

  var heartbeat = finiteNumber(value.heartbeat_secs) && value.heartbeat_secs > 0
    ? value.heartbeat_secs : 30

  return {
    version: 1,
    running: value.running,
    heartbeat_secs: heartbeat,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
    updatedAtMs: parsedTime(value.updated_at),
    unread: count(value.unread),
    unread_chats: count(value.unread_chats),
    unread_with_muted: count(value.unread_with_muted),
    unread_chats_with_muted: count(value.unread_chats_with_muted),
    call: normalizeCall(value.call)
  }
}

function pad2(value) {
  return value < 10 ? "0" + value : String(value)
}

function formatElapsed(connectedAtIso, nowMs) {
  var startedMs = parsedTime(connectedAtIso)
  if (!isFinite(startedMs) || !finiteNumber(nowMs)) return ""

  var seconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000))
  var hours = Math.floor(seconds / 3600)
  var minutes = Math.floor((seconds % 3600) / 60)
  var remainder = seconds % 60

  if (hours > 0) return hours + ":" + pad2(minutes) + ":" + pad2(remainder)
  return pad2(minutes) + ":" + pad2(remainder)
}

function setting(settings, name, fallback) {
  if (!settings || settings[name] === undefined || settings[name] === null) return fallback
  return settings[name]
}

function toBool(value, fallback) {
  if (value === true || value === "true" || value === 1 || value === "1") return true
  if (value === false || value === "false" || value === 0 || value === "0") return false
  return fallback
}

function view(status, settings, nowMs) {
  var iconSetting = setting(settings, "icon", DEFAULT_ICON)
  var icon = typeof iconSetting === "string" && iconSetting.length > 0 ? iconSetting : DEFAULT_ICON
  var stopped = {
    live: false,
    visible: true,
    glyph: icon,
    badge: "",
    tooltip: "Omarchygram is not running",
    inCall: false,
    callActive: false
  }

  if (!status || status.running !== true || !isFinite(status.updatedAtMs)) return stopped
  if (!finiteNumber(nowMs) || nowMs - status.updatedAtMs > 3 * status.heartbeat_secs * 1000) return stopped

  var includeMuted = toBool(setting(settings, "countMuted", false), false)
  var unread = includeMuted ? status.unread_with_muted : status.unread
  var unreadChats = includeMuted ? status.unread_chats_with_muted : status.unread_chats
  var showCount = toBool(setting(settings, "showCount", true), true)
  var badge = unread > 0 ? (showCount ? String(unread) : "•") : ""
  var call = status.call
  var tooltip = unread > 0 ? unread + " unread in " + unreadChats + " chats" : "Omarchygram"
  var glyph = call ? PHONE_ICON : icon
  var callActive = false

  if (call) {
    if (call.phase === "incoming") {
      tooltip = "Incoming call from " + call.peer
    } else if (call.phase === "active") {
      var elapsed = formatElapsed(call.connected_at, nowMs)
      callActive = elapsed !== ""
      tooltip = "In call with " + call.peer
      if (elapsed !== "") tooltip += " · " + elapsed
      if (call.muted) tooltip += " · muted"
    } else {
      tooltip = call.outgoing ? "Calling " + call.peer + "…" : "Connecting to " + call.peer + "…"
    }
  }

  return {
    live: true,
    visible: call !== null || unread > 0 || !toBool(setting(settings, "hideWhenIdle", false), false),
    glyph: glyph,
    badge: badge,
    tooltip: tooltip,
    inCall: call !== null,
    callActive: callActive
  }
}
