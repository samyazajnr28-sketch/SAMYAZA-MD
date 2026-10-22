const words = ["javascript", "bot", "hangman", "whatsapp", "nodejs", "python", "programming", "developer", "computer", "algorithm"];
const hangmanGames = {};
function guessLetter(sock, chatId, letter) {
  if (!hangmanGames[chatId]) {
    sock.sendMessage(chatId, { text: "\u274C *No game in progress*\n\nStart a new game with `.hangman`" });
    return;
  }
  const game = hangmanGames[chatId];
  const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;
  if (guessedLetters.includes(letter)) {
    sock.sendMessage(chatId, { text: `\u26A0\uFE0F *You already guessed "${letter}"*

Try another letter.` });
    return;
  }
  guessedLetters.push(letter);
  if (word.includes(letter)) {
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        maskedWord[i] = letter;
      }
    }
    sock.sendMessage(chatId, { text: `\u2705 *Good guess!*

${maskedWord.join(" ")}` });
    if (!maskedWord.includes("_")) {
      sock.sendMessage(chatId, { text: `\u{1F389} *Congratulations!*

You guessed the word: *${word}*` });
      delete hangmanGames[chatId];
    }
  } else {
    game.wrongGuesses += 1;
    sock.sendMessage(chatId, { text: `\u274C *Wrong guess!*

You have *${maxWrongGuesses - game.wrongGuesses}* tries left.

${maskedWord.join(" ")}` });
    if (game.wrongGuesses >= maxWrongGuesses) {
      sock.sendMessage(chatId, { text: `\u{1F480} *Game over!*

The word was: *${word}*` });
      delete hangmanGames[chatId];
    }
  }
}
var hangman_default = {
  command: "hangman",
  aliases: ["hang", "hm"],
  category: "games",
  description: "Play hangman word guessing game",
  usage: ".hangman to start, then .guess <letter>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = "_ ".repeat(word.length).trim();
    hangmanGames[chatId] = {
      word,
      maskedWord: maskedWord.split(" "),
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses: 6
    };
    await sock.sendMessage(chatId, {
      text: `\u{1F3AE} *HANGMAN GAME STARTED!*

The word is: ${maskedWord}

*How to play:*
\u2022 Use \`.guess <letter>\` to guess
\u2022 You have 6 wrong guesses allowed
\u2022 Guess the word before running out of tries!

Good luck! \u{1F340}`
    }, { quoted: message });
  },
  guessLetter
};
export {
  hangman_default as default
};
