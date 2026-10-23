<div align="center">

<h1 align="center">⚡ SAMYAZA-MD</h1>

<p><strong>A fast, colorful WhatsApp automation bot built with Node.js and Baileys.</strong></p>

<img src="./assets/menu-image.jpg" alt="SAMYAZA-MD main bot image" width="100%">

<p>
  ✨ <strong>QR pairing</strong> &nbsp;·&nbsp;
  🔐 <strong>Owner controls</strong> &nbsp;·&nbsp;
  🤖 <strong>Automation</strong> &nbsp;·&nbsp;
  🌌 <strong>Multi-session support</strong>
</p>

</div>

<h2>🌠 What is SAMYAZA-MD?</h2>

<p>SAMYAZA-MD is a multi-device WhatsApp bot with a web pairing page, command plugins, owner controls, group tools, media utilities, and automation features.</p>

<h2>🚀 Quick start</h2>

<p>Requirements: <strong>Node.js 20+</strong>, npm, and FFmpeg for selected audio/video features.</p>

<pre><code>git clone https://github.com/samyazajnr28-sketch/SAMYAZA-MD.git
cd SAMYAZA-MD
npm install
npm start</code></pre>

<p>The bot starts the web pairing server at <code>http://localhost:3000</code>.</p>

<ol>
  <li><strong>QR code:</strong> scan the displayed QR with WhatsApp → Linked devices → Link a device.</li>
  <li><strong>Pairing code:</strong> enter your full international phone number and use the returned code in WhatsApp → Linked devices → Link with phone number.</li>
</ol>

<p>For a VPS, replace <code>localhost</code> with your server address. You can change the port with <code>PORT=8080 npm start</code>.</p>

<h2>✨ Features</h2>

<ul>
  <li><strong>QR and pairing-code linking</strong> through the built-in web page.</li>
  <li><strong>Public, private, groups, and inbox modes</strong> with connected-owner protection.</li>
  <li><strong>Owner-only automation and privacy commands.</strong></li>
  <li><strong>Group tools</strong> such as moderation, anti-link, welcome, goodbye, and tagging utilities.</li>
  <li><strong>Media tools</strong> for stickers, downloads, conversions, uploads, and image processing.</li>
  <li><strong>AI and utility commands</strong> for chat, search, calculations, information, and games.</li>
  <li><strong>Multiple WhatsApp sessions</strong> stored under <code>auth_info/accounts/&lt;number&gt;</code>.</li>
</ul>

<div>
  <strong>Try these commands after linking:</strong>
  <pre><code>.menu
.help ping
.mode status
.ping</code></pre>
</div>

<h2>🔐 Modes and ownership</h2>

<p>The owner is the phone number currently connected to each WhatsApp session.</p>

<pre><code>.mode public   # normal commands are available to everyone
.mode private  # only the connected owner can use the bot
.mode groups   # commands work only inside groups
.mode inbox    # commands work only in private chats</code></pre>

<p>Owner, automation, and privacy commands remain owner-only even when the bot is in public mode.</p>

<h2>📁 Important folders</h2>

<ul>
  <li><code>auth_info/</code> — WhatsApp credentials; keep this folder private and persistent.</li>
  <li><code>auth_info/accounts/</code> — additional linked WhatsApp sessions.</li>
  <li><code>plugins/</code> — bot commands and features.</li>
  <li><code>data/</code> — settings and runtime data.</li>
  <li><code>assets/</code> — project assets.</li>
</ul>

<h2>🛡️ Keep the pairing page private</h2>

<p>If the bot is hosted online, protect port <code>3000</code> with authentication or a reverse proxy before sharing the pairing link. Never commit <code>auth_info/</code> or <code>.env</code> to a public repository.</p>

<p align="center">🌌 Built by <strong>SETH · SAMYAZA JNR</strong><br>⭐ Keep using SAMYAZA-MD</p>

</div>
