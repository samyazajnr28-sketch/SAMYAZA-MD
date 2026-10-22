function safeMath(expr) {
  const sanitized = expr.replace(/\^/g, "**").replace(/sqrt\(/g, "Math.sqrt(").replace(/cbrt\(/g, "Math.cbrt(").replace(/abs\(/g, "Math.abs(").replace(/sin\(/g, "Math.sin(").replace(/cos\(/g, "Math.cos(").replace(/tan\(/g, "Math.tan(").replace(/log\(/g, "Math.log10(").replace(/ln\(/g, "Math.log(").replace(/floor\(/g, "Math.floor(").replace(/ceil\(/g, "Math.ceil(").replace(/round\(/g, "Math.round(").replace(/pow\(/g, "Math.pow(").replace(/min\(/g, "Math.min(").replace(/max\(/g, "Math.max(").replace(/\bpi\b/gi, String(Math.PI)).replace(/\be\b/g, String(Math.E));
  const blocked = /[a-zA-Z_$](?!ath\.)(?![0-9])/;
  const mathFunctions = /Math\.[a-z]+/g;
  const cleaned = sanitized.replace(mathFunctions, "");
  if (blocked.test(cleaned)) {
    throw new Error("Invalid expression \u2014 only math operators and functions allowed");
  }
  if (!/^[\d\s+\-*/%.(),Math.a-zA-Z]+$/.test(sanitized)) {
    throw new Error("Invalid characters in expression");
  }
  const result = Function(`"use strict"; return (${sanitized})`)();
  if (typeof result !== "number") throw new Error("Result is not a number");
  if (!isFinite(result)) throw new Error("Result is Infinity or NaN");
  return Number.isInteger(result) ? String(result) : result.toPrecision(10).replace(/\.?0+$/, "");
}
var calc_default = {
  command: "calc",
  aliases: ["math", "calculate", "solve"],
  category: "utility",
  description: "Advanced calculator",
  usage: ".calc <expression>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const expr = args.join(" ").trim();
    if (!expr) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F9EE} *CALCULATOR*

*Usage:* \`.calc <expression>\`

*Examples:*
\u2022 \`.calc 2 ** 10\` \u2192 1024
\u2022 \`.calc sqrt(144)\` \u2192 12
\u2022 \`.calc sin(pi / 2)\` \u2192 1
\u2022 \`.calc log(1000)\` \u2192 3
\u2022 \`.calc (3 + 4) * 2\` \u2192 14
\u2022 \`.calc pow(2, 8)\` \u2192 256

*Functions:* sqrt, cbrt, abs, sin, cos, tan, log, ln, floor, ceil, round, pow, min, max
*Constants:* pi, e`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      const result = safeMath(expr);
      await sock.sendMessage(chatId, {
        text: `\u{1F9EE} *Calculator*

\u{1F4E5} *Input:* \`${expr}\`
\u{1F4E4} *Result:* \`${result}\``,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C *Error:* ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  calc_default as default
};
