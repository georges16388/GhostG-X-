/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - TicTacToe Game Logic
 * Optimized for Stability & Prestige Design
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const toSmallCaps = (text) => {
    const map = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return text.toString().toLowerCase().split('').map(c => map[c] || c).join('');
};

const games = {};

const TTT_DESIGN = (status, board, players) => `*╭╼━≪• ɢʜᴏsᴛ ᴛɪᴄᴛᴀᴄᴛᴏᴇ •≫━╾╮*
*┃*
*┃* 💡 *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
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
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  games,
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',
  
  async execute(sock, msg, args, extra) {
    const { from, sender, prefix, reply } = extra;
    const text = args.join(' ').trim();

    // Vérifier si le joueur est déjà occupé
    const alreadyPlaying = Object.values(games).find(g => [g.playerX, g.playerO].includes(sender));
    if (alreadyPlaying) return reply(`⚠️ *${toSmallCaps("tu es deja dans une partie")}*`);

    // Chercher une salle en attente
    let room = Object.values(games).find(g => g.state === 'WAITING' && (text ? g.name === text : true));

    if (room) {
      if (room.timeout) clearTimeout(room.timeout); // Stopper l'auto-suppression
      room.playerO = sender;
      room.state = 'PLAYING';
      room.currentTurn = room.playerX;
      room.board = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const boardDisplay = ['⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜','⬜'];
      const status = `🎮 *${toSmallCaps("au tour de")}* @${room.currentTurn.split('@')[0]}`;

      await sock.sendMessage(from, {
        text: TTT_DESIGN(status, boardDisplay, { x: room.playerX, o: room.playerO }),
        mentions: [room.playerX, room.playerO]
      }, { quoted: msg });

    } else {
      // Création d'une nouvelle salle
      const id = `ttt_${Date.now()}`;
      const roomName = text || 'GhostRoom';
      games[id] = {
        id, name: roomName, playerX: sender, playerO: '', state: 'WAITING', board: [1,2,3,4,5,6,7,8,9],
        timeout: setTimeout(() => { 
            if (games[id]) {
                sock.sendMessage(from, { text: `⏳ *${toSmallCaps("salle")}* [${roomName}] *${toSmallCaps("fermee (expirée)")}*` });
                delete games[id];
            }
        }, 60000)
      };

      await reply(`*╭╼━≪• ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ •≫━╾╮*\n*┃*\n*┃* ⏳ *${toSmallCaps("en attente d'un rival")}*\n*┃* 🏷️ *${toSmallCaps("salle")}* : *${roomName}*\n*┃* 💡 *${toSmallCaps("rejoindre")}* : *${prefix}ttt ${roomName}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*`);
    }
  }
};

/**
 * GESTIONNAIRE DE COUPS (À placer dans index.js ou handler.js)
 */
async function handleTicTacToeMove(sock, msg, extra) {
  const { sender, from, body } = extra;
  const input = body ? body.trim() : '';

  const room = Object.values(games).find(g => g.state === 'PLAYING' && [g.playerX, g.playerO].includes(sender));
  if (!room) return false;

  // Abandon
  if (/^(abandon|surrender|stop|quitter)$/i.test(input)) {
    const winner = (sender === room.playerX) ? room.playerO : room.playerX;
    await sock.sendMessage(from, { 
        text: `🏳️ @${sender.split('@')[0]} *${toSmallCaps("a fuit")}* ! @${winner.split('@')[0]} *${toSmallCaps("gagne par forfait")}* 🏆`, 
        mentions: [sender, winner] 
    });
    delete games[room.id];
    return true;
  }

  // Vérifier si l'entrée est un chiffre 1-9 valide
  if (!/^[1-9]$/.test(input)) return false; 
  const index = parseInt(input) - 1;

  if (sender !== room.currentTurn) return true; // Ignorer silencieusement si ce n'est pas son tour

  if (typeof room.board[index] !== 'number') {
    await sock.sendMessage(from, { text: `❌ *${toSmallCaps("case deja prise")}*` }, { quoted: msg });
    return true;
  }

  // Jouer le pion
  room.board[index] = (sender === room.playerX) ? 'x' : 'o';

  // Logique Victoire / Égalité
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
  let statusStr = winner ? `🏆 *${toSmallCaps("victoire pour")}* @${winner.split('@')[0]} !` : 
                  isTie ? `🤝 *${toSmallCaps("match nul !") }*` : 
                  `⏳ *${toSmallCaps("au tour de")}* @${room.currentTurn.split('@')[0]}`;

  await sock.sendMessage(from, {
    text: TTT_DESIGN(statusStr, display, { x: room.playerX, o: room.playerO }),
    mentions: [room.playerX, room.playerO]
  }, { quoted: msg });

  if (winner || isTie) delete games[room.id];
  return true;
}

module.exports.handleTicTacToeMove = handleTicTacToeMove;
