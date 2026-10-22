import store from "../lib/lightweight_store.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const notesDB = {};
async function getUserNotes(userId) {
  if (HAS_DB) {
    const notes = await store.getSetting(userId, "notes");
    return notes || [];
  } else {
    return notesDB[userId] || [];
  }
}
async function saveUserNotes(userId, notes) {
  if (HAS_DB) {
    await store.saveSetting(userId, "notes", notes);
  } else {
    notesDB[userId] = notes;
  }
}
var notes_default = {
  command: "notes",
  aliases: ["note"],
  category: "notes",
  description: "Store, view, and delete your personal notes",
  usage: ".notes <add|all|del|delall> [text|ID]",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    try {
      const action = args[0] ? args[0].toLowerCase() : null;
      const content = args.slice(1).join(" ").trim();
      const menuText = `
\u256D\u2500\u2500\u2500\u2500\u2500 *\u300E NOTES \u300F* \u2500\u2500\u2500\u25C6
\u2503 Store notes for later use
\u2503 Storage: ${HAS_DB ? "Database \u{1F5C4}\uFE0F" : "Memory \u{1F4C1}"}
\u2503
\u2503 \u25CF Add Note
\u2503    .notes add your text here
\u2503
\u2503 \u25CF Get All Notes
\u2503    .notes all
\u2503
\u2503 \u25CF Delete Note
\u2503    .notes del noteID
\u2503
\u2503 \u25CF Delete All Notes
\u2503    .notes delall
\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2500\u2500\u22B7`;
      if (!action) {
        return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
      }
      if (action === "add") {
        if (!content) {
          return await sock.sendMessage(chatId, {
            text: "*Please write a note to save.*\nExample: .notes add buy milk"
          }, { quoted: message });
        }
        const userNotes = await getUserNotes(sender);
        const newID = userNotes.length + 1;
        userNotes.push({ id: newID, text: content, createdAt: Date.now() });
        await saveUserNotes(sender, userNotes);
        return await sock.sendMessage(chatId, {
          text: `\u2705 Note saved.
ID: ${newID}
Storage: ${HAS_DB ? "Database" : "Memory"}`
        }, { quoted: message });
      }
      if (action === "all") {
        const userNotes = await getUserNotes(sender);
        if (userNotes.length === 0) {
          return await sock.sendMessage(chatId, { text: "*You have no notes saved.*" }, { quoted: message });
        }
        const list = userNotes.map((n) => `${n.id}. ${n.text}`).join("\n");
        return await sock.sendMessage(chatId, {
          text: `*\u{1F4DD} Your Notes:*

${list}

_Total: ${userNotes.length} notes_`
        }, { quoted: message });
      }
      if (action === "del") {
        const id = parseInt(args[1], 10);
        const userNotes = await getUserNotes(sender);
        if (!id || !userNotes.find((n) => n.id === id)) {
          return await sock.sendMessage(chatId, {
            text: "Invalid note ID.\nExample: .notes del 1"
          }, { quoted: message });
        }
        const filteredNotes = userNotes.filter((n) => n.id !== id);
        await saveUserNotes(sender, filteredNotes);
        return await sock.sendMessage(chatId, { text: `*\u2705 Note ID ${id} deleted.*` }, { quoted: message });
      }
      if (action === "delall") {
        const userNotes = await getUserNotes(sender);
        if (userNotes.length === 0) {
          return await sock.sendMessage(chatId, { text: "*You have no notes to delete.*" }, { quoted: message });
        }
        await saveUserNotes(sender, []);
        return await sock.sendMessage(chatId, { text: "*\u2705 All notes deleted successfully.*" }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
    } catch (err) {
      console.error("Notes Command Error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Error in notes module." }, { quoted: message });
    }
  }
};
export {
  notes_default as default
};
