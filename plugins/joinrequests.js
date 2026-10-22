var joinrequests_default = {
  command: "joinrequests",
  aliases: ["gcreqs", "groupreqs", "pendingjoins", "approvejoin", "rejectjoin"],
  category: "group",
  description: "View, approve or reject group join requests",
  usage: ".joinrequests \u2014 list pending\n.approvejoin <number|all>\n.rejectjoin <number|all>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = (context.rawText || "").toLowerCase();
    const isApprove = rawText.startsWith(".approvejoin");
    const isReject = rawText.startsWith(".rejectjoin");
    if (!isApprove && !isReject) {
      try {
        const requests = await sock.groupRequestParticipantsList(chatId);
        if (!requests || requests.length === 0) {
          return await sock.sendMessage(chatId, {
            text: `\u{1F4CB} *Join Requests*

_No pending join requests._`,
            ...channelInfo
          }, { quoted: message });
        }
        const list = requests.map(
          (r, i) => `${i + 1}. +${r.jid.split("@")[0]}`
        ).join("\n");
        return await sock.sendMessage(chatId, {
          text: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551   \u{1F4CB} *JOIN REQUESTS*    \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

${list}

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
*Total:* ${requests.length} pending

\u2022 \`.approvejoin all\` \u2014 approve all
\u2022 \`.rejectjoin all\` \u2014 reject all
\u2022 \`.approvejoin 923001234567\` \u2014 approve one`,
          ...channelInfo
        }, { quoted: message });
      } catch (e) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Failed to fetch requests: ${e.message}`,
          ...channelInfo
        }, { quoted: message });
      }
    }
    const action = isApprove ? "approve" : "reject";
    const input = args[0]?.toLowerCase();
    try {
      let targets = [];
      if (input === "all") {
        const requests = await sock.groupRequestParticipantsList(chatId);
        if (!requests || requests.length === 0) {
          return await sock.sendMessage(chatId, {
            text: `\u26A0\uFE0F No pending join requests.`,
            ...channelInfo
          }, { quoted: message });
        }
        targets = requests.map((r) => r.jid);
      } else if (input) {
        const num = input.replace(/[^0-9]/g, "");
        targets = [`${num}@s.whatsapp.net`];
      } else {
        return await sock.sendMessage(chatId, {
          text: `\u274C Provide a number or \`all\`.

Example: \`.${isApprove ? "approvejoin" : "rejectjoin"} all\``,
          ...channelInfo
        }, { quoted: message });
      }
      await sock.groupRequestParticipantsUpdate(chatId, targets, action);
      const icon = isApprove ? "\u2705" : "\u274C";
      const verb = isApprove ? "Approved" : "Rejected";
      await sock.sendMessage(chatId, {
        text: `${icon} *${verb}* ${targets.length === 1 ? `+${targets[0].split("@")[0]}` : `${targets.length} request(s)`}`,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[JOINREQUESTS] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to ${action}: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  joinrequests_default as default
};
