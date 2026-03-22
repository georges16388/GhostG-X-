/**
 * TicTacToe Game Logic - Two player game
 * Style & Design by -ɢʜᴏsᴛɢ 𝐗
 */

const TicTacToe = require('../../utils/tictactoe');

// Stockage global des parties
const games = {};

const TTT_DESIGN = (status, board, players) => `╭╼━≪• ɢʜᴏꜱᴛ ᴛɪᴄᴛᴀᴄᴛᴏᴇ •≫━╾╮
┃
┃ ꜱᴛᴀᴛᴜꜱ : ${status}
┃
┃ ${board[0]} | ${board[1]} | ${board[2]}
┃ ──┼───┼──
┃ ${board[3]} | ${board[4]} | ${board[5]}
┃ ──┼───┼──
┃ ${board[6]} | ${board[7]} | ${board[8]}
┃
┃ ❎ : @${players.x.split('@')[0]}
┃ ⭕ : @${players.o.split('@')[0]}
┃
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ 𝐗`;

module.exports = {
  games,
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',
  description: 'Jouer au Morpion avec un ami - Tape .ttt pour créer ou rejoindre une partie',
  usage: '.ttt [nom_salle]',

  async execute(sock, msg, args, extra) {
    const { from, sender, prefix } = extra;
    const text = args.join(' ').trim();

    // Vérifier si le joueur est déjà en jeu
    const existingRoom = Object.values(games).find(
      r => r.state === 'PLAYING' && [r.game.playerX, r.game.playerO].includes(sender)
    );
    if (existingRoom) return extra.reply('⚠️ *Tu es déjà dans une partie !*');

    // Chercher une salle en attente
    let room = Object.values(games).find(
      r => r.state === 'WAITING' && (text ? r.name === text : true)
    );

    if (room) {
      // Rejoindre la partie existante
      room.playerO = sender;
      room.state = 'PLAYING';
      room.game = new TicTacToe(room.playerX, sender);

      const board = room.game.render().map(v => v === 'x' ? '❎' : v === 'o' ? '⭕' : '⬜');
      const status = `ᴀᴜ ᴛᴏᴜʀ ᴅᴇ @${room.game.currentTurn.split('@')[0]} 🎮`;

      await sock.sendMessage(from, {
        text: TTT_DESIGN(status, board, { x: room.playerX, o: room.playerO }),
        mentions: [room.playerX, room.playerO]
      });

    } else {
      // Créer une nouvelle salle
      const id = 'ttt-' + Date.now();
      games[id] = {
        id,
        name: text || 'GhostRoom',
        playerX: sender,
        playerO: '',
        state: 'WAITING',
        timeout: setTimeout(() => {
          if (games[id] && games[id].state === 'WAITING') delete games[id];
        }, 60000)
      };

      await extra.reply(`╭╼━≪• ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ •≫━╾╮
┃ ᴇɴ ᴀᴛᴛᴇɴᴛᴇ ᴅ'ᴜɴ ᴀᴅᴠᴇʀꜱᴀɪʀᴇ...
┃ ᴛᴀᴘᴇ : *${prefix}ttt ${text || 'GhostRoom'}*
╰━━━━━━━━━━━━━━━╯`);
    }
  }
};

// Gestion des coups de TicTacToe
async function handleTicTacToeMove(sock, msg, extra) {
  const sender = extra.sender;
  const from = extra.from;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  // Trouver la partie du joueur
  const room = Object.values(games).find(
    r => r.state === 'PLAYING' && [r.game.playerX, r.game.playerO].includes(sender)
  );
  if (!room) return false;

  const surrender = /^(surrender|give up)$/i.test(text);
  if (!surrender && !/^[1-9]$/.test(text)) return false;

  // Vérification du tour
  if (!surrender && sender !== room.game.currentTurn) {
    await sock.sendMessage(from, { text: '❌ Ce n\'est pas ton tour !' });
    return true;
  }

  const moveOk = surrender ? true : room.game.turn(sender === room.game.playerO, parseInt(text) - 1);
  if (!moveOk) {
    await sock.sendMessage(from, { text: '❌ Coup invalide ! Cette position est déjà prise.' });
    return true;
  }

  // Gestion du gagnant ou égalité
  let winner = surrender ? (sender === room.game.playerX ? room.game.playerO : room.game.playerX) : room.game.winner;
  const tie = !winner && room.game.turns === 9;

  if (surrender) {
    await sock.sendMessage(from, {
      text: `🏳️ @${sender.split('@')[0]} a abandonné ! @${winner.split('@')[0]} remporte la partie !`,
      mentions: [sender, winner]
    });
    delete games[room.id];
    return true;
  }

  const board = room.game.render().map(v => v === 'x' ? '❎' : v === 'o' ? '⭕' : '⬜');
  const status = winner ? `🎉 @${winner.split('@')[0]} gagne !` : tie ? '🤝 Égalité !' : `ᴀᴜ ᴛᴏᴜʀ : @${room.game.currentTurn.split('@')[0]}`;

  const str = TTT_DESIGN(status, board, { x: room.game.playerX, o: room.game.playerO });
  const mentions = [room.game.playerX, room.game.playerO, ...(winner ? [winner] : [])];

  await sock.sendMessage(room.playerX, { text: str, mentions });
  if (room.playerO && room.playerO !== room.playerX) {
    await sock.sendMessage(room.playerO, { text: str, mentions });
  }

  if (winner || tie) delete games[room.id];
  return true;
}

module.exports.handleTicTacToeMove = handleTicTacToeMove;