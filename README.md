<div align="center">

<img src="./assets/banner.svg" alt="SAMYAZA-MD WhatsApp automation bot banner" width="100%">

<h3>⚡ A fast, colorful WhatsApp automation bot built with Node.js and Baileys</h3>

<p><strong>✨ QR pairing · 🔐 owner controls · 🤖 automation · 🌌 multi-session support</strong></p>

<marquee behavior="scroll" direction="left" scrollamount="6">🚀 SAMYAZA-MD is starting up · Link WhatsApp with QR or pairing code · Explore useful commands with .menu 🚀</marquee>

<br>

![Node.js](https://img.shields.io/badge/Node.js-20%2B-25D366?style=for-the-badge&logo=node.js&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-075E54?style=for-the-badge&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-8FF0B4?style=for-the-badge)

</div>

---

## 🌠 What is SAMYAZA-MD?

SAMYAZA-MD is a multi-device WhatsApp bot with a web pairing page, command plugins, owner controls, group tools, media utilities, and automation features.

<div align="center">

<img src="./assets/command-categories.svg" alt="SAMYAZA-MD command categories" width="92%">

</div>

## 🚀 Quick start

Requirements: **Node.js 20+**, npm, and FFmpeg for selected audio/video features.

```bash
git clone https://github.com/samyazajnr28-sketch/SAMYAZA-MD.git
cd SAMYAZA-MD
npm install
npm start
```

The bot starts the web pairing server on:

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

<div align="center">

<img src="./assets/install-flow.svg" alt="SAMYAZA-MD installation and pairing flow" width="92%">

</div>

## ✨ A few features

- **QR and pairing-code linking** through the built-in web page.
- **Public, private, groups, and inbox modes** with connected-owner protection.
- **Owner-only automation and privacy commands.**
- **Group tools** such as moderation, anti-link, welcome, goodbye, and tagging utilities.
- **Media tools** for stickers, downloads, conversions, uploads, and image processing.
- **AI and utility commands** for chat, search, calculations, information, and games.
- **Multiple WhatsApp sessions** stored separately under `auth_info/accounts/<number>`.

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

- `auth_info/` — WhatsApp credentials; keep this folder private and persistent.
- `auth_info/accounts/` — additional linked WhatsApp sessions.
- `plugins/` — bot commands and features.
- `data/` — settings and runtime data.
- `assets/` — README graphics and project visuals.

## 🛡️ Keep the pairing page private

If the bot is hosted online, protect port `3000` with authentication or a reverse proxy before sharing the pairing link. Never commit `auth_info/` or `.env` to a public repository.

<div align="center">

<p><strong>🌌 Built by SETH · SAMYAZA JNR</strong></p>

</div>
