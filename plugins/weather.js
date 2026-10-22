import axios from "axios";
import { channelInfo } from "../lib/messageConfig.js";
var weather_default = {
  command: "weather",
  aliases: ["forecast", "climate"],
  category: "info",
  description: "Get the current weather for a specific city!",
  usage: ".weather <city>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const city = args.join(" ").trim();
    if (!city) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a place to search.*\nExample: .weather Karachi",
        ...channelInfo
      }, { quoted: message });
    }
    try {
      const apiKey = "060a6bcfa19809c2cd4d97a212b19273";
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
      const weather = response.data;
      const weatherText = `\u029C\u1D07\u0280\u1D07 \u026As \u028F\u1D0F\u1D1C\u0280 \u1D18\u029F\u1D00\u1D04\u1D07 \u1D21\u1D07\u1D00\u1D1B\u029C\u1D07\u0280

\u300C \u{1F305} \u300D\u1D18\u029F\u1D00\u1D04\u1D07: ${weather.name}
\u300C \u{1F5FA}\uFE0F \u300D\u1D04\u1D0F\u1D1C\u0274\u1D1B\u0280\u028F: ${weather.sys.country}
\u300C \u{1F324}\uFE0F \u300D\u1D20\u026A\u1D07\u1D21: ${weather.weather[0].description}
\u300C \u{1F321}\uFE0F \u300D\u1D1B\u1D07\u1D0D\u1D18\u1D07\u0280\u1D00\u1D1B\u1D1C\u0280\u1D07: ${weather.main.temp}\xB0C
\u300C \u{1F4A0} \u300D\u1D0D\u026A\u0274\u026A\u1D0D\u1D1C\u1D0D \u1D1B\u1D07\u1D0D\u1D18\u1D07\u0280\u1D00\u1D1B\u1D1C\u0280\u1D07: ${weather.main.temp_min}\xB0C
\u300C \u{1F525} \u300D\u1D0D\u1D00x\u026A\u1D0D\u1D1C\u1D0D \u1D1B\u1D07\u1D0D\u1D18\u1D07\u0280\u1D00\u1D1B\u1D1C\u0280\u1D07: ${weather.main.temp_max}\xB0C
\u300C \u{1F4A6} \u300D\u029C\u1D1C\u1D0D\u026A\u1D05\u026A\u1D1B\u028F: ${weather.main.humidity}%
\u300C \u{1F32C}\uFE0F \u300D\u1D21\u026A\u0274\u1D05 s\u1D18\u1D07\u1D07\u1D05: ${weather.wind.speed} km/h`;
      await sock.sendMessage(chatId, {
        text: weatherText,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      console.error("Weather plugin error:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Sorry, I could not fetch the weather. Make sure the place name is correct.",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  weather_default as default
};
