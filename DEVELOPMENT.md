# Development

The plugin is loaded directly from `manifest.json`, `BarWidget.qml`, and
`Model.js`; there is no compilation or dependency-install step. The widget's
status-file contract and behavior are described in [SPEC.md](SPEC.md).

## Local validation

From the repository root:

```sh
node tests/run.js
omarchy plugin validate .
/usr/lib/qt6/bin/qmllint BarWidget.qml
```

The Node tests use a fixed clock and synthetic status fixtures. The Omarchy
validator checks the manifest, entry points, and absence of symlinks without
installing the plugin. Qt 6 provides the QML linter; standalone linting may
report unresolved `qs.*` imports because those modules are supplied by the
running Omarchy shell. Syntax errors still need to be resolved.

## Manual development notes

The `statusPath` setting can point at a synthetic fixture in a quiet directory
for manual checks. Its `updated_at` value needs to be recent for a live-state
check; the stored fixtures have fixed timestamps for the Node tests. An empty
`statusPath` restores the app's normal status-file location. The widget watches
the file's directory and its parent, so a busy shared temporary directory can
cause unrelated reloads.

Settings changes apply live. If edited QML still shows cached code after a
plugin reload, `omarchy restart shell` reloads the shell and its QML modules.
For slow shell IPC responses, `OMARCHY_SHELL_IPC_TIMEOUT=15s` increases the
command timeout from the normal two seconds.

## Distribution

Marketplace installation clones the complete repository tree. Development
information lives in ordinary Markdown documentation; the installable tree
contains no `AGENTS.md` or `CLAUDE.md` coding-agent instruction files.
Validation of a new commit is separate from marketplace maintainer approval.
