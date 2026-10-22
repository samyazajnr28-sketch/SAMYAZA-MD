import axios from "axios";
var medicine_default = {
  command: "medicine",
  aliases: ["drug", "medinfo", "druginfo", "med"],
  category: "info",
  description: "Get medicine/drug info: uses, side effects, warnings",
  usage: ".medicine aspirin\n.medicine paracetamol",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const query = args.join(" ").trim();
    if (!query) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F48A} *Medicine Info*

*Usage:* \`.medicine <name>\`

*Examples:*
\u2022 \`.medicine aspirin\`
\u2022 \`.medicine paracetamol\`
\u2022 \`.medicine amoxicillin\`
\u2022 \`.medicine ibuprofen\`
\u2022 \`.medicine metformin\`

\u26A0\uFE0F _Information is from FDA database. Always consult a doctor._`,
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: `\u{1F50D} Looking up *${query}*...`, ...channelInfo }, { quoted: message });
    try {
      const res = await axios.get(
        `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=1`,
        { timeout: 15e3 }
      );
      const result = res.data.results?.[0];
      if (!result) {
        return await sock.sendMessage(chatId, {
          text: `\u274C No information found for: *${query}*

Try the generic name (e.g. paracetamol instead of Panadol)`,
          ...channelInfo
        }, { quoted: message });
      }
      const openfda = result.openfda || {};
      const brandName = openfda.brand_name?.[0] || query;
      const genericName = openfda.generic_name?.[0] || "N/A";
      const manufacturer = openfda.manufacturer_name?.[0] || "N/A";
      const route = openfda.route?.[0] || "N/A";
      const substanceName = openfda.substance_name?.[0] || "N/A";
      const clean = (text2, maxLen = 400) => {
        if (!text2) return "N/A";
        const str = Array.isArray(text2) ? text2[0] : text2;
        const cleaned = str.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
        return cleaned.length > maxLen ? cleaned.substring(0, maxLen) + "..." : cleaned;
      };
      const purpose = clean(result.purpose, 300);
      const indications = clean(result.indications_and_usage, 400);
      const warnings = clean(result.warnings, 400);
      const sideEffects = clean(result.adverse_reactions, 400);
      const dosage = clean(result.dosage_and_administration, 300);
      const storage = clean(result.storage_and_handling, 200);
      let text = `\u{1F48A} *${brandName}*
`;
      if (genericName !== "N/A") text += `_(${genericName})_
`;
      text += `
`;
      if (substanceName !== "N/A") text += `\u{1F9EA} *Active Substance:* ${substanceName}
`;
      text += `\u{1F3ED} *Manufacturer:* ${manufacturer}
`;
      text += `\u{1F489} *Route:* ${route}

`;
      if (purpose !== "N/A") text += `\u{1F3AF} *Purpose:*
${purpose}

`;
      if (indications !== "N/A") text += `\u2705 *Uses:*
${indications}

`;
      if (dosage !== "N/A") text += `\u{1F4CF} *Dosage:*
${dosage}

`;
      if (warnings !== "N/A") text += `\u26A0\uFE0F *Warnings:*
${warnings}

`;
      if (sideEffects !== "N/A") text += `\u{1F534} *Side Effects:*
${sideEffects}

`;
      if (storage !== "N/A") text += `\u{1F4E6} *Storage:* ${storage}

`;
      text += `\u2695\uFE0F _Always consult a qualified doctor before taking any medication._`;
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    } catch (error) {
      if (error.response?.status === 404) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Medicine not found: *${query}*

Try using the generic/scientific name.`,
          ...channelInfo
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  medicine_default as default
};
