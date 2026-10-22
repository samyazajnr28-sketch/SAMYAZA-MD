var imdb_default = {
  command: "imdb",
  aliases: ["movie", "film"],
  category: "info",
  description: "Get detailed information about a movie or series from IMDB",
  usage: ".imdb <movie/series title>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(" ").trim();
    if (!text) {
      await sock.sendMessage(chatId, {
        text: "*Please provide a movie or series title.*\nExample: `.imdb Inception`",
        quoted: message
      });
      return;
    }
    try {
      const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
      const json = await res.json();
      const ratings = (json.ratings || []).map((r) => `\u2B50 *${r.source}:* ${r.value}`).join("\n") || "No ratings available";
      const movieInfo = `
\u{1F3AC} *${json.title || "N/A"}* (${json.year || "N/A"})
\u{1F3AD} *Genres:* ${json.genres || "N/A"}
\u{1F4FA} *Type:* ${json.type || "N/A"}
\u{1F4DD} *Plot:* ${json.plot || "N/A"}
\u2B50 *IMDB Rating:* ${json.rating || "N/A"} (${json.votes || "N/A"} votes)
\u{1F3C6} *Awards:* ${json.awards || "N/A"}
\u{1F3AC} *Director:* ${json.director || "N/A"}
\u270D\uFE0F *Writer:* ${json.writer || "N/A"}
\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} *Actors:* ${json.actors || "N/A"}
\u23F1\uFE0F *Runtime:* ${json.runtime || "N/A"}
\u{1F4C5} *Released:* ${json.released || "N/A"}
\u{1F310} *Country:* ${json.country || "N/A"}
\u{1F5E3}\uFE0F *Languages:* ${json.languages || "N/A"}
\u{1F4B0} *Box Office:* ${json.boxoffice || "N/A"}
\u{1F4BD} *DVD Release:* ${json.dvd || "N/A"}
\u{1F3E2} *Production:* ${json.production || "N/A"}
\u{1F517} *Website:* ${json.website || "N/A"}

*Ratings:*
${ratings}
      `.trim();
      if (json.poster) {
        await sock.sendMessage(chatId, {
          image: { url: json.poster },
          caption: movieInfo,
          quoted: message
        });
      } else {
        await sock.sendMessage(chatId, { text: movieInfo, quoted: message });
      }
    } catch (error) {
      console.error("IMDB Command Error:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Failed to fetch movie information. Please try again later.",
        quoted: message
      });
    }
  }
};
export {
  imdb_default as default
};
