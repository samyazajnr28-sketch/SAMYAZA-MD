const MOMO_DATA = {
  mtn: {
    name: "MTN Mobile Money (MoMo)",
    countries: [
      "Ghana \u{1F1EC}\u{1F1ED}",
      "Uganda \u{1F1FA}\u{1F1EC}",
      "Rwanda \u{1F1F7}\u{1F1FC}",
      "Cameroon \u{1F1E8}\u{1F1F2}",
      "Ivory Coast \u{1F1E8}\u{1F1EE}",
      "Zambia \u{1F1FF}\u{1F1F2}",
      "Benin \u{1F1E7}\u{1F1EF}",
      "South Africa \u{1F1FF}\u{1F1E6}",
      "Nigeria \u{1F1F3}\u{1F1EC}",
      "Congo \u{1F1E8}\u{1F1EC}"
    ],
    ussd: {
      "Ghana": "*170#",
      "Uganda": "*165#",
      "Rwanda": "*182#",
      "Cameroon": "*126#",
      "Nigeria": "*671#",
      "Zambia": "*303#"
    },
    shortcodes: {
      "Ghana": "1-300",
      "Uganda": "165",
      "Rwanda": "182"
    },
    features: [
      "Send & receive money",
      "Buy airtime & data",
      "Pay bills (electricity, water, TV)",
      "Bank transfers",
      "International transfers",
      "Merchant payments",
      "Savings & loans",
      "Insurance"
    ],
    website: "mtn.com/momo",
    helpline: {
      "Ghana": "100",
      "Uganda": "100",
      "Rwanda": "100",
      "Nigeria": "180"
    }
  },
  airtel: {
    name: "Airtel Money",
    countries: [
      "Kenya \u{1F1F0}\u{1F1EA}",
      "Tanzania \u{1F1F9}\u{1F1FF}",
      "Uganda \u{1F1FA}\u{1F1EC}",
      "Rwanda \u{1F1F7}\u{1F1FC}",
      "Zambia \u{1F1FF}\u{1F1F2}",
      "Malawi \u{1F1F2}\u{1F1FC}",
      "Madagascar \u{1F1F2}\u{1F1EC}",
      "Niger \u{1F1F3}\u{1F1EA}",
      "Congo DR \u{1F1E8}\u{1F1E9}",
      "Seychelles \u{1F1F8}\u{1F1E8}"
    ],
    ussd: {
      "Kenya": "*334#",
      "Tanzania": "*150*60#",
      "Uganda": "*185#",
      "Rwanda": "*171#",
      "Zambia": "*778#",
      "Malawi": "*121#"
    },
    shortcodes: {
      "Kenya": "334",
      "Tanzania": "150",
      "Uganda": "185"
    },
    features: [
      "Send & receive money",
      "Buy airtime & data",
      "Pay bills",
      "Bank to Airtel Money",
      "Airtel Money to bank",
      "International remittance",
      "Merchant payments"
    ],
    website: "airtel.com/airtelmoney",
    helpline: {
      "Kenya": "100",
      "Tanzania": "100",
      "Uganda": "100"
    }
  },
  mpesa: {
    name: "M-Pesa",
    countries: [
      "Kenya \u{1F1F0}\u{1F1EA}",
      "Tanzania \u{1F1F9}\u{1F1FF}",
      "Mozambique \u{1F1F2}\u{1F1FF}",
      "DRC \u{1F1E8}\u{1F1E9}",
      "Lesotho \u{1F1F1}\u{1F1F8}",
      "Ghana \u{1F1EC}\u{1F1ED}",
      "Egypt \u{1F1EA}\u{1F1EC}",
      "Ethiopia \u{1F1EA}\u{1F1F9}"
    ],
    ussd: {
      "Kenya": "*334# or *737#",
      "Tanzania": "*150*00#",
      "Mozambique": "*150*5#",
      "Ghana": "*500#",
      "Egypt": "*9#"
    },
    shortcodes: {
      "Kenya": "737 / 334",
      "Tanzania": "150"
    },
    features: [
      "Send money (Lipa na M-Pesa)",
      "Withdraw at agents",
      "Buy airtime",
      "Pay bills & merchants",
      "M-Shwari savings & loans",
      "KCB M-Pesa loans",
      "International transfers (WorldRemit, Western Union)",
      "Pay with QR code",
      "M-Pesa App"
    ],
    website: "safaricom.co.ke/mpesa",
    helpline: {
      "Kenya": "234",
      "Tanzania": "100"
    }
  },
  orange: {
    name: "Orange Money",
    countries: [
      "Senegal \u{1F1F8}\u{1F1F3}",
      "Mali \u{1F1F2}\u{1F1F1}",
      "Cameroon \u{1F1E8}\u{1F1F2}",
      "Ivory Coast \u{1F1E8}\u{1F1EE}",
      "Burkina Faso \u{1F1E7}\u{1F1EB}",
      "Guinea \u{1F1EC}\u{1F1F3}",
      "Madagascar \u{1F1F2}\u{1F1EC}",
      "Tunisia \u{1F1F9}\u{1F1F3}"
    ],
    ussd: {
      "Senegal": "#144#",
      "Mali": "#144#",
      "Cameroon": "#150#",
      "Ivory Coast": "#144#"
    },
    shortcodes: { "Senegal": "144" },
    features: [
      "Send & receive money",
      "Buy airtime",
      "Pay bills",
      "Orange Bank transfers",
      "International transfers"
    ],
    website: "orange.com/orangemoney",
    helpline: { "Senegal": "888", "Mali": "888" }
  },
  wave: {
    name: "Wave Mobile Money",
    countries: [
      "Senegal \u{1F1F8}\u{1F1F3}",
      "Ivory Coast \u{1F1E8}\u{1F1EE}",
      "Mali \u{1F1F2}\u{1F1F1}",
      "Burkina Faso \u{1F1E7}\u{1F1EB}",
      "Guinea \u{1F1EC}\u{1F1F3}",
      "Uganda \u{1F1FA}\u{1F1EC}",
      "Gambia \u{1F1EC}\u{1F1F2}"
    ],
    ussd: {
      "Senegal": "*999#",
      "Ivory Coast": "*999#"
    },
    shortcodes: {},
    features: [
      "Zero fees on transfers (between Wave users)",
      "Send & receive money",
      "Pay merchants",
      "Buy airtime",
      "Cash in/out at agents",
      "Wave App (iOS & Android)"
    ],
    website: "wave.com",
    helpline: { "Senegal": "33 889 05 55" }
  }
};
var momo_default = {
  command: "momo",
  aliases: ["mobilemoney", "mpesa", "airtelmoney", "mtnmomo", "wave"],
  category: "info",
  description: "Mobile Money info for African networks (MTN, Airtel, M-Pesa, Wave, Orange)",
  usage: ".momo mtn\n.momo mpesa\n.momo airtel",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, userMessage } = context;
    let query = args[0]?.toLowerCase() || "";
    if (userMessage.includes("mpesa")) query = "mpesa";
    else if (userMessage.includes("airtelmoney")) query = "airtel";
    else if (userMessage.includes("mtnmomo")) query = "mtn";
    else if (userMessage.includes("wave")) query = "wave";
    if (!query) {
      const list = Object.entries(MOMO_DATA).map(
        ([k, v]) => `\u2022 \`.momo ${k}\` \u2014 ${v.name}`
      ).join("\n");
      return await sock.sendMessage(chatId, {
        text: `\u{1F4E1} *Mobile Money Info*

*Available networks:*
${list}

*Examples:*
\`.momo mtn\`
\`.momo mpesa\`
\`.momo airtel\``,
        ...channelInfo
      }, { quoted: message });
    }
    const key = Object.keys(MOMO_DATA).find(
      (k) => query.includes(k) || k.includes(query) || MOMO_DATA[k].name.toLowerCase().includes(query)
    );
    if (!key) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Unknown network: *${query}*

Available: ${Object.keys(MOMO_DATA).join(", ")}`,
        ...channelInfo
      }, { quoted: message });
    }
    const m = MOMO_DATA[key];
    const ussdList = Object.entries(m.ussd).map(([c, u]) => `\u2022 ${c}: \`${u}\``).join("\n");
    const helpList = Object.entries(m.helpline).map(([c, h]) => `\u2022 ${c}: ${h}`).join("\n");
    const featureList = m.features.map((f) => `\u2705 ${f}`).join("\n");
    await sock.sendMessage(chatId, {
      text: `\u{1F4E1} *${m.name}*

\u{1F30D} *Available in:*
${m.countries.join(", ")}

\u{1F4F2} *USSD Codes:*
${ussdList}

\u26A1 *Features:*
${featureList}

` + (helpList ? `\u{1F4DE} *Helpline:*
${helpList}

` : "") + `\u{1F310} *Website:* ${m.website}`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  momo_default as default
};
