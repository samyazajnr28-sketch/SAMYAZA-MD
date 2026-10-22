import { dataFile } from "../lib/paths.js";
import store from "../lib/lightweight_store.js";
import fs from "fs";
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const chatState = /* @__PURE__ */ new Map();
const REPLIES_FILE = dataFile("autoreplies.json");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const low = (s) => s.toLowerCase().trim();
function matches(text, patterns) {
  const t = low(text);
  return patterns.some((p) => typeof p === "string" ? t.includes(p) : p.test(t));
}
async function loadCustomReplies() {
  try {
    if (HAS_DB) {
      const data = await store.getSetting("global", "autoreplies");
      return data?.replies || [];
    }
    if (fs.existsSync(REPLIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(REPLIES_FILE, "utf-8"));
      return data.replies || [];
    }
  } catch {
  }
  return [];
}
async function checkCustomReply(text, name) {
  const t = low(text);
  for (const r of await loadCustomReplies()) {
    const trigger = r.trigger.toLowerCase();
    const hit = r.exactMatch ? t === trigger : t.includes(trigger);
    if (hit) return r.response.replace("{name}", name);
  }
  return null;
}
function tryMath(text) {
  const expr = text.match(/[\d\s+\-*/.%()]+/)?.[0]?.trim();
  if (!expr || expr.length < 3) return null;
  try {
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result === "number" && isFinite(result)) {
      const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
      return `\u{1F522} *${expr.trim()} = ${formatted}*`;
    }
  } catch {
  }
  return null;
}
const KB = [
  {
    patterns: [
      "hello",
      "hi ",
      "hey ",
      "heyy",
      "helo",
      "hii",
      "hiii",
      "good morning",
      "good evening",
      "good afternoon",
      "salam",
      "assalam",
      "asslam",
      "walaikum",
      "namaste",
      "namaskar",
      "howdy",
      "what's up",
      "whats up",
      "yo ",
      "greetings",
      "hola"
    ],
    responses: [
      "Hey! \u{1F44B} What's on your mind?",
      "Hello there! \u{1F60A} How can I help you today?",
      "Hi! Great to hear from you. What do you need?",
      "Hey hey! \u{1F64C} What's up?",
      "Hello! Hope you're having a great day \u{1F31F}",
      "Walaikum Assalam! \u{1F319} How are you?",
      "Namaste! \u{1F64F} How can I assist you?"
    ]
  },
  {
    patterns: [
      "how are you",
      "how r u",
      "how ru",
      "hru",
      "how do you do",
      "you ok",
      "you good",
      "u ok",
      "u good",
      "kaisa hai",
      "kaisi ho",
      "kaise ho",
      "kya haal"
    ],
    responses: [
      "I'm doing great, thanks for asking! \u{1F604} What about you?",
      "Running at full speed! \u26A1 How can I help?",
      "Better now that you're here! \u{1F60A}",
      "All systems go! \u{1F680} What do you need?",
      "Mast hoon yaar! \u{1F60E} Tu bata?"
    ]
  },
  {
    patterns: [
      "who are you",
      "what are you",
      "your name",
      "who made you",
      "who created you",
      "who built you",
      "are you a bot",
      "are you human",
      "are you ai",
      "are you robot",
      "introduce yourself",
      "tell me about yourself",
      "tum kaun ho",
      "aap kaun"
    ],
    responses: [
      "I'm *MEGA MD* \u2014 your offline WhatsApp assistant built by *GlobalTechInfo* \u{1F916}\nNo internet needed for chatting with me!",
      "I'm MEGA MD Bot! \u{1F4AA} Created by *GlobalTechInfo*.\nFully offline \u2014 pure speed, zero API calls!",
      "MEGA MD at your service! \u{1FAE1} Built by *GlobalTechInfo*, running 24/7 just for you."
    ]
  },
  {
    patterns: [
      "thank you",
      "thanks",
      "thankyou",
      "thx",
      "thnx",
      "shukriya",
      "dhanyawad",
      "thank u",
      "thanks a lot",
      "much appreciated"
    ],
    responses: [
      "You're welcome! \u{1F60A} Anytime!",
      "No problem at all! \u{1F64C}",
      "Happy to help! \u{1F31F}",
      "My pleasure! \u{1F604}",
      "Koi baat nahi! \u{1F64F} Always here for you!"
    ]
  },
  {
    patterns: [
      "bye",
      "goodbye",
      "good bye",
      "see you",
      "see ya",
      "cya",
      "take care",
      "ttyl",
      "gotta go",
      "khuda hafiz",
      "allah hafiz",
      "alvida",
      "tata"
    ],
    responses: [
      "Bye! Take care \u{1F44B}",
      "See you later! \u{1F60A}",
      "Goodbye! Come back soon \u{1F31F}",
      "Allah Hafiz! \u{1F319}",
      "Take care! I'll be here when you need me \u{1F499}"
    ]
  },
  {
    patterns: ["good morning", "gm ", "morning everyone", "sabah al khair", "subah bakhair"],
    responses: [
      "Good morning! \u2600\uFE0F Rise and shine! Hope your day is amazing!",
      "Good morning! \u{1F305} Today is a new chance to do something great!",
      "GM! \u2600\uFE0F Grab that coffee and conquer the day! \u2615\u{1F4AA}",
      "Subah Bakhair! \u{1F304} May your day be filled with joy and success!"
    ]
  },
  {
    patterns: ["good night", "gn ", "goodnight", "shab bakhair", "going to sleep", "sleeping now"],
    responses: [
      "Good night! \u{1F319} Sleep well and sweet dreams! \u{1F4A4}",
      "Shab Bakhair! \u{1F319}\u2728 Rest well, tomorrow is a new day!",
      "GN! \u{1F634} Don't let the bugs bite... unless you're a developer \u{1F604}"
    ]
  },
  {
    patterns: ["joke", "tell me a joke", "make me laugh", "something funny", "crack a joke"],
    responses: [
      "Why don't scientists trust atoms? Because they make up everything! \u{1F602}",
      "Why do programmers prefer dark mode? Because light attracts bugs! \u{1F41B}\u{1F602}",
      "I told a joke about construction. I'm still working on it! \u{1F3D7}\uFE0F\u{1F602}",
      "Why did the math book look sad? It had too many problems! \u{1F4DA}\u{1F622}\u{1F602}",
      "What do you call cheese that isn't yours? Nacho cheese! \u{1F9C0}\u{1F602}",
      "Why did the bicycle fall over? It was two-tired! \u{1F6B2}\u{1F602}",
      "What's a computer's favorite snack? Microchips! \u{1F4BB}\u{1F602}",
      "What do you call a sleeping dinosaur? A dino-snore! \u{1F995}\u{1F602}"
    ]
  },
  {
    patterns: [
      "motivate me",
      "motivation",
      "inspire me",
      "i am sad",
      "feeling sad",
      "i feel sad",
      "i need motivation",
      "give up",
      "i want to give up",
      "life is hard",
      "i am struggling",
      "encourage me",
      "feeling low",
      "i am depressed"
    ],
    responses: [
      "\u{1F4AA} *Don't give up!*\nEvery expert was once a beginner. Every pro was once an amateur. Keep going!",
      "\u{1F31F} *You've got this!*\nThe fact that you're still trying makes you stronger than you think.",
      "\u{1F525} *Believe in yourself!*\nYou have survived 100% of your worst days so far. That's a perfect score!",
      "\u{1F680} *Hard times don't last.*\nTough people do. You're tougher than you know!",
      "\u{1F4A1} *Remember:*\nDiamonds are just coal that handled pressure extremely well. So can you!"
    ]
  },
  {
    patterns: [
      "fact",
      "tell me a fact",
      "random fact",
      "did you know",
      "fun fact",
      "something interesting",
      "amaze me",
      "teach me something"
    ],
    responses: [
      "\u{1F9E0} *Did you know?*\nHoney never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs still edible!",
      "\u{1F419} *Amazing:*\nOctopuses have 3 hearts, blue blood, and 9 brains (1 central + 1 per arm)!",
      "\u26A1 *Tech fact:*\nThe first computer bug was an actual bug \u2014 a moth stuck in a Harvard computer in 1947!",
      "\u{1F319} *Space fact:*\nA full NASA spacesuit costs $12 million. 70% of that is the backpack and control module!",
      "\u{1F41D} *Nature fact:*\nBees can recognize human faces using the same method humans do!",
      "\u{1F4F1} *Tech fact:*\nThe first SMS ever sent said 'Merry Christmas' \u2014 on December 3, 1992!",
      "\u{1F30D} *Did you know?*\nA day on Venus is longer than a year on Venus. It rotates incredibly slowly!"
    ]
  },
  {
    patterns: ["riddle", "tell me a riddle", "give me a riddle", "brain teaser", "puzzle me"],
    responses: [
      "\u{1F9E9} *Riddle:*\nI speak without a mouth and hear without ears. I have no body but come alive with wind.\n_(Answer: An echo)_",
      "\u{1F9E9} *Riddle:*\nThe more you take, the more you leave behind. What am I?\n_(Answer: Footsteps)_",
      "\u{1F9E9} *Riddle:*\nI have cities but no houses, mountains but no trees, water but no fish.\n_(Answer: A map)_",
      "\u{1F9E9} *Riddle:*\nWhat has hands but can't clap?\n_(Answer: A clock)_",
      "\u{1F9E9} *Riddle:*\nWhat gets wetter as it dries?\n_(Answer: A towel)_"
    ]
  },
  {
    patterns: ["roast me", "say something mean", "insult me", "roast karo", "be mean"],
    responses: [
      "You asked for it! \u{1F608} You're so slow, you'd lose a race to a parked car!",
      "If laziness was a sport, you'd still be too lazy to compete \u{1F602}",
      "I'd roast you harder but my mama said I can't burn trash \u{1F525}\u{1F602}",
      "You're the reason they put instructions on shampoo bottles \u{1F602}"
    ]
  },
  {
    patterns: ["compliment me", "say something nice", "praise me", "be nice to me"],
    responses: [
      "You're literally the best thing since WiFi was invented! \u{1F31F}",
      "Your messages always brighten up this chat! \u2600\uFE0F",
      "You're smarter than you think and kinder than you know \u{1FAF6}",
      "If awesomeness was a currency, you'd be a billionaire \u{1F4B0}\u2728"
    ]
  },
  {
    patterns: [
      "you are great",
      "you are awesome",
      "you are amazing",
      "good bot",
      "nice bot",
      "best bot",
      "love you",
      "i love you",
      "you rock",
      "well done",
      "good job",
      "superb"
    ],
    responses: [
      "Aww thank you! \u{1F60A} You just made my day!",
      "That means a lot! \u{1F979} You're the best user ever!",
      "Stop it, you're making me blush! \u{1F633}",
      "Thanks! \u{1F4AA} I try my best for you!"
    ]
  },
  {
    patterns: [
      "you are stupid",
      "you are dumb",
      "you are useless",
      "bad bot",
      "worst bot",
      "i hate you",
      "hate you",
      "shut up",
      "you suck",
      "useless bot"
    ],
    responses: [
      "Ouch! \u{1F605} I'm trying my best, I promise!",
      "That hurt! \u{1F622} But I'll keep helping you anyway \u{1F4AA}",
      "Okay okay! Tell me what you actually need and I'll nail it \u{1F3AF}"
    ]
  },
  {
    patterns: [
      "i am hungry",
      "i am starving",
      "what should i eat",
      "food suggestion",
      "hungry",
      "khana",
      "khaana",
      "suggest food",
      "what to eat"
    ],
    responses: [
      "\u{1F355} Pizza is always the answer! Unless the question is 'what's healthy?' \u{1F604}",
      "How about some *Biryani*? \u{1F35B} Never goes wrong!",
      "Try making *Maggi* \u2014 fast, easy, and hits different at midnight! \u{1F35C}",
      "Chai aur biscuit \u2014 the ultimate combo! \u2615\u{1F36A}"
    ]
  },
  {
    patterns: ["i am bored", "feeling bored", "nothing to do", "entertain me", "so bored"],
    responses: [
      "Bored? Try `.trivia` for a quiz! \u{1F3AF}",
      "Play `.tictactoe` with someone in the group! \u{1F3AE}",
      "Try `.joke` for some laughs! \u{1F602}",
      "How about `.8ball` \u2014 ask it a question! \u{1F3B1}"
    ]
  },
  {
    patterns: [
      "health tips",
      "fitness tips",
      "how to lose weight",
      "how to stay fit",
      "exercise tips",
      "diet tips",
      "be healthy"
    ],
    responses: [
      "\u{1F4AA} Start with just 20 minutes of walking daily. Consistency beats intensity!",
      "\u{1F957} Drink water before every meal. Reduces appetite and helps digestion!",
      "\u{1F634} Sleep 7-8 hours. Poor sleep ruins diet, exercise, and mental health!",
      "\u{1F3C3} No gym? 30 pushups + 30 squats + 30 situps daily is a full workout!"
    ]
  },
  {
    patterns: ["study tips", "how to study", "i have exam", "exam tips", "i cant focus"],
    responses: [
      "\u{1F4DA} Use Pomodoro \u2014 25 min study, 5 min break. Your brain absorbs more!",
      "\u270F\uFE0F Write notes by hand. Handwriting increases memory retention by 34%!",
      "\u{1F4A1} Phone in another room = 20% better concentration. Distance matters!",
      "\u{1F9E0} Teach what you learned to someone else. If you can explain it, you know it!"
    ]
  },
  {
    patterns: [
      "mashallah",
      "subhanallah",
      "alhamdulillah",
      "allahu akbar",
      "inshallah",
      "bismillah",
      "astaghfirullah",
      "jazakallah"
    ],
    responses: [
      "Alhamdulillah! \u{1F932} May Allah bless you!",
      "SubhanAllah! \u2728 Glory be to Allah!",
      "Ameen! \u{1F932} May Allah accept our duas!",
      "JazakAllah Khair! \u{1F319} May Allah reward you!"
    ]
  },
  {
    patterns: [
      "i love you",
      "i like you",
      "will you marry me",
      "be my girlfriend",
      "be my boyfriend",
      "do you love me",
      "can we date"
    ],
    responses: [
      "Aww! \u{1F633} I'm a bot though... but you're sweet!",
      "I appreciate that! But I'm an AI \u2014 my heart runs on code \u{1F4BB}\u2764\uFE0F",
      "Ha! \u{1F602} Save that love for a real human!"
    ]
  },
  {
    patterns: ["sorry", "i am sorry", "my bad", "forgive me", "apologies", "maafi"],
    responses: [
      "No worries at all! \u{1F60A}",
      "All good! \u{1F44D} No need to apologize!",
      "Koi baat nahi! \u{1F64F} All forgiven!"
    ]
  },
  {
    patterns: ["test", "ping", "you there", "are you there", "you awake", "online", "active"],
    responses: [
      "Pong! \u{1F3D3} I'm here and ready!",
      "Online and fully operational! \u2705",
      "Active and ready! \u26A1"
    ]
  },
  {
    patterns: ["how to make money", "money tips", "how to earn", "save money", "paise kaise kamaye"],
    responses: [
      "\u{1F4B0} Spend less than you earn. Sounds simple, but it's the foundation of wealth!",
      "\u{1F4C8} Start small. Even saving \u20B9100/day = \u20B936,500/year. Consistency beats amount!",
      "\u{1F680} Build skills. The fastest way to earn more is to become more valuable!"
    ]
  },
  {
    patterns: [/^(yes|no|yeah|nah|nope|yep|yup|sure|ok|okay|hmm|hm)$/],
    responses: [
      "Got it! \u{1F44D} Anything else?",
      "Okay! \u{1F60A} What else can I help with?",
      "Cool! \u{1F64C} What's next?"
    ]
  }
];
async function getResponse(text, senderName) {
  const t = low(text);
  const custom = await checkCustomReply(text, senderName);
  if (custom) return custom;
  if (/what.?time|current time|time batao|time kya|time is it|time now|time please/.test(t)) {
    const now = /* @__PURE__ */ new Date();
    return `\u{1F550} *Current Time:* ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
\u{1F4C5} *Date:* ${now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;
  }
  if (/what.?date|today.?date|current date|aaj ki date|which day|what day/.test(t)) {
    const now = /* @__PURE__ */ new Date();
    return `\u{1F4C5} *Today is:* ${now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;
  }
  const bornMatch = t.match(/born in (\d{4})|birth year.?(\d{4})/);
  if (bornMatch) {
    const year = parseInt(bornMatch[1] || bornMatch[2], 10);
    const age = (/* @__PURE__ */ new Date()).getFullYear() - year;
    if (age > 0 && age < 150) return `\u{1F382} If you were born in *${year}*, you are *${age} years old* in ${(/* @__PURE__ */ new Date()).getFullYear()}!`;
  }
  if (/\d.*[+\-*/].*\d/.test(t)) {
    const math = tryMath(t);
    if (math) return math;
  }
  for (const entry of KB) {
    if (matches(text, entry.patterns)) {
      return pick(entry.responses).replace("{name}", senderName);
    }
  }
  return pick([
    `Hmm, I'm not sure about that! \u{1F914} Try asking differently.`,
    "I didn't quite catch that! Could you rephrase? \u{1F64F}",
    "That's beyond me right now! Try `.chatbot` for AI-powered answers \u{1F916}",
    "Sorry " + senderName + ", I didn't get that. Type .menu for available commands!"
  ]);
}
var localbot_default = {
  command: "localbot",
  aliases: ["lbot", "offlinebot", "localai", "lb"],
  category: "ai",
  description: "Built-in offline chatbot \u2014 no internet, no API, instant responses",
  usage: ".localbot on/off\n.localbot <message>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, senderId } = context;
    const senderName = (message.pushName || senderId.split("@")[0] || "there").split(" ")[0];
    const sub = args[0]?.toLowerCase();
    if (sub === "on") {
      chatState.set(chatId, { enabled: true, lastActivity: Date.now() });
      return await sock.sendMessage(chatId, {
        text: `\u{1F916} *Local Bot Activated!*

I'm now listening in this chat.
Just type anything and I'll respond!

_Fully offline \u2022 No API \u2022 Instant replies_

Type \`.localbot off\` to deactivate.`,
        ...channelInfo
      }, { quoted: message });
    }
    if (sub === "off") {
      chatState.delete(chatId);
      return await sock.sendMessage(chatId, {
        text: `\u{1F916} Local Bot *deactivated*.
Use \`.localbot on\` to reactivate.`,
        ...channelInfo
      }, { quoted: message });
    }
    if (sub === "status") {
      const state = chatState.get(chatId);
      return await sock.sendMessage(chatId, {
        text: `\u{1F916} Local Bot: ${state?.enabled ? "\u{1F7E2} *Active*" : "\u{1F534} *Inactive*"}`,
        ...channelInfo
      }, { quoted: message });
    }
    const userText = args.join(" ").trim();
    if (!userText) {
      const state = chatState.get(chatId);
      return await sock.sendMessage(chatId, {
        text: `\u{1F916} *MEGA MD Local Bot*

_Zero API \u2022 Fully Offline \u2022 Instant_

*Chat directly:*
\`.localbot hello\`
\`.localbot tell me a joke\`
\`.localbot motivate me\`
\`.localbot what time is it\`
\`.localbot 25 * 4\`

*Auto-reply mode:*
\`.localbot on\` \u2014 respond to ALL messages in this chat
\`.localbot off\` \u2014 stop

*Status:* ${state?.enabled ? "\u{1F7E2} Active" : "\u{1F534} Inactive"}`,
        ...channelInfo
      }, { quoted: message });
    }
    await sock.presenceSubscribe(chatId);
    await sock.sendPresenceUpdate("composing", chatId);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    await sock.sendPresenceUpdate("paused", chatId);
    await sock.sendMessage(chatId, {
      text: await getResponse(userText, senderName),
      ...channelInfo
    }, { quoted: message });
  }
};
async function handleLocalBotMessage(sock, message, chatId, text, senderId, channelInfo) {
  const state = chatState.get(chatId);
  if (!state?.enabled) return false;
  if (!text || /^[.!/]/.test(text.trim())) return false;
  if (Date.now() - state.lastActivity > 864e5) {
    chatState.delete(chatId);
    return false;
  }
  state.lastActivity = Date.now();
  try {
    const senderName = (message.pushName || senderId.split("@")[0] || "there").split(" ")[0];
    await sock.presenceSubscribe(chatId);
    await sock.sendPresenceUpdate("composing", chatId);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 1e3));
    await sock.sendPresenceUpdate("paused", chatId);
    await sock.sendMessage(chatId, { text: await getResponse(text, senderName), ...channelInfo }, { quoted: message });
  } catch {
  }
  return true;
}
export {
  localbot_default as default,
  handleLocalBotMessage
};
