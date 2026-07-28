# HiddenServers

HiddenServers is a custom Vencord userplugin that lets you hide individual Discord servers or complete server folders from the guild list.

## Features

- Right-click a server and choose **Hide server**.
- Right-click a folder and choose **Hide folder**.
- Hidden servers and hidden folders are stored separately.
- Hiding a folder does not add its servers to the individually hidden server list.
- Hidden items can be restored from the plugin settings.
- Includes a Vencord Toolbox action to restore every hidden server and folder.
- Changes are applied immediately without restarting Discord.

## Technical behavior

HiddenServers keeps the two kinds of hidden items strictly separate:

- `hiddenServerIds` contains only servers hidden individually.
- `hiddenFolderIds` contains only folders hidden as complete folders.

Hiding a folder never copies the IDs of its servers into `hiddenServerIds`.

## Requirements

Custom Vencord plugins require a Vencord installation built from source.

Read the official Vencord guides before continuing:

- https://docs.vencord.dev/installing/
- https://docs.vencord.dev/installing/custom-plugins/

Install Git, Node.js and pnpm. Verify that they are available:

```text
git --version
node --version
pnpm --version
```

> Already have Vencord built from source? Skip the Vencord clone step and install the plugin inside your existing `src/userplugins` folder.

## Installation

### Windows (PowerShell)

Open PowerShell and run:

```powershell
Set-Location $HOME

git clone https://github.com/Vendicated/Vencord.git
Set-Location .\Vencord

pnpm install --frozen-lockfile

New-Item -ItemType Directory -Path .\src\userplugins -Force | Out-Null
Set-Location .\src\userplugins

git clone https://github.com/fevegit/HiddenServers.git hiddenServers

Set-Location ..\..

pnpm build
pnpm inject
```

After injection:

1. Fully close Discord, including the system tray process.
2. Start Discord again.
3. Open **Settings -> Vencord -> Plugins**.
4. Enable **HiddenServers**.

The final plugin path should be:

```text
%USERPROFILE%\Vencord\src\userplugins\hiddenServers\
```

### Linux (Bash)

Open a terminal and run:

```bash
cd "$HOME"

git clone https://github.com/Vendicated/Vencord.git
cd Vencord

pnpm install --frozen-lockfile

mkdir -p src/userplugins
cd src/userplugins

git clone https://github.com/fevegit/HiddenServers.git hiddenServers

cd ../..

pnpm build
pnpm inject
```

After injection:

1. Fully close Discord.
2. Start Discord again.
3. Open **Settings -> Vencord -> Plugins**.
4. Enable **HiddenServers**.

The final plugin path should be:

```text
$HOME/Vencord/src/userplugins/hiddenServers/
```

For Vesktop or another non-standard Discord client, follow the official Vencord installation guide for that client and keep the plugin inside the same Vencord source tree.

## Usage

### Hide a server

Right-click the server icon and select **Hide server**.

### Hide a folder

Right-click the folder and select **Hide folder**.

### Restore hidden items

Open:

```text
Settings -> Vencord -> Plugins -> HiddenServers
```

The settings contain separate sections for individually hidden servers and hidden folders.

You can also use **Unhide every server and folder** from Vencord Toolbox.

## Updating

### Windows (PowerShell)

```powershell
Set-Location "$HOME\Vencord\src\userplugins\hiddenServers"
git pull --ff-only

Set-Location "$HOME\Vencord"
pnpm build
pnpm inject
```

### Linux (Bash)

```bash
cd "$HOME/Vencord/src/userplugins/hiddenServers"
git pull --ff-only

cd "$HOME/Vencord"
pnpm build
pnpm inject
```

Fully restart Discord afterwards.

## Uninstalling

Disable HiddenServers in Vencord before removing its folder.

### Windows (PowerShell)

```powershell
Set-Location "$HOME\Vencord"

Remove-Item -LiteralPath ".\src\userplugins\hiddenServers" -Recurse -Force

pnpm build
pnpm inject
```

### Linux (Bash)

```bash
cd "$HOME/Vencord"

rm -rf -- "src/userplugins/hiddenServers"

pnpm build
pnpm inject
```

Fully restart Discord after rebuilding.

## Troubleshooting

### The entire server bar disappears

Update to the latest version. Version 1.0.0 contains a selector safety guard that refuses rules capable of hiding the complete guild navigation.

### The plugin does not appear

Check that the plugin folder is exactly:

```text
Vencord/src/userplugins/hiddenServers/
```

The folder itself must directly contain `index.tsx`.

### A hidden server or folder needs to be restored

Open the HiddenServers settings and use the corresponding **Show** button, or use the Vencord Toolbox action to restore every hidden item.

## Notes

- This is an unofficial custom userplugin and is not supported by the Vencord team.
- Custom plugins require rebuilding Vencord whenever their source changes.
- Use `src/userplugins`; do not copy the plugin into `src/plugins`.
- This repository contains only plugin source code and public documentation.

## License

GPL-3.0-or-later.
