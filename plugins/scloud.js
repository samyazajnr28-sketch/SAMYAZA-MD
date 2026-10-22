import axios from "axios";
var scloud_default = {
  command: "scloud",
  aliases: ["scsearch", "soundcloud"],
  category: "download",
  description: "Search for tracks on SoundCloud",
  usage: ".scloud <song name>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const searchQuery = args.join(" ").trim();
    try {
      if (!searchQuery) {
        return await sock.sendMessage(chatId, {
          text: "*What do you want to search on SoundCloud?*\nUsage: .soundcloud <song name>\n\nExample: .soundcloud never gonna give you up"
        }, { quoted: message });
      }
      await new Promise((resolve) => setTimeout(resolve, 1e4));
      const searchUrl = `https://discardapi.dpdns.org/api/search/soundcloud?apikey=guru&query=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(searchUrl, { timeout: 3e4 });
      if (!response.data?.result?.result || response.data.result.result.length === 0) {
        return await sock.sendMessage(chatId, {
          text: "\u274C *No results found!*\nTry a different search term."
        }, { quoted: message });
      }
      const results = response.data.result.result;
      const totalFound = results.length;
      const tracks = results.filter((item) => item.kind === "track");
      if (tracks.length === 0) {
        return await sock.sendMessage(chatId, {
          text: "\u274C *No tracks found!*\nOnly found user profiles. Try searching for specific songs."
        }, { quoted: message });
      }
      const limit = Math.min(5, tracks.length);
      let resultText = `\u{1F3B5} *SoundCloud Results*
`;
      resultText += `\u{1F4CA} Found ${totalFound} results (${tracks.length} tracks)

`;
      for (let i = 0; i < limit; i++) {
        const track = tracks[i];
        const duration = Math.floor(track.duration / 1e3);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        resultText += `*${i + 1}. ${track.title}*
`;
        resultText += `\u{1F464} Artist: ${track.user_id ? "Available" : "Unknown"}
`;
        resultText += `\u23F1\uFE0F Duration: ${minutes}:${seconds.toString().padStart(2, "0")}
`;
        resultText += `\u{1F442} Plays: ${track.playback_count?.toLocaleString() || "N/A"}
`;
        resultText += `\u2764\uFE0F Likes: ${track.likes_count?.toLocaleString() || "N/A"}
`;
        resultText += `\u{1F4AC} Comments: ${track.comment_count?.toLocaleString() || "N/A"}
`;
        resultText += `\u{1F3BC} Genre: ${track.genre || "Unknown"}
`;
        resultText += `\u{1F517} Link: ${track.permalink_url}

`;
      }
      if (tracks.length > limit) {
        resultText += `_+${tracks.length - limit} more tracks available_`;
      }
      const firstTrack = tracks[0];
      if (firstTrack.artwork_url) {
        try {
          const imageBuffer = await axios.get(firstTrack.artwork_url, {
            responseType: "arraybuffer",
            timeout: 15e3
          }).then((res) => Buffer.from(res.data));
          await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: resultText
          }, { quoted: message });
        } catch (imgError) {
          await sock.sendMessage(chatId, {
            text: resultText
          }, { quoted: message });
        }
      } else {
        await sock.sendMessage(chatId, {
          text: resultText
        }, { quoted: message });
      }
    } catch (error) {
      console.error("SoundCloud Search Error:", error);
      let errorMsg = "\u274C *Search failed!*\n\n";
      if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
        errorMsg += "*Reason:* Connection timeout\nThe API took too long to respond.";
      } else if (error.response) {
        errorMsg += `*Status:* ${error.response.status}
*Error:* ${error.response.statusText}`;
      } else {
        errorMsg += `*Error:* ${error.message}`;
      }
      errorMsg += "\n\nPlease try again later.";
      await sock.sendMessage(chatId, {
        text: errorMsg
      }, { quoted: message });
    }
  }
};
export {
  scloud_default as default
};
