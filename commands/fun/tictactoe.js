/**
 * TicTacToe Game - AGM Elite Edition
 * Optimized Logic & Prestige Design
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps (Prestige Intégral)
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', 
        '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'à': 'ᴀ', 'ç': 'ᴄ'
    };
    const capsText = text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

const games = {};

// Design Elite pour le plateau de jeu
const TTT_DESIGN = (status, board, players) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ᴛɪᴄᴛᴀᴄᴛᴏᴇ')} •≫━╾╮*
*┃*
*┃* 💡 *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃*
*┃* ${board[0]} | ${board[1]} | ${board[2]}
*┃* ──┼───┼──
*┃* ${board[3]} | ${board[4]} | ${board[5]}
*┃* ──┼───┼──
*┃* ${board[6]} | ${board[7]} | ${board[8]}
*┃*
*┃* ❎ : @${players.x.split('@')[0]}
*┃* ⭕ : @${players.o.split('@')[0]}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x')}***`;

module.exports = {
  games,
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',

  async execute(sock, msg, args, extra) {
    const { from, sender, prefix, reply } = extra;
    const text = args.join(' ').trim();

    const alreadyPlaying = Object.values(games).find(g => [g.playerX, g.playerO].includes(sender));
    if (alreadyPlaying) return reply(`⚠️ ${toBoldSmallCaps("tu es deja dans une partie")}`);

    let room = Object.values(games).find(g => g.state === 'WAITING' && (text ? g.name === text : true));

    if (room) {
      if (room.timeout) clearTimeout(room.timeout);
      room.playerO = sender;
      room.state = 'PLAYING';
      room.currentTurn = room.playerX;
      room.board = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const boardDisplay = ['⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜'];
      const status = `🎮 ${toBoldSmallCaps("au tour de")} @${room.currentTurn.split('@')[0]}`;

      await sock.sendMessage(from, {
        text: TTT_DESIGN(status, boardDisplay, { x: room.playerX, o: room.playerO }),
        mentions: [room.playerX, room.playerO]
      }, { quoted: msg });

    } else {
      const id = `ttt_${Date.now()}`;
      const roomName = text || 'GhostRoom';
      games[id] = {
        id, name: roomName, playerX: sender, playerO: '', state: 'WAITING', board: [1,2,3,4,5,6,7,8,9],
        timeout: setTimeout(() => { 
            if (games[id]) {
                sock.sendMessage(from, { text: `⏳ ${toBoldSmallCaps("salle")} [${toBoldSmallCaps(roomName)}] ${toBoldSmallCaps("fermee (expirée)")}` });
                delete games[id];
            }
        }, 60000)
      };

      await reply(`*╭╼━≪• ${toBoldSmallCaps('ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ')} •≫━╾╮*\n*┃*\n*┃* ⏳ ${toBoldSmallCaps("en attente d'un rival")}\n*┃* 🏷️ *${toBoldSmallCaps("salle")}* : *${toBoldSmallCaps(roomName)}*\n*┃* 💡 *${toBoldSmallCaps("rejoindre")}* : *${prefix}ttt ${toBoldSmallCaps(roomName)}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*`);
    }
  }
};

/**
 * GESTIONNAIRE DE COUPS (Handler)
 */
async function handleTicTacToeMove(sock, msg, extra) {
  const { sender, from, body } = extra;
  const input = body ? body.trim() : '';

  const room = Object.values(games).find(g => g.state === 'PLAYING' && [g.playerX, g.playerO].includes(sender));
  if (!room) return false;

  // Abandon Prestige
  if (/^(abandon|surrender|stop|quitter)$/i.test(input)) {
    const winner = (sender === room.playerX) ? room.playerO : room.playerX;
    const msgAbandon = `${toBoldSmallCaps("a fui")} ! @${winner.split('@')[0]} ${toBoldSmallCaps("gagne par forfait")} 🏆`;
    await sock.sendMessage(from, { 
        text: `🏳️ @${sender.split('@')[0]} ${msgAbandon}`, 
        mentions: [sender, winner] 
    });
    delete games[room.id];
    return true;
  }

  if (!/^[1-9]$/.test(input)) return false; 
  const index = parseInt(input) - 1;

  if (sender !== room.currentTurn) return true;

  if (typeof room.board[index] !== 'number') {
    await sock.sendMessage(from, { text: `❌ ${toBoldSmallCaps("case deja prise")}` }, { quoted: msg });
    return true;
  }

  room.board[index] = (sender === room.playerX) ? 'x' : 'o';

  const winConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let winner = null;
  for (let c of winConditions) {
    if (room.board[c[0]] && room.board[c[0]] === room.board[c[1]] && room.board[c[0]] === room.board[c[2]]) {
      winner = sender;
      break;
    }
  }

  const isTie = !winner && room.board.every(v => typeof v !== 'number');
  room.currentTurn = (room.currentTurn === room.playerX) ? room.playerO : room.playerX;

  const display = room.board.map(v => v === 'x' ? '❎' : v === 'o' ? '⭕' : '⬜');
  let statusStr = winner ? `🏆 ${toBoldSmallCaps("victoire pour")} @${winner.split('@')[0]} !` : 
                  isTie ? `🤝 ${toBoldSmallCaps("match nul !") }` : 
                  `⏳ ${toBoldSmallCaps("au tour de")} @${room.currentTurn.split('@')[0]}`;

  await sock.sendMessage(from, {
    text: TTT_DESIGN(statusStr, display, { x: room.playerX, o: room.playerO }),
    mentions: [room.playerX, room.playerO]
  }, { quoted: msg });

  if (winner || isTie) delete games[room.id];
  return true;
}

module.exports.handleTicTacToeMove = handleTicTacToeMove;
