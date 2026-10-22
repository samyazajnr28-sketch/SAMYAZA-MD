import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
const execAsync = promisify(exec);
var sudoku_default = {
  command: "sudoku",
  aliases: ["sudokugen", "sudokusolve", "sdk"],
  category: "utility",
  description: "Generate Sudoku puzzles or solve them",
  usage: ".sudoku generate [easy|medium|hard]\n.sudoku solve <81 digits, 0 for empty>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const scriptPath = path.join(process.cwd(), "lib", "sudoku.py");
    if (!args.length || args[0] === "help") {
      return await sock.sendMessage(chatId, {
        text: `\u{1F9E9} *Sudoku*

*Generate a puzzle:*
\`.sudoku generate easy\`
\`.sudoku generate medium\`
\`.sudoku generate hard\`

*Solve a puzzle:*
\`.sudoku solve 530070000600195000098000060800060003400803001700020006060000280000419005000080079\`

\u2139\uFE0F For solve: send 81 digits, use 0 for empty cells`,
        ...channelInfo
      }, { quoted: message });
    }
    const subCmd = args[0].toLowerCase();
    if (subCmd === "generate") {
      const difficulty = (args[1] || "medium").toLowerCase();
      if (!["easy", "medium", "hard"].includes(difficulty)) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Invalid difficulty. Use: \`easy\`, \`medium\`, or \`hard\``,
          ...channelInfo
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        text: `\u{1F9E9} Generating ${difficulty} puzzle...`,
        ...channelInfo
      }, { quoted: message });
      try {
        const { stdout } = await execAsync(
          `python3 "${scriptPath}" generate ${difficulty}`,
          { timeout: 3e4 }
        );
        const data = JSON.parse(stdout.trim());
        if (data.error) {
          return await sock.sendMessage(chatId, {
            text: `\u274C ${data.error}`,
            ...channelInfo
          }, { quoted: message });
        }
        const diffEmoji = { easy: "\u{1F7E2}", medium: "\u{1F7E1}", hard: "\u{1F534}" };
        await sock.sendMessage(chatId, {
          text: `\u{1F9E9} *Sudoku \u2014 ${diffEmoji[difficulty]} ${difficulty.toUpperCase()}*
\u{1F4CA} *Clues:* ${data.clues}/81

*Puzzle:*
\`\`\`
${data.formatted_puzzle}
\`\`\`

*Puzzle code (to solve later):*
\`${data.puzzle}\`

_Use \`.sudoku solve ${data.puzzle}\` to reveal solution_`,
          ...channelInfo
        }, { quoted: message });
      } catch (error) {
        await sock.sendMessage(chatId, {
          text: `\u274C Failed to generate: ${error.message}`,
          ...channelInfo
        }, { quoted: message });
      }
    } else if (subCmd === "solve") {
      const grid = args[1]?.trim();
      if (!grid) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Provide a puzzle code (81 digits, 0 = empty)

Example:
\`.sudoku solve 530070000600195000...\``,
          ...channelInfo
        }, { quoted: message });
      }
      if (!/^[0-9]{81}$/.test(grid)) {
        return await sock.sendMessage(chatId, {
          text: `\u274C Puzzle must be exactly 81 digits (0-9). Got ${grid.length} characters.`,
          ...channelInfo
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        text: `\u{1F50D} Solving puzzle...`,
        ...channelInfo
      }, { quoted: message });
      try {
        const { stdout } = await execAsync(
          `python3 "${scriptPath}" solve ${grid}`,
          { timeout: 3e4 }
        );
        const data = JSON.parse(stdout.trim());
        if (data.error) {
          return await sock.sendMessage(chatId, {
            text: `\u274C ${data.error}`,
            ...channelInfo
          }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
          text: `\u{1F9E9} *Sudoku Solved!*
\u2705 *Filled:* ${data.filled} empty cells

*Puzzle:*
\`\`\`
${data.formatted_puzzle}
\`\`\`

*Solution:*
\`\`\`
${data.formatted_solution}
\`\`\``,
          ...channelInfo
        }, { quoted: message });
      } catch (error) {
        await sock.sendMessage(chatId, {
          text: `\u274C Failed to solve: ${error.message}`,
          ...channelInfo
        }, { quoted: message });
      }
    } else {
      await sock.sendMessage(chatId, {
        text: `\u274C Unknown subcommand: *${subCmd}*
Use \`generate\` or \`solve\``,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  sudoku_default as default
};
