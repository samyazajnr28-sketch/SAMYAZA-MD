import yts from "yt-search";
var ytsearch_default = {
  command: "ytsearch",
  aliases: ["yts", "song"],
  category: "download",
  description: "Search YouTube",
  usage: ".yts [query]",
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(chatId, {
        text: `Example: *.yts* Lil Peep`
      }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, { react: { text: "\u{1F50D}", key: message.key } });
      const result = await yts(query);
      const videos = result.videos.slice(0, 10);
      if (videos.length === 0) {
        return sock.sendMessage(chatId, { text: "\u274C No results found." });
      }
      let searchText = `\u2728 *MUSIC SEARCH* \u2728

`;
      videos.forEach((v, index) => {
        searchText += `*${index + 1}.\u{1F3A7} ${v.title}*
`;
        searchText += `*\u231A Duration:* ${v.timestamp}
`;
        searchText += `*\u{1F440} Views:* ${v.views}
`;
        searchText += `*\u{1F517} URL:* ${v.url}
`;
        searchText += `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
`;
      });
      await sock.sendMessage(chatId, {
        image: { url: videos[0].image },
        caption: searchText
      }, { quoted: message });
    } catch (error) {
      console.error("YouTube Search Error:", error);
      await sock.sendMessage(chatId, { text: "\u274C Error searching YouTube." });
    }
  }
};
export {
  ytsearch_default as default
};
