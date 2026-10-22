import mumaker from "mumaker";
const allTypes = [
  "metallic",
  "ice",
  "snow",
  "impressive",
  "matrix",
  "light",
  "neon",
  "devil",
  "purple",
  "thunder",
  "leaves",
  "1917",
  "arena",
  "hacker",
  "sand",
  "blackpink",
  "glitch",
  "fire"
];
var textmaker_default = {
  command: "ephoto",
  aliases: ["tmaker", "textmaker"],
  category: "text maker",
  description: "Generate styled text with various effects",
  usage: ".ephoto <type> <text>",
  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const type = args[0]?.toLowerCase();
    const text = args.slice(1).join(" ");
    if (!type || !allTypes.includes(type) || !text) {
      let menuText = `\u2728\u{1F3A8} *EPHOTO TEXT MAKER* \u{1F3A8}\u2728
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F58C}\uFE0F *Create stunning text styles*
\u26A1 Fast \u2022 Stylish \u2022 HD Effects

\u{1F4CC} *Usage*
\u{1F449} *.ephoto <type> <text>*
\u{1F4D6} Example:
\u{1F449} *.ephoto metallic Hello*

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F3AD} *AVAILABLE STYLES*
`;
      allTypes.forEach((t, i) => {
        menuText += `\u{1F539} *${i + 1}.* ${t}
`;
      });
      menuText += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4A1} *Tip:* Use short & clear text for best results
\u{1F916} Powered by *MEGA-MD*`;
      return await sock.sendMessage(
        chatId,
        { text: menuText },
        { quoted: message }
      );
    }
    try {
      let url;
      switch (type) {
        case "metallic":
          url = "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html";
          break;
        case "ice":
          url = "https://en.ephoto360.com/ice-text-effect-online-101.html";
          break;
        case "snow":
          url = "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html";
          break;
        case "impressive":
          url = "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html";
          break;
        case "matrix":
          url = "https://en.ephoto360.com/matrix-text-effect-154.html";
          break;
        case "light":
          url = "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html";
          break;
        case "neon":
          url = "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html";
          break;
        case "devil":
          url = "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html";
          break;
        case "purple":
          url = "https://en.ephoto360.com/purple-text-effect-online-100.html";
          break;
        case "thunder":
          url = "https://en.ephoto360.com/thunder-text-effect-online-97.html";
          break;
        case "leaves":
          url = "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html";
          break;
        case "1917":
          url = "https://en.ephoto360.com/1917-style-text-effect-523.html";
          break;
        case "arena":
          url = "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html";
          break;
        case "hacker":
          url = "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html";
          break;
        case "sand":
          url = "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html";
          break;
        case "blackpink":
          url = "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html";
          break;
        case "glitch":
          url = "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html";
          break;
        case "fire":
          url = "https://en.ephoto360.com/flame-lettering-effect-372.html";
          break;
      }
      const result = await mumaker.ephoto(url, text);
      if (!result?.image) {
        throw new Error("No image URL received from the API");
      }
      await sock.sendMessage(
        chatId,
        {
          image: { url: result.image },
          caption: `\u{1F525} *GENERATED SUCCESSFULLY* \u{1F525}
\u2728 Powered by *MEGA-MD*`
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error generating styled text:", error);
      await sock.sendMessage(
        chatId,
        { text: `\u274C *Generation Failed*
Reason: ${error.message}` },
        { quoted: message }
      );
    }
  }
};
export {
  textmaker_default as default
};
