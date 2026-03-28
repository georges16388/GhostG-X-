/**
 * TicTacToe Game Logic - Mode Duel
 * Style & Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const games = {};

const TTT_DESIGN = (status, board, players) => `╭╼━≪• *ɢʜᴏsᴛ ᴛɪᴄᴛᴀᴄᴛᴏᴇ* •≫━╾╮
┃
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${status}
┃
┃      ${board[0]} | ${board[1]} | ${board[2]}
┃      ──┼───┼──
┃      ${board[3]} | ${board[4]} | ${board[5]}
┃      ──┼───┼──
┃      ${board[6]} | ${board[7]} | ${board[8]}
┃
┃ ❎ : @${players.x.split('@')[0]}
┃ ⭕ : @${players.o.split('@')[0]}
┃
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  games,
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',
  description: 'Jouer au Morpion avec un ami',
  usage: '.ttt [nom_salle]',

  async execute(sock, msg, args, extra) {
    const { from, sender, prefix } = extra;
    const text = args.join(' ').trim();

    const inGame = Object.values(games).find(r => 
      (r.state === 'PLAYING' || r.state === 'WAITING') && (r.playerX === sender || r.playerO === sender)
    );
    
    if (inGame) return extra.reply(`⚠️ ${toSmallCaps("tu es deja dans une partie")}`);

    let room = Object.values(games).find(r => r.state === 'WAITING' && (text ? r.name === text : true));

    if (room) {
      room.playerO = sender;
      room.state = 'PLAYING';
      room.board = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Grille initiale
      room.currentTurn = room.playerX;

      const boardDisplay = room.board.map(v => '⬜');
      const status = `${toSmallCaps("au tour de")} @${room.currentTurn.split('@')[0]} 🎮`;

      await sock.sendMessage(from, {
        text: TTT_DESIGN(status, boardDisplay, { x: room.playerX, o: room.playerO }),
        mentions: [room.playerX, room.playerO]
      }, { quoted: msg });

    } else {
      const id = 'ttt-' + Date.now();
      const roomName = text || 'GhostRoom';
      games[id] = {
        id,
        name: roomName,
        playerX: sender,
        playerO: '',
        state: 'WAITING',
        board: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        timeout: setTimeout(() => { if (games[id]) delete games[id]; }, 60000)
      };

      await extra.reply(`╭╼━≪• *ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ* •≫━╾╮
┃ ${toSmallCaps("en attente d'un adversaire")}...
┃ ${toSmallCaps("salle")} : *${roomName}*
┃ ${toSmallCaps("tape")} : *${prefix}ttt ${roomName}*
╰━━━━━━━━━━━━━━━╯`);
    }
  }
};

// Logique de gestion des coups (à appeler dans ton handler principal)
async function handleTicTacToeMove(sock, msg, extra) {
  const { sender, from } = extra;
  const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();

  const room = Object.values(games).find(r => r.state === 'PLAYING' && [r.playerX, r.playerO].includes(sender));
  if (!room) return false;

  // Commande d'abandon
  if (/^(abandon|surrender|stop)$/i.test(text)) {
    const winner = sender === room.playerX ? room.playerO : room.playerX;
    await sock.sendMessage(from, { 
        text: `🏳️ @${sender.split('@')[0]} ${toSmallCaps("a abandonne")} ! @${winner.split('@')[0]} ${toSmallCaps("remporte la partie")}`, 
        mentions: [sender, winner] 
    });
    delete games[room.id];
    return true;
  }

  // Vérification si c'est un chiffre 1-9
  if (!/^[1-9]$/.test(text)) return false;
  const move = parseInt(text) - 1;

  if (sender !== room.currentTurn) {
    await extra.reply(`❌ ${toSmallCaps("ce n'est pas ton tour")}`);
    return true;
  }

  if (typeof room.board[move] !== 'number') {
    await extra.reply(`❌ ${toSmallCaps("case deja occupee")}`);
    return true;
  }

  // Placer le pion
  room.board[move] = sender === room.playerX ? 'x' : 'o';
  
  // Vérification victoire
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
  ];
  
  let winner = null;
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
      winner = sender;
      break;
    }
  }

  const isTie = !winner && room.board.every(v => typeof v !== 'number');
  room.currentTurn = room.currentTurn === room.playerX ? room.playerO : room.playerX;

  const boardDisplay = room.board.map(v => v === 'x' ? '❎' : v === 'o' ? '⭕' : '⬜');
  let statusText = winner ? `🎉 @${winner.split('@')[0]} ${toSmallCaps("gagne")} !` : isTie ? toSmallCaps("egalite") : `${toSmallCaps("au tour de")} @${room.currentTurn.split('@')[0]}`;

  await sock.sendMessage(from, {
    text: TTT_DESIGN(statusText, boardDisplay, { x: room.playerX, o: room.playerO }),
    mentions: [room.playerX, room.playerO]
  }, { quoted: msg });

  if (winner || isTie) delete games[room.id];
  return true;
}

module.exports.handleTicTacToeMove = handleTicTacToeMove;
