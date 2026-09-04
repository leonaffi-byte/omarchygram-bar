# Omarchygram bar widget

An Omarchy 4 bar widget for [Omarchygram](https://github.com/leonaffi-byte/omarchygram). It shows unread messages and voice-call state, and focuses or launches Omarchygram when clicked.

## Requirements

- Omarchy 4 shell
- Omarchygram with status-file support

## Install

```bash
omarchy plugin add https://github.com/leonaffi-byte/omarchygram-bar.git --enable
```

Choose a placement when prompted. To place it directly after the clock instead:

```bash
omarchy bar put leoom.omarchygram --after omarchy.clock
```

## Settings

Set a value with:

```bash
omarchy bar set leoom.omarchygram <key> <value>
```

| Key | Type | Default | Purpose |
|---|---|---|---|
| `icon` | string | `` | Bar glyph; it must exist in the bar font. |
| `showCount` | boolean | `true` | Show the unread number, or a dot when false. |
| `countMuted` | boolean | `false` | Include unread messages from muted chats. |
| `hideWhenIdle` | boolean | `false` | Hide while live with no unread messages or call. |
| `appId` | string | `dev.leoom.Omarchygram` | Wayland application ID of the app window. |
| `launchCommand` | string | `omarchygram` | Command line run when no app window exists. |
| `statusPath` | string | empty | Override the status file path. |

## Troubleshooting

Find the app ID with `hyprctl clients -j`; use the window's `initialClass` value for `appId`.

If the badge never appears, the app and shell may have different `XDG_STATE_HOME` values. Set `statusPath` to the app's status file explicitly.

Plugin authors can check the package with:

```bash
omarchy plugin validate .
```

## Removal

```
omarchy plugin disable leoom.omarchygram   # take it off the bar, keep it installed
omarchy plugin remove leoom.omarchygram    # uninstall (deletes ~/.config/omarchy/plugins/leoom.omarchygram)
```

The widget writes nothing of its own: its settings live in the bar layout
entry of `~/.config/omarchy/shell.json`, which `omarchy plugin remove` cleans
up, and the status file belongs to the Omarchygram app.

## License

MIT. See `LICENSE`.
