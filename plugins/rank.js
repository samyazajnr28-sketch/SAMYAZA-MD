import store from "../lib/lightweight_store.js";
async function incrementMessageCount(chatId, userId) {
  try {
    await store.incrementMessageCount(chatId, userId);
  } catch (error) {
    console.error("Error incrementing message count:", error);
  }
}
async function loadMessageCounts() {
  try {
    const data = await store.getAllMessageCounts();
    return data.messageCount || {};
  } catch (error) {
    console.error("Error loading message counts:", error);
    return {};
  }
}
function saveMessageCounts(_messageCounts) {
  console.log("[RANK] saveMessageCounts called (no-op - auto-saved by store)");
}
var rank_default = {
  command: "rank",
  aliases: ["top", "topusers", "leaderboard", "ranks"],
  category: "group",
  description: "Show top 5 most active members based on message count",
  usage: ".rank",
  groupOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const messageCounts = await loadMessageCounts();
      const groupCounts = messageCounts[chatId] || {};
      const lidMap = {};
      let meta = null;
      try {
        meta = await sock.groupMetadata(chatId);
        for (const p of meta.participants) {
          if (p.lid) lidMap[p.lid] = p.id;
          if (p.id) lidMap[p.id] = p.id;
        }
      } catch {
      }
      const resolvedCounts = {};
      for (const [uid, count] of Object.entries(groupCounts)) {
        const resolved = lidMap[uid] || uid;
        resolvedCounts[resolved] = (resolvedCounts[resolved] || 0) + count;
      }
      const sortedMembers = Object.entries(resolvedCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
      if (sortedMembers.length === 0) {
        await sock.sendMessage(chatId, {
          text: "\u{1F4CA} *No message activity recorded yet*\n\nStart chatting to appear on the leaderboard!"
        }, { quoted: message });
        return;
      }
      const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}", "4\uFE0F\u20E3", "5\uFE0F\u20E3"];
      let messageText = "\u{1F3C6} *TOP MEMBERS LEADERBOARD*\n\n";
      for (let index = 0; index < sortedMembers.length; index++) {
        const [userId, count] = sortedMembers[index];
        const c = sock.store?.contacts?.[userId];
        const participant = meta?.participants?.find((p) => p.id === userId || p.lid === userId);
        const username = c?.name || c?.notify || participant?.notify || participant?.name || await sock.getName(userId) || (userId.includes("@s.whatsapp.net") ? "+" + userId.replace("@s.whatsapp.net", "") : "Unknown");
        messageText += `${medals[index]} @${username}
\u{1F4AC} ${count} messages

`;
      }
      messageText += "_Keep chatting to climb the ranks!_";
      await sock.sendMessage(chatId, {
        text: messageText,
        mentions: sortedMembers.map(([userId]) => userId)
      }, { quoted: message });
    } catch (error) {
      console.error("Rank Command Error:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Failed to load leaderboard. Please try again later."
      }, { quoted: message });
    }
  },
  incrementMessageCount,
  loadMessageCounts,
  saveMessageCounts
};
export {
  rank_default as default
};
