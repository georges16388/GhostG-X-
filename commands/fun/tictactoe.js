/**
 * TicTacToe Game - Two player game
 * Full Logic by -ɢʜᴏsᴛɢ 𝐗
 */

const TicTacToe = require('../../utils/tictactoe');

// Stockage temporaire des parties
if (!global.games) global.games = {};

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
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`;

module.exports = {
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',
  description: 'Jouer au Morpion avec un ami.',
  usage: '.ttt [nom_salle]',

  async execute(sock, msg, args, extra) {
    const { from, sender, prefix } = extra;
    const text = args.join(' ').trim();

    // Vérifier si le joueur est déjà dans une partie
    if (Object.values(global.games).find(r => r.state === 'PLAYING' && [r.playerX, r.playerO].includes(sender))) {
      return extra.reply("⚠️ *Tu es déjà en train de jouer !*");
    }

    // Chercher une salle en attente
    let room = Object.values(global.games).find(r => r.state === 'WAITING' && (text ? r.name === text : true));

    if (room) {
      // Rejoindre la partie
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
      global.games[id] = {
        id,
        name: text || 'GhostRoom',
        playerX: sender,
        playerO: '',
        state: 'WAITING',
        timeout: setTimeout(() => {
          if (global.games[id] && global.games[id].state === 'WAITING') {
            delete global.games[id];
          }
        }, 60000) // Expire après 1 min
      };

      await extra.reply(`╭╼━≪• ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ •≫━╾╮\n┃ ᴇɴ ᴀᴛᴛᴇɴᴛᴇ ᴅ'ᴜɴ ᴀᴅᴠᴇʀꜱᴀɪʀᴇ...\n┃ ᴛᴀᴘᴇ : *${prefix}ttt ${text || 'GhostRoom'}*\n╰━━━━━━━━━━━━━━━╯`);
    }
  }
};
