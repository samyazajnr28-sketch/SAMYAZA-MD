const UNITS = {
  length: {
    mm: { factor: 1e-3, base: "m", name: "Millimeter" },
    cm: { factor: 0.01, base: "m", name: "Centimeter" },
    m: { factor: 1, base: "m", name: "Meter" },
    km: { factor: 1e3, base: "m", name: "Kilometer" },
    in: { factor: 0.0254, base: "m", name: "Inch" },
    ft: { factor: 0.3048, base: "m", name: "Foot" },
    yd: { factor: 0.9144, base: "m", name: "Yard" },
    mi: { factor: 1609.344, base: "m", name: "Mile" },
    nmi: { factor: 1852, base: "m", name: "Nautical Mile" },
    ly: { factor: 9461e12, base: "m", name: "Light Year" }
  },
  weight: {
    mg: { factor: 1e-6, base: "kg", name: "Milligram" },
    g: { factor: 1e-3, base: "kg", name: "Gram" },
    kg: { factor: 1, base: "kg", name: "Kilogram" },
    t: { factor: 1e3, base: "kg", name: "Metric Ton" },
    oz: { factor: 0.0283495, base: "kg", name: "Ounce" },
    lb: { factor: 0.453592, base: "kg", name: "Pound" },
    st: { factor: 6.35029, base: "kg", name: "Stone" }
  },
  temperature: {
    c: { factor: 1, offset: 0, base: "c", name: "Celsius" },
    f: { factor: 1, offset: 0, base: "c", name: "Fahrenheit" },
    k: { factor: 1, offset: 0, base: "c", name: "Kelvin" }
  },
  speed: {
    mps: { factor: 1, base: "mps", name: "Meters/sec" },
    kph: { factor: 0.277778, base: "mps", name: "Km/hour" },
    mph: { factor: 0.44704, base: "mps", name: "Miles/hour" },
    knot: { factor: 0.514444, base: "mps", name: "Knot" },
    fps: { factor: 0.3048, base: "mps", name: "Feet/sec" },
    mach: { factor: 343, base: "mps", name: "Mach" }
  },
  data: {
    bit: { factor: 1, base: "bit", name: "Bit" },
    byte: { factor: 8, base: "bit", name: "Byte" },
    kb: { factor: 8e3, base: "bit", name: "Kilobyte" },
    mb: { factor: 8e6, base: "bit", name: "Megabyte" },
    gb: { factor: 8e9, base: "bit", name: "Gigabyte" },
    tb: { factor: 8e12, base: "bit", name: "Terabyte" },
    pb: { factor: 8e15, base: "bit", name: "Petabyte" },
    kib: { factor: 8192, base: "bit", name: "Kibibyte" },
    mib: { factor: 8388608, base: "bit", name: "Mebibyte" },
    gib: { factor: 8589934592, base: "bit", name: "Gibibyte" }
  },
  area: {
    mm2: { factor: 1e-6, base: "m2", name: "mm\xB2" },
    cm2: { factor: 1e-4, base: "m2", name: "cm\xB2" },
    m2: { factor: 1, base: "m2", name: "m\xB2" },
    km2: { factor: 1e6, base: "m2", name: "km\xB2" },
    in2: { factor: 64516e-8, base: "m2", name: "in\xB2" },
    ft2: { factor: 0.092903, base: "m2", name: "ft\xB2" },
    ac: { factor: 4046.86, base: "m2", name: "Acre" },
    ha: { factor: 1e4, base: "m2", name: "Hectare" }
  },
  volume: {
    ml: { factor: 1e-3, base: "l", name: "Milliliter" },
    l: { factor: 1, base: "l", name: "Liter" },
    m3: { factor: 1e3, base: "l", name: "m\xB3" },
    tsp: { factor: 492892e-8, base: "l", name: "Teaspoon" },
    tbsp: { factor: 0.0147868, base: "l", name: "Tablespoon" },
    floz: { factor: 0.0295735, base: "l", name: "Fl Ounce" },
    cup: { factor: 0.236588, base: "l", name: "Cup" },
    pt: { factor: 0.473176, base: "l", name: "Pint" },
    qt: { factor: 0.946353, base: "l", name: "Quart" },
    gal: { factor: 3.78541, base: "l", name: "Gallon (US)" }
  },
  time: {
    ms: { factor: 1e-3, base: "s", name: "Millisecond" },
    s: { factor: 1, base: "s", name: "Second" },
    min: { factor: 60, base: "s", name: "Minute" },
    hr: { factor: 3600, base: "s", name: "Hour" },
    day: { factor: 86400, base: "s", name: "Day" },
    wk: { factor: 604800, base: "s", name: "Week" },
    mo: { factor: 2629800, base: "s", name: "Month (avg)" },
    yr: { factor: 31557600, base: "s", name: "Year" }
  },
  pressure: {
    pa: { factor: 1, base: "pa", name: "Pascal" },
    kpa: { factor: 1e3, base: "pa", name: "Kilopascal" },
    mpa: { factor: 1e6, base: "pa", name: "Megapascal" },
    bar: { factor: 1e5, base: "pa", name: "Bar" },
    atm: { factor: 101325, base: "pa", name: "Atmosphere" },
    psi: { factor: 6894.76, base: "pa", name: "PSI" },
    mmhg: { factor: 133.322, base: "pa", name: "mmHg / Torr" }
  },
  energy: {
    j: { factor: 1, base: "j", name: "Joule" },
    kj: { factor: 1e3, base: "j", name: "Kilojoule" },
    cal: { factor: 4.184, base: "j", name: "Calorie" },
    kcal: { factor: 4184, base: "j", name: "Kilocalorie" },
    wh: { factor: 3600, base: "j", name: "Watt-hour" },
    kwh: { factor: 36e5, base: "j", name: "Kilowatt-hour" },
    btu: { factor: 1055.06, base: "j", name: "BTU" },
    ev: { factor: 1602e-22, base: "j", name: "Electron Volt" }
  }
};
const UNIT_TO_CATEGORY = {};
for (const [cat, units] of Object.entries(UNITS)) {
  for (const sym of Object.keys(units)) {
    UNIT_TO_CATEGORY[sym] = cat;
  }
}
function convertTemperature(value, from, to) {
  let celsius;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;
  if (to === "c") return celsius;
  if (to === "f") return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}
