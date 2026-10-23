# ⚡ SAMYAZA-MD

> **A fast, colorful WhatsApp automation bot built with Node.js and Baileys.**

![SAMYAZA-MD bot image](YOUR_CUSTOM_BOT_IMAGE_URL)

╭────────────────────────────────────╮
│ ✨ QR pairing · 🔐 Owner controls  │
│ 🤖 Automation · 🌌 Multi-session   │
╰────────────────────────────────────╯

## 🌠 What is SAMYAZA-MD?

SAMYAZA-MD is a multi-device WhatsApp bot with a web pairing page, command plugins, owner controls, group tools, media utilities, and automation features.

## 🚀 Quick start

Requirements: **Node.js 20+**, npm, and FFmpeg for selected audio/video features.

```bash
git clone https://github.com/samyazajnr28-sketch/SAMYAZA-MD.git
cd SAMYAZA-MD
npm install
npm start
```

The bot starts the web pairing server at:

```text
http://localhost:3000
```

Open that link in your browser, then choose one of the following:

1. **QR code:** scan the displayed QR with WhatsApp → Linked devices → Link a device.
2. **Pairing code:** open the Pairing code tab, enter the full international phone number, and enter the returned code in WhatsApp → Linked devices → Link with phone number.

For a VPS, replace `localhost` with the server address:

```text
http://YOUR_SERVER_IP:3000
```

You can change the port with `PORT=8080 npm start`.

## ✨ Features

• **QR and pairing-code linking** through the built-in web page.

• **Public, private, groups, and inbox modes** with connected-owner protection.

• **Owner-only automation and privacy commands.**

• **Group tools** such as moderation, anti-link, welcome, goodbye, and tagging utilities.

• **Media tools** for stickers, downloads, conversions, uploads, and image processing.

• **AI and utility commands** for chat, search, calculations, information, and games.

• **Multiple WhatsApp sessions** stored separately under `auth_info/accounts/<number>`.

Try these commands after linking:

```text
.menu
.help ping
.mode status
.ping
```

## 🔐 Modes and ownership

The owner is the phone number currently connected to each WhatsApp session.

```text
.mode public   # normal commands are available to everyone
.mode private  # only the connected owner can use the bot
.mode groups   # commands work only inside groups
.mode inbox    # commands work only in private chats
```

Owner, automation, and privacy commands remain owner-only even when the bot is in public mode.

## 📁 Important folders

• `auth_info/` — WhatsApp credentials; keep this folder private and persistent.

• `auth_info/accounts/` — additional linked WhatsApp sessions.

• `plugins/` — bot commands and features.

• `data/` — settings and runtime data.

• `assets/` — project assets.

## 🛡️ Keep the pairing page private

If the bot is hosted online, protect port `3000` with authentication or a reverse proxy before sharing the pairing link. Never commit `auth_info/` or `.env` to a public repository.

╭────────────────────────────────────╮
│ 🌌 Built by SETH · SAMYAZA JNR    │
│ ⭐ Keep using SAMYAZA-MD            │
╰────────────────────────────────────╯
