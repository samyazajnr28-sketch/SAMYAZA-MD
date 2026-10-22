var pokedex_default = {
  command: "pokedex",
  aliases: ["pokemon", "poke"],
  category: "info",
  description: "Get information about a Pok\xE9mon",
  usage: ".pokedex <pokemon name>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(" ").trim();
    if (!text) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Pok\xE9mon name to search for.*\nExample: `.pokedex pikachu`"
      }, { quoted: message });
    }
    try {
      const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw json.error || "Unknown error";
      const messageText = `
*\u2261 Name:* ${json.name}
*\u2261 ID:* ${json.id}
*\u2261 Type:* ${Array.isArray(json.type) ? json.type.join(", ") : json.type}
*\u2261 Abilities:* ${Array.isArray(json.abilities) ? json.abilities.join(", ") : json.abilities}
*\u2261 Species:* ${Array.isArray(json.species) ? json.species.join(", ") : json.species}
*\u2261 Height:* ${json.height}
*\u2261 Weight:* ${json.weight}
*\u2261 Experience:* ${json.base_experience}
*\u2261 Description:* ${json.description}
      `.trim();
      await sock.sendMessage(chatId, { text: messageText, quoted: message });
    } catch (error) {
      console.error("Pokedex Command Error:", error);
      await sock.sendMessage(chatId, { text: `\u274C Error: ${error}` }, { quoted: message });
    }
  }
};
export {
  pokedex_default as default
};
