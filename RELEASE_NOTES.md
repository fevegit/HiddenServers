# HiddenServers v1.0.0

First stable release of HiddenServers.

## Highlights

- Hide individual Discord servers.
- Hide complete server folders.
- Separate storage for individually hidden servers and hidden folders.
- Restore hidden items from the plugin settings.
- Safety protection against rules that could hide the entire guild navigation.

## Windows (PowerShell)

```powershell
Set-Location "$HOME\Vencord\src\userplugins"
git clone https://github.com/fevegit/HiddenServers.git hiddenServers

Set-Location "$HOME\Vencord"
pnpm build
pnpm inject
```

## Linux (Bash)

```bash
cd "$HOME/Vencord/src/userplugins"
git clone https://github.com/fevegit/HiddenServers.git hiddenServers

cd "$HOME/Vencord"
pnpm build
pnpm inject
```

Fully restart Discord and enable **HiddenServers** in **Settings -> Vencord -> Plugins**.

See the repository README for complete installation, updating, uninstalling and troubleshooting instructions.
