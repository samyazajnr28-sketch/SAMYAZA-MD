import { handleWelcome } from "../lib/welcome.js";
import { isWelcomeOn, getWelcome } from "../lib/index.js";
var welcome_default = {
  command: "welcome",
  aliases: ["setwelcome"],
  category: "group",
  description: "Configure welcome message for the group",
  usage: ".welcome [on/off/message]",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const matchText = args.join(" ");
    await handleWelcome(sock, chatId, message, matchText);
  }
};
async function handleJoinEvent(sock, id, participants) {
  const isWelcomeEnabled = await isWelcomeOn(id);
  if (!isWelcomeEnabled) return;
  const customMessage = await getWelcome(id);
  const groupMetadata = await sock.groupMetadata(id);
  const groupName = groupMetadata.subject;
  const groupDesc = groupMetadata.desc || "No description available";
  const channelInfo = {
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363319098372999@newsletter",
        newsletterName: "MEGA MD",
        serverMessageId: -1
      }
    }
  };
  for (const participant of participants) {
    try {
      const participantString = typeof participant === "string" ? participant : participant.id || participant.toString();
      const user = participantString.split("@")[0];
      let displayName = user;
      try {
        const contact = await sock.getBusinessProfile(participantString);
        if (contact && contact.name) {
          displayName = contact.name;
        } else {
          const groupParticipants = groupMetadata.participants;
          const userParticipant = groupParticipants.find((p) => p.id === participantString);
          if (userParticipant && userParticipant.name) {
            displayName = userParticipant.name;
          }
        }
      } catch (nameError) {
        console.log("Could not fetch display name, using phone number");
      }
      let finalMessage;
      if (customMessage) {
        finalMessage = customMessage.replace(/{user}/g, `@${displayName}`).replace(/{group}/g, groupName).replace(/{description}/g, groupDesc);
      } else {
        const now = /* @__PURE__ */ new Date();
        const timeString = now.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        finalMessage = `\u256D\u257C\u2501\u226A\u2022\u{1D67D}\u{1D674}\u{1D686} \u{1D67C}\u{1D674}\u{1D67C}\u{1D671}\u{1D674}\u{1D681}\u2022\u226B\u2501\u257E\u256E
\u2503\u{1D686}\u{1D674}\u{1D67B}\u{1D672}\u{1D67E}\u{1D67C}\u{1D674}: @${displayName} \u{1F44B}
\u2503Member count: #${groupMetadata.participants.length}
\u2503\u{1D683}\u{1D678}\u{1D67C}\u{1D674}: ${timeString}\u23F0
\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u256F

*@${displayName}* Welcome to *${groupName}*! \u{1F389}
*Group \u{1D673}\u{1D674}\u{1D682}\u{1D672}\u{1D681}\u{1D678}\u{1D67F}\u{1D683}\u{1D678}\u{1D67E}\u{1D67D}*
${groupDesc}

> *\u1D18\u1D0F\u1D21\u1D07\u0280\u1D07\u1D05 \u0299\u028F MEGA-MD*`;
      }
      try {
        let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
        try {
          const profilePic = await sock.profilePictureUrl(participantString, "image");
          if (profilePic) {
            profilePicUrl = profilePic;
          }
        } catch (profileError) {
          console.log("Could not fetch profile picture, using default");
        }
        const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          await sock.sendMessage(id, {
            image: imageBuffer,
            caption: finalMessage,
            mentions: [participantString],
            ...channelInfo
          });
          continue;
        }
      } catch (imageError) {
        console.log("Image generation failed, falling back to text");
      }
      await sock.sendMessage(id, {
        text: finalMessage,
        mentions: [participantString],
        ...channelInfo
      });
    } catch (error) {
      console.error("Error sending welcome message:", error);
      const participantString = typeof participant === "string" ? participant : participant.id || participant.toString();
      const user = participantString.split("@")[0];
      let fallbackMessage;
      if (customMessage) {
        fallbackMessage = customMessage.replace(/{user}/g, `@${user}`).replace(/{group}/g, groupName).replace(/{description}/g, groupDesc);
      } else {
        fallbackMessage = `Welcome @${user} to ${groupName}! \u{1F389}`;
      }
      await sock.sendMessage(id, {
        text: fallbackMessage,
        mentions: [participantString],
        ...channelInfo
      });
    }
  }
}
export {
  welcome_default as default,
  handleJoinEvent
};
