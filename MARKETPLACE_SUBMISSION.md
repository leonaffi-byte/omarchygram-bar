### Repository URL

https://github.com/leoom/omarchygram-bar

### Category

Communication

### Tags

telegram, messaging, bar

### Suggest a missing tag

_No response_

### Maintainer notes

This bar widget reads Omarchygram's local status file and makes no network requests. A left click activates the first matching Wayland toplevel. When no matching window exists, it runs the user-configurable `launchCommand` through the bar host.

The status path follows `XDG_STATE_HOME` only when it is absolute and otherwise falls back to `$HOME/.local/state/omarchygram/status.json`. Users can override it with `statusPath`. The plugin requires Omarchy 4 and an Omarchygram build that writes status-file version 1.

### Submission checklist

- [ ] The repository is public and contains installation instructions.
- [ ] I have documented the plugin license and external requirements.
- [ ] I confirm that I own or have permission to submit this plugin.
- [ ] The plugin does not overwrite user configuration.
- [ ] I understand that approval is for listing and is not a security review.
