import axios from "axios";
const OMDB_KEY = "trilogy";
var movie_default = {
  command: "movie",
  aliases: ["film", "bollywood", "omdb", "imdb"],
  category: "info",
  description: "Search movie info, ratings, cast, plot",
  usage: ".movie <movie name>\n.movie Pathaan\n.movie Jawan 2023",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const input = args.join(" ").trim();
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F3AC} *Movie Info*

*Usage:* \`.movie <name>\`

*Examples:*
\u2022 \`.movie Pathaan\`
\u2022 \`.movie Jawan 2023\`
\u2022 \`.movie Avengers Endgame\`
\u2022 \`.movie RRR\`
\u2022 \`.movie Black Panther\`

Works for Bollywood, Hollywood, and all languages!`,
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: `\u{1F50D} Searching *${input}*...`, ...channelInfo }, { quoted: message });
    try {
      const year = input.match(/\b(19|20)\d{2}\b/)?.[0];
      const title = input.replace(/\b(19|20)\d{2}\b/, "").trim();
      let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_KEY}&plot=full`;
      if (year) url += `&y=${year}`;
      const res = await axios.get(url, { timeout: 15e3 });
      let data = res.data;
      if (data.Response === "False") {
        const searchRes = await axios.get(
          `https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${OMDB_KEY}&type=movie`,
          { timeout: 15e3 }
        );
        const searchData = searchRes.data;
        if (searchData.Response === "True" && searchData.Search?.length) {
          const first = searchData.Search[0];
          const detailRes = await axios.get(
            `https://www.omdbapi.com/?i=${first.imdbID}&apikey=${OMDB_KEY}&plot=full`,
            { timeout: 15e3 }
          );
          data = detailRes.data;
        }
      }
      if (data.Response === "False") {
        return await sock.sendMessage(chatId, {
          text: `\u274C Movie not found: *${input}*`,
          ...channelInfo
        }, { quoted: message });
      }
      const ratings = (data.Ratings || []).map((r) => `\u2022 ${r.Source}: *${r.Value}*`).join("\n");
      const imdbStars = data.imdbRating !== "N/A" ? "\u2B50".repeat(Math.round(parseFloat(data.imdbRating) / 2)) + ` (${data.imdbRating}/10)` : "N/A";
      const text = `\u{1F3AC} *${data.Title}* (${data.Year})

\u{1F3AD} *Genre:* ${data.Genre}
\u{1F30D} *Language:* ${data.Language}
\u{1F3AC} *Director:* ${data.Director}
\u{1F3AD} *Cast:* ${data.Actors}
\u23F1\uFE0F *Runtime:* ${data.Runtime}
\u{1F3C6} *Awards:* ${data.Awards}

${imdbStars}
${ratings}

\u{1F4DD} *Plot:*
${data.Plot}

` + (data.BoxOffice && data.BoxOffice !== "N/A" ? `\u{1F4B0} *Box Office:* ${data.BoxOffice}
` : "") + `\u{1F517} imdb.com/title/${data.imdbID}`;
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  movie_default as default
};
