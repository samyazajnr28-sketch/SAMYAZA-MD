import TicTacToe from "../lib/tictactoe.js";
const games = {};
async function handleTicTacToeMove(sock, chatId, senderId, text) {
  try {
    const room = Object.values(games).find(
      (room2) => room2.id.startsWith("tictactoe") && [room2.game.playerX, room2.game.playerO].includes(senderId) && room2.state === "PLAYING"
    );
    if (!room) return;
    const isSurrender = /^(surrender|give up)$/i.test(text);
    if (!isSurrender && !/^[1-9]$/.test(text)) return;
    if (senderId !== room.game.currentTurn && !isSurrender) {
      await sock.sendMessage(chatId, {
        text: "\u274C Not your turn!"
      });
      return;
    }
    const ok = isSurrender ? true : room.game.turn(
      senderId === room.game.playerO,
      parseInt(text, 10) - 1
    );
    if (!ok) {
      await sock.sendMessage(chatId, {
        text: "\u274C Invalid move! That position is already taken."
      });
      return;
    }
    let winner = room.game.winner;
    const isTie = room.game.turns === 9;
    const arr = room.game.render().map((v) => ({
      "X": "\u274E",
      "O": "\u2B55",
      "1": "1\uFE0F\u20E3",
      "2": "2\uFE0F\u20E3",
      "3": "3\uFE0F\u20E3",
      "4": "4\uFE0F\u20E3",
      "5": "5\uFE0F\u20E3",
      "6": "6\uFE0F\u20E3",
      "7": "7\uFE0F\u20E3",
      "8": "8\uFE0F\u20E3",
      "9": "9\uFE0F\u20E3"
    })[v] || v);
    if (isSurrender) {
      winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
      await sock.sendMessage(chatId, {
        text: `\u{1F3F3}\uFE0F @${senderId.split("@")[0]} has surrendered! @${winner.split("@")[0]} wins the game!`,
        mentions: [senderId, winner]
      });
      delete games[room.id];
      return;
    }
    let gameStatus;
    if (winner) {
      gameStatus = `\u{1F389} @${winner.split("@")[0]} wins the game!`;
    } else if (isTie) {
      gameStatus = `\u{1F91D} Game ended in a draw!`;
    } else {
      gameStatus = `\u{1F3B2} Turn: @${room.game.currentTurn.split("@")[0]} (${senderId === room.game.playerX ? "\u274E" : "\u2B55"})`;
    }
    const str = `
\u{1F3AE} *TicTacToe Game*

${gameStatus}

${arr.slice(0, 3).join("")}
${arr.slice(3, 6).join("")}
${arr.slice(6).join("")}

\u25A2 Player \u274E: @${room.game.playerX.split("@")[0]}
\u25A2 Player \u2B55: @${room.game.playerO.split("@")[0]}

${!winner && !isTie ? "\u2022 Type a number (1-9) to make your move\n\u2022 Type *surrender* to give up" : ""}
`;
    const mentions = [
      room.game.playerX,
      room.game.playerO,
      ...winner ? [winner] : [room.game.currentTurn]
    ];
    await sock.sendMessage(room.x, {
      text: str,
      mentions
    });
    if (room.x !== room.o) {
      await sock.sendMessage(room.o, {
        text: str,
        mentions
      });
    }
    if (winner || isTie) {
      delete games[room.id];
    }
  } catch (error) {
    console.error("Error in tictactoe move:", error);
  }
}
var tictactoe_default = {
  command: "tictactoe",
  aliases: ["ttt", "xo"],
  category: "games",
  description: "Play TicTacToe game with another user",
  usage: ".tictactoe [room name]",
  groupOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.participant || message.key.remoteJid;
    const text = args.join(" ").trim();
    try {
      if (Object.values(games).find(
        (room2) => room2.id.startsWith("tictactoe") && [room2.game.playerX, room2.game.playerO].includes(senderId)
      )) {
        await sock.sendMessage(chatId, {
          text: "*You are already in a game*\n\nType *surrender* to quit the current game first."
        }, { quoted: message });
        return;
      }
      let room = Object.values(games).find(
        (room2) => room2.state === "WAITING" && (text ? room2.name === text : true)
      );
      if (room) {
        room.o = chatId;
        room.game.playerO = senderId;
        room.state = "PLAYING";
        const arr = room.game.render().map((v) => ({
          "X": "\u274E",
          "O": "\u2B55",
          "1": "1\uFE0F\u20E3",
          "2": "2\uFE0F\u20E3",
          "3": "3\uFE0F\u20E3",
          "4": "4\uFE0F\u20E3",
          "5": "5\uFE0F\u20E3",
          "6": "6\uFE0F\u20E3",
          "7": "7\uFE0F\u20E3",
          "8": "8\uFE0F\u20E3",
          "9": "9\uFE0F\u20E3"
        })[v] || v);
        const str = `
\u{1F3AE} *TicTacToe Game Started!*

Waiting for @${room.game.currentTurn.split("@")[0]} to play...

${arr.slice(0, 3).join("")}
${arr.slice(3, 6).join("")}
${arr.slice(6).join("")}

\u25A2 *Room ID:* ${room.id}
\u25A2 *Rules:*
\u2022 Make 3 rows of symbols vertically, horizontally or diagonally to win
\u2022 Type a number (1-9) to place your symbol
\u2022 Type *surrender* to give up
`;
        await sock.sendMessage(chatId, {
          text: str,
          mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
        }, { quoted: message });
      } else {
        room = {
          id: "tictactoe-" + +/* @__PURE__ */ new Date(),
          x: chatId,
          o: "",
          game: new TicTacToe(senderId, "o"),
          state: "WAITING"
        };
        if (text) room.name = text;
        await sock.sendMessage(chatId, {
          text: `*Waiting for opponent*

Type \`.tictactoe ${text || ""}\` to join this game!

Player \u274E: @${senderId.split("@")[0]}`,
          mentions: [senderId]
        }, { quoted: message });
        games[room.id] = room;
      }
    } catch (error) {
      console.error("Error in tictactoe command:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C *Error starting game*\n\nPlease try again later."
      }, { quoted: message });
    }
  },
  handleTicTacToeMove,
  games
};
export {
  tictactoe_default as default,
  handleTicTacToeMove
};
