# Project
- Type: small  <!-- companion plugin of omarchygram (small); recorded 2026-09-04, never ask again -->
- Goal: <one line>

# Commands (orchestrator runs these directly — never delegate)
- Build: <cmd>
- Test: <cmd>
- Deploy: <cmd>
- Upload/publish: <cmd>

# Delegation notes
- Areas external agents must NOT touch: <list, e.g. auth code, payment code, .env>
- Commit tags: delegated commits end with [codex] / [grok] / [kimi] / [agy]

# Omarchy plugin dev notes (learned 2026-09-04)
- The shell caches compiled QML: after editing `BarWidget.qml`/`Model.js` in `~/.config/omarchy/plugins/leoom.omarchygram`, `omarchy plugin disable/enable` and the "Local plugin changed, reloading" log lines do NOT load new widget code — run `omarchy-restart-shell`. Settings changes (`omarchy bar set`) do apply live.
- `qmllint` on PATH is a broken Qt5 build (exit 255, no output); use `/usr/lib/qt6/bin/qmllint BarWidget.qml` (exit 0; unresolved `qs.*` import warnings are expected).
- Test states without touching the real status file: `omarchy bar set leoom.omarchygram statusPath /path/to/fixture.json` (fixtures must have a fresh `updated_at`, else the widget treats them as stale = not running); reset with `statusPath ""`. Keep fixtures in a quiet directory — the widget watches the file's directory and its parent.
- `omarchy-shell` IPC has a 2 s timeout; `OMARCHY_SHELL_IPC_TIMEOUT=15s` for slow moments.
