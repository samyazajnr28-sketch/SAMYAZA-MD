import store from "../lib/lightweight_store.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
async function getAllCloneSessions() {
  if (HAS_DB) {
    const settings = await store.getAllSettings("clones") || {};
    return Object.entries(settings).filter(([_key, value]) => value && value.status).map(([authId, data]) => ({ authId, ...data }));
  } else {
    const { default: fs } = await import("fs");
    const { default: path } = await import("path");
    const clonesDir = path.join(process.cwd(), "session", "clones");
    if (!fs.existsSync(clonesDir)) return [];
    const dirs = fs.readdirSync(clonesDir);
    return dirs.map((authId) => {
      const sessionPath = path.join(clonesDir, authId, "session.json");
      if (fs.existsSync(sessionPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
          return { authId, ...data };
        } catch (e) {
          return { authId, status: "unknown" };
        }
      }
      return { authId, status: "unknown" };
    });
  }
}
var listrent_default = {
  command: "listrent",
  aliases: ["listclone", "botclones"],
  category: "owner",
  description: "List all currently active sub-bots",
  usage: ".listrent",
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const activeConns = global.conns || [];
    const storedClones = await getAllCloneSessions();
    if (activeConns.length === 0 && storedClones.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "*\u274C No sub-bots are currently active or stored.*"
      }, { quoted: message });
    }
    let msg = `*\u2500\u2500\u2500 [ CLONE BOTS ] \u2500\u2500\u2500*

`;
    msg += `*Storage:* ${HAS_DB ? "Database \u{1F5C4}\uFE0F" : "File System \u{1F4C1}"}

`;
    if (activeConns.length > 0) {
      msg += `*\u{1F7E2} ONLINE CLONES:*

`;
      activeConns.forEach((conn, i) => {
        const user = conn.user;
        msg += `*${i + 1}.* @${user.id.split(":")[0]}
`;
        msg += `   \u2514 Name: ${user.name || "Sub-Bot"}
`;
        msg += `   \u2514 Status: Connected \u2705

`;
      });
    }
    if (HAS_DB && storedClones.length > 0) {
      const offlineClones = storedClones.filter((clone) => {
        return !activeConns.some((conn) => {
          const connNumber = conn.user.id.split(":")[0];
          return clone.userNumber === connNumber;
        });
      });
      if (offlineClones.length > 0) {
        msg += `*\u26AA STORED CLONES (Offline):*

`;
        offlineClones.forEach((clone, i) => {
          msg += `*${i + 1}.* ID: ${clone.authId}
`;
          msg += `   \u2514 Number: ${clone.userNumber || "N/A"}
`;
          msg += `   \u2514 Status: ${clone.status || "offline"}
`;
          if (clone.createdAt) {
            const date = new Date(clone.createdAt);
            msg += `   \u2514 Created: ${date.toLocaleString()}
`;
          }
          msg += `
`;
        });
      }
    }
    msg += `*Total Online:* ${activeConns.length}
`;
    if (HAS_DB) {
      msg += `*Total Stored:* ${storedClones.length}`;
    }
    const mentions = activeConns.map((c) => c.user.id);
    await sock.sendMessage(chatId, {
      text: msg,
      mentions
    }, { quoted: message });
  }
};
export {
  listrent_default as default
};
