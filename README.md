<div align="center">

<img src="assets/banner.svg" alt="SAMYAZA-MD" width="100%">

# SAMYAZA-MD

**A feature-rich WhatsApp automation bot built on [Baileys](https://github.com/WhiskeySockets/Baileys).**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-5FA04E?style=flat-square&logo=node.js)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-6.7.18-25D366?style=flat-square&logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Multi--device-25D366?style=flat-square&logo=whatsapp)](https://web.whatsapp.com)

</div>

---

## Menu Preview

![Menu](assets/menu-image.jpg)

The bot menu is rendered with the image above. You can replace it at any time
with `.menuimage` — see [Customising the Menu](#customising-the-menu).

---

## Table of Contents

- [Features](#features)
- [Command Categories](#command-categories)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Pairing and Login](#pairing-and-login)
- [Usage](#usage)
- [Owner Commands](#owner-commands)
- [Customising the Menu](#customising-the-menu)
- [Project Structure](#project-structure)
- [Optional Plugin Dependencies](#optional-plugin-dependencies)
- [Troubleshooting](#troubleshooting)
- [Disclaimer](#disclaimer)
- [Credits](#credits)

---

## Features

| | |
|---|---|
| 🟢 **Multi-device (Baileys)** | No WhatsApp Business API needed — links like a normal WhatsApp Web session. |
| 📚 **219 commands** | Spread across 22 categories, all loaded automatically from `plugins/`. |
| 🧩 **288 plugin files** | Every command is a self-contained file. Drop one in and it is live. |
| 🔐 **Owner & sudo controls** | Access modes, broadcast tools, plugin management and bot settings. |
| 👥 **Full group management** | Ban, kick, promote, demote, mute, warn, tags, anti-link and anti-tag. |
| 🤖 **AI commands** | GPT, LLaMA and Mistral chat, plus DALL·E, Flux, Diffusion and Sora image/video generation. |
| ⬇️ **Media downloads** | YouTube, TikTok, Instagram, Facebook, X/Twitter, Spotify, SoundCloud, Terabox and more. |
| 🎵 **Audio & GIF tools** | Bass, slow, nightcore, robot, 8-ball, memes and reaction GIFs. |
| 🛡️ **Automation** | Anti-call, anti-delete, auto-read, auto-typing, auto-status, always-online, stealth. |
| 🌐 **Multi-database** | Optional MongoDB, PostgreSQL, MySQL or SQLite backends — falls back to local JSON. |
| 🖼️ **Custom menu image** | Set your own banner with `.menuimage`, reset it any time. |
| ♻️ **Hot reload** | `.reload` re-reads plugins without restarting the process. |

### Architecture

- **`server.js`** — entry point. Boots Baileys, handles pairing, wires events and dispatches messages.
- **`handler.js`** — command loader and dispatcher. Reads `plugins/*.js`, resolves aliases, enforces owner checks.
- **`config.js`** — static bot configuration (name, owner, prefix, mode, timezone).
- **`lib/`** — shared helpers (storage, GIF/audio effects, settings store).
- **`plugins/`** — one file per command. A plugin exports a default `{ command, handler }` object or a `commands[]` array.
- **`data/`** — JSON state for settings, bans, warnings and per-group configuration.
- **`auth_info/`** — WhatsApp session credentials (git-ignored).

---

## Command Categories

<img src="assets/command-categories.svg" alt="Command categories" width="100%">

<details>
<summary><b>Full command list by category</b> (click to expand)</summary>

### AI (7)
`dalle` · `diffusion` · `flux` · `gpt` · `llama` · `mistral` · `sora`

### Automation (11)
`alwaysonline` · `anticall` · `antidelete` · `autoread` · `autorecording` · `autoreply` · `autostatus` · `autotyping` · `stealth` · `viewonce` · `viewonce2`

### Audio (11)
`audioreverse` · `bass` · `blown` · `chipmunk` · `deep` · `earrape` · `fast` · `fat` · `nightcore` · `robot` · `slow`

### Download (25)
`alamy` · `dlstatus` · `facebook` · `getty` · `gimage` · `gitclone` · `gitclone2` · `instagram` · `istock` · `lyrics` · `mediafire` · `ringtone` · `scloud` · `seth` · `sharechat` · `snack` · `snapchat` · `song` · `spotify` · `terabox` · `tiktok` · `twitter` · `video` · `vidsplay` · `ytsearch`

### Fun (9)
`8ball` · `fact` · `flirt` · `hack` · `joke` · `joke2` · `meme` · `teddy` · `why`

### Games (6)
`dado` · `dare` · `hangman` · `math` · `trivia` · `truth`

### General (10)
`alive` · `channelid` · `echo` · `getpp` · `help` · `menu` · `pair` · `ping` · `pingweb` · `uptime`

### Group (13)
`compliment` · `gcmtdata` · `groupinfo` · `insult` · `invitelink` · `joinrequests` · `mute` · `poll` · `rank` · `ship` · `simp` · `staff` · `stupid`

### Group Admin (19)
`add` · `antibadword` · `ban` · `delete` · `demote` · `gcset` · `hidetag` · `kick` · `promote` · `resetlink` · `setgdesc` · `setgname` · `setgpp` · `tag` · `tagall` · `tagnotadmin` · `unban` · `unmute` · `warn`

### Images (8)
`coding` · `cyberimg` · `game` · `images` · `islamic` · `mountain` · `pies` · `tech`

### Info (12)
`imdb` · `itunes` · `medicine` · `momo` · `movie` · `news` · `owner` · `pokedex` · `quran` · `script` · `string` · `whois`

### Owner (22)
`addplugin` · `archivechat` · `autoreact` · `broadcast` · `broadcastdm` · `clear` · `delplugin` · `gcleave` · `getfile` · `inspect` · `joingroup` · `listrent` · `menuimage` · `mode` · `pinchat` · `pmblocker` · `reload` · `setbio` · `star` · `stoprent` · `sysinfo` · `update`

### Quotes (6)
`goodnight` · `quote` · `quote2` · `roseday` · `shayari` · `wyr`

### Reaction (7)
`cuddle` · `dance` · `highfive` · `hug` · `kiss` · `pat` · `wave`

### Search (4)
`define` · `element` · `play` · `whoisip`

### Stalk (7)
`genshin` · `github` · `pinstalk` · `tgstalk` · `thrstalk` · `ttstalk` · `xstalk`

### Stickers (5)
`emojimix` · `gif` · `s2img` · `sticker` · `stickers`

### Tools (24)
`base64` · `bfdecode` · `blur` · `brainfuck` · `excard` · `fetch` · `flip` · `forwarded` · `getpage` · `grayscale` · `invert` · `qmaker` · `readmore` · `readqr` · `removebg` · `reverse` · `screenshot` · `sepia` · `sharpen` · `smallcaps` · `tinyurl` · `tourl` · `translate` · `vnote`

### Utility (10)
`calc` · `distance` · `dna` · `rle` · `siminfo` · `speedtest` · `sudoku` · `units` · `urldecode` · `wordcloud`

### Single-command categories
`animes` (anime) · `notes` (notes) · `privacy` (privacy)

</details>

> **Tip:** the live, always-current list is available in WhatsApp via `.menu`.

---

## Prerequisites

Make sure the following are installed and available on your `PATH`:

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | `>= 20` | Required by `package.json` (`engines.node`). |
| **npm** | ships with Node.js | Used to install dependencies. |
| **FFmpeg** | latest stable | **Required** for audio effects, GIF reactions and media processing. |

### Installing FFmpeg

**Windows (Chocolatey)**

```bash
choco install ffmpeg
```

**Windows (Scoop)**

```bash
scoop install ffmpeg
```

**macOS (Homebrew)**

```bash
brew install ffmpeg
```

**Debian / Ubuntu**

```bash
sudo apt update && sudo apt install -y ffmpeg
```

**Verify the installation**

```bash
ffmpeg -version
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/samyazajnr28-sketch/SAMYAZA-MD.git
cd SAMYAZA-MD
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install FFmpeg

FFmpeg is **not** an npm package — install it separately using the
[instructions above](#installing-ffmpeg).

### 4. Configure the bot

Edit `config.js` and create a `.env` file — see [Configuration](#configuration).

### 5. Start the bot

```bash
npm start
```

`npm start` runs `node server.js`. On the first run you will be prompted to
choose how to link your WhatsApp account.

<img src="assets/install-flow.svg" alt="Installation flow" width="100%">

### Optional — run in the background

<details>
<summary><b>PM2 (recommended for production)</b></summary>

```bash
npm install -g pm2
pm2 start server.js --name samyaza-md
pm2 save
pm2 startup
```

</details>

<details>
<summary><b>Screen (Linux / VPS)</b></summary>

```bash
screen -S samyaza-md
npm start
# Detach with Ctrl+A, then D. Re-attach with: screen -r samyaza-md
```

</details>

---

## Configuration

### `config.js` — bot settings

This is the main configuration file. Edit the values to match your setup:

```js
const CONFIG = {
    BOT_NAME: 'SAMYAZA-MD',          // Display name shown in the menu
    BOT_VERSION: '1.0.0',            // Version shown in the menu
    OWNER_NAME: 'SAMYAZA JNR',       // Your display name
    GLOBAL_OWNER: '254707475813',    // Your WhatsApp number (country code, digits only)
    PREFIXES: ['.'],                 // Command prefixes — e.g. ['.', '!', '/']
    MODE: 'public',                  // public | private | groups | inbox | self
    TZ: 'Africa/Nairobi',            // IANA timezone used for greetings and timestamps
    MENU_IMAGES: [],                 // Optional remote menu image URLs (randomly picked)
    LOG_LEVEL: 'silent'              // pino log level: silent | error | warn | info | debug
};

export default CONFIG;
```

> **⚠️ Always change `GLOBAL_OWNER`** to your own WhatsApp number. The number
> must include the country code and contain digits only — no `+`, spaces or dashes.

### `.env` — secrets and API keys

The `.env` file is **git-ignored** and never committed. Create it in the project root:

```bash
# AI chat (Google Gemini) - used by the .autoreply command
GEMINI_API_KEY=your_gemini_api_key_here

# remove.bg - used by the .removebg command
REMOVEBG_KEY=your_removebg_api_key_here

# Timezone fallback for the anti-delete timestamps
TIMEZONE=Africa/Nairobi

# Optional: ZIP release URL used by the .update command
UPDATE_ZIP_URL=https://github.com/samyazajnr28-sketch/SAMYAZA-MD/archive/refs/heads/main.zip

# Optional: database. Set AT LEAST ONE to persist state remotely.
# Leave all four unset to use the local JSON store in data/ instead.
# MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
# POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
# MYSQL_URL=mysql://user:password@localhost:3306/dbname
# DB_URL=sqlite://data/samyaza.db
```

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Enables the `.autoreply` AI auto-response. |
| `REMOVEBG_KEY` | Optional | Enables the `.removebg` background remover. |
| `TIMEZONE` | Optional | Timezone used by the anti-delete timestamp. |
| `UPDATE_ZIP_URL` | Optional | Source archive for the `.update` command. |
| `MONGO_URL` | Optional | MongoDB connection string. |
| `POSTGRES_URL` | Optional | PostgreSQL connection string. |
| `MYSQL_URL` | Optional | MySQL connection string. |
| `DB_URL` | Optional | SQLite connection string. |

> 💡 **Tip:** provide at least one database URL to persist bans, warnings and
> per-group settings across restarts. With none set, SAMYAZA-MD automatically
> falls back to the local JSON files in `data/`.

### Runtime state

| Path | Purpose | Git-ignored |
|---|---|---|
| `auth_info/` | WhatsApp session credentials | ✅ |
| `.env` | Secrets and API keys | ✅ |
| `node_modules/` | npm dependencies | ✅ |
| `data/` | Settings, bans, warnings, group config | ❌ tracked |
| `temp/` | Temporary media downloads | ❌ tracked |
| `downloads/` | Downloaded media output | ❌ tracked |

> 🔒 **Never commit `auth_info/` or `.env`.** They are already listed in
> `.gitignore`, but double-check before pushing to a public repository.

---

## Pairing and Login

On the **first** run (when `auth_info/` contains no valid session) SAMYAZA-MD
asks how you want to link your account:

```
Choose how to link WhatsApp:
1. QR code (default)
2. Pairing code (enter your phone number with country code)
On WhatsApp, open Linked devices > Link a device.
Choose 1 or 2:
```

### Option 1 — QR code (default)

1. Choose `1` (or just press Enter).
2. A QR code is printed in the terminal.
3. On your phone open **WhatsApp → Settings → Linked devices → Link a device**.
4. Scan the QR code with the camera.

### Option 2 — Pairing code (phone number)

1. Choose `2` and enter your number **with the country code, digits only**
   (for example `254700000000` — 7 to 15 digits).
2. The bot prints an 8-character pairing code.
3. On your phone open **WhatsApp → Settings → Linked devices → Link a device →
   Link with phone number instead**.
4. Enter the code shown in the terminal.

> 💡 If the bot is running in a non-interactive environment (a Docker
> container, a service manager, or a piped terminal), it automatically falls
> back to QR-code linking and prints a notice.

### Generating a pairing code from inside WhatsApp

The `.pair` command requests a pairing code from a remote helper service:

```
.pair 92305395XXXX
```

It expects the number with the country code but **without** `+` or spaces.
Use this only if you prefer to link a second device.

### Notes on the session

- The session is stored in `auth_info/` and is **reused on every restart** — you
  only pair once.
- If WhatsApp logs the account out, the bot prints:
  `WhatsApp logged out. Remove auth_info and restart to pair again.`
  Delete the `auth_info/` folder and start the bot again.
- Any other disconnect triggers an automatic reconnect after 3 seconds.

---

## Usage

Commands are sent in WhatsApp with a prefix (`.` by default). The prefix is
configured via `PREFIXES` in `config.js` — with the default settings you type
`.menu`.

### Getting started

| Command | Description |
|---|---|
| `.menu` | Full command list, grouped by category, sent with the menu image. |
| `.help` | Short help message. |
| `.help <command>` | Details for one command — usage, description, category and aliases. |
| `.alive` | Bot status, uptime and system information. |
| `.ping` | Round-trip latency check. |
| `.owner` | Sends the owner's contact card. |

### Examples

```
.menu
.help video
.ping
.alive
.gpt What is the capital of Kenya?
.video never gonna give you up
.bass @someone
```

### Access modes

The `.mode` command controls who can use the bot:

| Mode | Who can use it | Where |
|---|---|---|
| `public` | Everyone | Groups **and** private chats |
| `private` | Owner and sudo users only | Groups and private chats |
| `groups` | Everyone | Groups only |
| `inbox` | Everyone | Private chats only |
| `self` | Owner and sudo users only | Groups and private chats |

```bash
.mode status     # show the current mode
.mode public     # allow everyone
.mode groups     # groups only
.mode inbox      # private chats only
.mode private    # owner/sudo only
```

---

## Owner Commands

These commands are restricted to the bot owner (the number in
`GLOBAL_OWNER`) and the sudo users.

| Command | Description |
|---|---|
| `.mode <mode>` | Change who can use the bot. |
| `.settings` | Show global and per-group configuration. |
| `.broadcast <text>` | Send a message to every group the bot is in. |
| `.broadcastdm <text>` | Send a direct message to every known user. |
| `.reload` | Reload all plugins without restarting. |
| `.update` | Update the bot from Git or a ZIP archive. |
| `.sysinfo` | Detailed server and runtime information. |
| `.menuimage` | Change the menu image (owner-only). |
| `.addplugin` | Install a plugin from a URL. |
| `.delplugin` | Remove an installed plugin. |
| `.inspect` | View the source of an installed plugin. |
| `.getfile` | Read a file from the project directory. |
| `.setbio` | Set the bot's WhatsApp bio. |
| `.autoreact` | Toggle automatic reactions to commands. |
| `.pmblocker` | Block or unblock private messages from non-owners. |
| `.pinchat` | Pin or unpin a chat. |
| `.archivechat` | Archive or unarchive a chat. |
| `.gcleave` | Make the bot leave a group. |
| `.joingroup` | Make the bot join a group invite link. |
| `.star` | Star or unstar a message. |
| `.clear` | Clear the bot's chat history. |
| `.listrent` / `.stoprent` | Manage bot clones. |

> To add a sudo user, edit the sudo list inside `plugins/sudo.js` — that file is
> created automatically the first time the command is used.

---

## Customising the Menu

The menu image is stored at `assets/menu-image.jpg` and is sent automatically
with the `.menu` command.

**From WhatsApp (owner only):**

1. Send any image, then reply to it with `.menuimage`.
2. The bot replaces `assets/menu-image.*` with your image.
3. Send `.menu` to preview it.

To restore the shipped image:

```
.menuimage reset
```

**Supported formats:** JPEG, PNG and WebP. The bot picks whichever of
`assets/menu-image.jpg`, `assets/menu-image.png` or `assets/menu-image.webp`
exists, and falls back to `assets/thumb.png`.

You can also set remote fallback images in `config.js`:

```js
MENU_IMAGES: [
    'https://example.com/banner-1.jpg',
    'https://example.com/banner-2.jpg'
]
```

One of these URLs is picked at random when no local image is found.

---

## Project Structure

```
SAMYAZA-MD/
├── server.js              # Entry point: Baileys socket, pairing, event wiring
├── handler.js             # Command loader + dispatcher (aliases, owner checks)
├── config.js              # Static bot configuration
├── setting.js             # Automation settings (autorecording, alwaysonline)
├── storage.js             # JSON-backed settings store in data/
├── package.json
├── .env                   # Secrets (git-ignored, you create this)
├── assets/
│   ├── menu-image.jpg     # The image shown with .menu
│   ├── banner.svg         # README banner
│   ├── install-flow.svg   # README install flowchart
│   └── command-categories.svg
├── data/                  # Settings, bans, warnings, per-group config
├── lib/
│   ├── lightweight_store.js
│   ├── audio-effect.js
│   └── interaction-gifs.js
├── plugins/               # 288 command files, auto-loaded on start
├── auth_info/             # WhatsApp session (git-ignored)
├── downloads/             # Media output
└── temp/                  # Temporary media
```

### Adding your own command

Create `plugins/mycommand.js`:

```js
var mycommand_default = {
    command: 'mycommand',
    aliases: ['mc'],
    category: 'general',
    description: 'My custom command',
    usage: '.mycommand <text>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        await sock.sendMessage(chatId, {
            text: `Hello! You said: ${args.join(' ')}`
        }, { quoted: message });
    }
};
export {
    mycommand_default as default
};
```

Restart the bot (or send `.reload`) and `.mycommand` is live. The command name
must be unique — duplicate names are rejected at load time.

---

## Optional Plugin Dependencies

The bot starts and runs fine out of the box: **219 of the 288 plugin files
load successfully**, and the remaining 70 are skipped with a log line. Those
70 depend on extra libraries or helper modules that are not bundled in
`package.json`.

> **Nothing here is required to run the bot.** Install these only if you want
> the specific commands they power.

### Missing npm packages

| Package | Unlocks |
|---|---|
| `api-qasim` | `.android1`, `.npmstalk`, `.styletext`, `.trends`, `.wattpad` |
| `node-webpmux` | `.igs`, `.igsc`, `.sticker2`, `.stickercrop`, `.stickertelegram`, `.take` |
| `simple-git` | `.gitinfo`, `.pull` |
| `qrcode` | `.qrcode` |
| `stickers-formatter` | `.quoted` |
| `node-cache` | `.rentbot` |
| `gspeak` | `.tts` |
| `mumaker` | `.textmaker` |
| `acrcloud` | `.shazam` |

```bash
npm install api-qasim node-webpmux simple-git qrcode stickers-formatter node-cache gspeak mumaker acrcloud
```

### Missing helper modules in `lib/`

These plugins import shared helpers that are not present in `lib/` in this
repository. The affected commands are skipped until the module is added.

| Missing module | Affects |
|---|---|
| `lib/paths.js` | `.antispam`, `.chatbot`, `.crun`, `.delcmd`, `.listcmd`, `.localbot`, `.localbot2`, `.mention`, `.schedule`, `.setcmd`, `.warnings` |
| `lib/commandHandler.js` | `.list`, `.maintenance`, `.manage`, `.searchcmd`, `.smartmenu`, `.stats` |
| `lib/uploaders.js` | `.u-aupload`, `.u-catbox`, `.u-freeimg`, `.u-litterbox`, `.u-pixhost`, `.u-pomf`, `.u-quax`, `.u-tmpfile`, `.u-uguuse`, `.u-xoat` |
| `lib/isOwner.js` | `.antilink`, `.clearsession`, `.cleartmp`, `.setpp`, `.settings` |
| `lib/messageConfig.js` | `.character`, `.wasted`, `.weather`, `.wikipedia` |
| `lib/index.js` | `.antitag`, `.sudo` |
| `lib/welcome.js` | `.welcome`, `.goodbye` |
| `lib/isAdmin.js` | `.clearchat`, `.disappear` |
| `lib/compile.js` | `.analyze`, `.cipher` |
| `lib/exif.js` | `.attp` |
| `lib/reactions.js` | `.cmdreact` |
| `lib/tictactoe.js` | `.tictactoe` |
| `lib/uploadImage.js` | `.resize` |
| `lib/uploader.js` | `.url` |

---

## Troubleshooting

<details>
<summary><b>❌ "Could not load plugin ..." messages on startup</b></summary>

These are informational, not fatal. A plugin that fails to import is skipped
and the bot continues with everything else. See
[Optional Plugin Dependencies](#optional-plugin-dependencies) for the exact
cause of each one.

If you want a clean log, set `LOG_LEVEL: 'error'` in `config.js` — or silence
Baileys entirely with `LOG_LEVEL: 'silent'` (the default).

</details>

<details>
<summary><b>❌ Audio commands fail (`.bass`, `.slow`, `.nightcore` ...)</b></summary>

FFmpeg is not installed or not on your `PATH`.

```bash
ffmpeg -version
```

If that command is not found, [install FFmpeg](#installing-ffmpeg) and restart
the bot.

</details>

<details>
<summary><b>❌ The bot does not respond to commands</b></summary>

1. **Check the prefix.** Commands must start with a prefix from `PREFIXES`
   (default `.`). `.menu` works, `menu` does not.
2. **Check the mode.** If the bot is in `private` mode, only the owner and sudo
   users get a response. Run `.mode status`.
3. **Check the group.** In `groups` mode the bot ignores private chats, and in
   `inbox` mode it ignores groups.
4. **Check the command exists.** Send `.menu` for the live list, and
   `.help <command>` for details.

</details>

<details>
<summary><b>❌ "WhatsApp logged out. Remove auth_info and restart to pair again."</b></summary>

The session was invalidated (for example, the account was unlinked from the
Linked devices list). Delete the session folder and start again:

```bash
rm -rf auth_info    # Linux / macOS
```

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force auth_info
```

```bash
npm start
```

You will be prompted to pair again.

</details>

<details>
<summary><b>❌ Bot disconnects repeatedly after starting</b></summary>

- Make sure you are running **Node.js 20 or newer**.
- Link only **one** WhatsApp session per account — a second instance will kick
  the first one out.
- If you are deploying to a host that blocks the WhatsApp servers, the
  connection will drop shortly after `SAMYAZA-MD connected.` is printed.

</details>

<details>
<summary><b>❌ `.autoreply` or `.gpt` does nothing</b></summary>

These need API keys in `.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Also make sure the value is not a placeholder — the bot ignores keys matching
the pattern `your_*_here`.

</details>

<details>
<summary><b>❌ Settings, bans and warnings are lost after a restart</b></summary>

No database is configured. Set one of `MONGO_URL`, `POSTGRES_URL`,
`MYSQL_URL` or `DB_URL` in `.env` to persist state remotely. Without one,
SAMYAZA-MD stores everything in the local `data/` folder.

</details>

<details>
<summary><b>❌ A command returns "Command failed. Please try again."</b></summary>

The handler threw an error. The full stack trace is written to the terminal
where the bot is running. Common causes: a missing API key, an unavailable
third-party API, or an unsupported media format.

</details>

<details>
<summary><b>❌ Duplicate command name error on startup</b></summary>

Two plugins export the same command name. Rename one of them (and its
`aliases`) and restart.

</details>

---

## Disclaimer

- This project is **not affiliated with, endorsed by, or sponsored by WhatsApp
  Inc. or Meta Platforms, Inc.**
- It uses an unofficial library ([Baileys](https://github.com/WhiskeySockets/Baileys))
  and reverse-engineered WhatsApp Web endpoints. Use it responsibly and in
  accordance with WhatsApp's Terms of Service.
- Automating a WhatsApp account may lead to your number being **banned** by
  WhatsApp. This is an inherent risk of every unofficial WhatsApp bot.
- **Do not** use this bot for spam, harassment, bulk messaging, or anything
  that violates the law or another person's rights.
- You are responsible for the commands you enable and the content your bot
  sends. The maintainers accept no liability for any misuse or damage.

---

## Credits

| | |
|---|---|
| **Author** | SETH (SAMYAZA JNR) |
| **Repository** | [github.com/samyazajnr28-sketch/SAMYAZA-MD](https://github.com/samyazajnr28-sketch/SAMYAZA-MD) |
| **Support** | +254707475813 |

### Built with

- [Baileys](https://github.com/WhiskeySockets/Baileys) — multi-device WhatsApp library
- [Node.js](https://nodejs.org) — runtime
- [Pino](https://github.com/pinojs/pino) — logging
- [FFmpeg](https://ffmpeg.org) — audio and video processing
- [sharp](https://github.com/lovell/sharp) — image manipulation
- [Axios](https://github.com/axios/axios) — HTTP client
- [qrcode-terminal](https://github.com/malteusch/qrcode-terminal) — QR rendering in the terminal

---

<div align="center">

**⭐ If you like SAMYAZA-MD, please star the repository on GitHub! ⭐**

Made with 💚 by **SETH**

</div>