function convert(value, from, to) {
  from = from.toLowerCase();
  to = to.toLowerCase();
  const cat = UNIT_TO_CATEGORY[from];
  if (!cat || UNIT_TO_CATEGORY[to] !== cat) return null;
  if (cat === "temperature") {
    return { result: convertTemperature(value, from, to), category: cat };
  }
  const fromUnit = UNITS[cat][from];
  const toUnit = UNITS[cat][to];
  const base = value * fromUnit.factor;
  const result = base / toUnit.factor;
  return { result, category: cat };
}
function formatNumber(n) {
  if (Math.abs(n) < 1e-4 || Math.abs(n) >= 1e12) return n.toExponential(4);
  const str = n.toPrecision(8).replace(/\.?0+$/, "");
  return str;
}
var units_default = {
  command: "units",
  aliases: ["convert", "conv", "unit"],
  category: "utility",
  description: "Convert between 100+ units \u2014 length, weight, speed, data, temperature and more",
  usage: ".units <value> <from> to <to>\nExample: .units 100 km to miles",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const input = args.join(" ").trim().toLowerCase();
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F4CF} *Unit Converter*

*Usage:* \`.units <value> <from> to <to>\`

*Examples:*
\u2022 \`.units 100 km to mi\`
\u2022 \`.units 70 kg to lb\`
\u2022 \`.units 37 c to f\`
\u2022 \`.units 1 gb to mb\`
\u2022 \`.units 60 mph to kph\`
\u2022 \`.units 1 yr to day\`
\u2022 \`.units 1 atm to psi\`
\u2022 \`.units 500 kcal to kj\`

*Categories:*
\u{1F4D0} length \xB7 \u2696\uFE0F weight \xB7 \u{1F321}\uFE0F temperature
\u{1F4A8} speed \xB7 \u{1F4BE} data \xB7 \u{1F4E6} volume
\u{1F5FA}\uFE0F area \xB7 \u23F1\uFE0F time \xB7 \u{1F50B} energy \xB7 \u{1F32C}\uFE0F pressure`,
        ...channelInfo
      }, { quoted: message });
    }
    const toIndex = args.findIndex((a) => a.toLowerCase() === "to");
    let value, fromUnit, toUnit;
    if (toIndex === 2 && args.length === 4) {
      value = parseFloat(args[0]);
      fromUnit = args[1].toLowerCase();
      toUnit = args[3].toLowerCase();
    } else if (args.length === 3 && toIndex === -1) {
      value = parseFloat(args[0]);
      fromUnit = args[1].toLowerCase();
      toUnit = args[2].toLowerCase();
    } else {
      return await sock.sendMessage(chatId, {
        text: `\u274C Wrong format.

Use: \`.units 100 km to mi\``,
        ...channelInfo
      }, { quoted: message });
    }
    if (isNaN(value)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Invalid number: \`${args[0]}\``,
        ...channelInfo
      }, { quoted: message });
    }
    const res = convert(value, fromUnit, toUnit);
    if (!res) {
      const fromCat = UNIT_TO_CATEGORY[fromUnit];
      const toCat = UNIT_TO_CATEGORY[toUnit];
      if (!fromCat) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Unknown unit: \`${fromUnit}\`

Use \`.units\` to see all supported units.`,
          ...channelInfo
        }, { quoted: message });
      }
      if (!toCat) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Unknown unit: \`${toUnit}\``,
          ...channelInfo
        }, { quoted: message });
      }
      return await sock.sendMessage(chatId, {
        text: `\u274C Cannot convert *${fromUnit}* (${fromCat}) to *${toUnit}* (${toCat}) \u2014 different categories.`,
        ...channelInfo
      }, { quoted: message });
    }
    const fromName = UNITS[res.category][fromUnit].name;
    const toName = UNITS[res.category][toUnit].name;
    const catEmojis = {
      length: "\u{1F4D0}",
      weight: "\u2696\uFE0F",
      temperature: "\u{1F321}\uFE0F",
      speed: "\u{1F4A8}",
      data: "\u{1F4BE}",
      area: "\u{1F5FA}\uFE0F",
      volume: "\u{1F4E6}",
      time: "\u23F1\uFE0F",
      pressure: "\u{1F32C}\uFE0F",
      energy: "\u{1F50B}"
    };
    const emoji = catEmojis[res.category] || "\u{1F4CF}";
    await sock.sendMessage(chatId, {
      text: `${emoji} *Unit Converter*

\u{1F4E5} *Input:* ${value} ${fromName} (${fromUnit})
\u{1F4E4} *Result:* ${formatNumber(res.result)} ${toName} (${toUnit})

\u{1F4C2} *Category:* ${res.category.charAt(0).toUpperCase() + res.category.slice(1)}`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  units_default as default
};
