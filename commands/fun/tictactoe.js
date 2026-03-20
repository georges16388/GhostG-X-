/**
 * TicTacToe Game - Two player game
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const TicTacToe = require('../../utils/tictactoe');

// Store games globally
const games = {};

// Design pour l'interface de jeu
const TTT_DESIGN = (status, board, players) => `╭╼━≪• ɢʜᴏsᴛ ᴛɪᴄᴛᴀᴄᴛᴏᴇ •≫━╾╮
┃ 
┃ sᴛᴀᴛᴜs : ${status}
┃ 
┃ ${board.slice(0, 3).join('')}
┃ ${board.slice(3, 6).join('')}
┃ ${board.slice(6).join('')}
┃ 
┃ ❎ : @${players.x.split('@')[0]}
┃ ⭕ : @${players.o.split('@')[0]}
┃ 
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  games,
  name: 'tictactoe',
  aliases: ['ttt', 'xo', 'morpion'],
  category: 'fun',
  description: 'Play TicTacToe with another player',
  usage: '.ttt [room name]',
  
  async execute(sock, msg, args, extra) {
    try {
      const sender = extra.sender;
      const from = extra.from;
      const text = args.join(' ').trim();
      
      const existingRoom = Object.values(games).find(room => 
        room.id.startsWith('tictactoe') && 
        [room.game.playerX, room.game.playerO].includes(sender)
      );
      
      if (existingRoom && existingRoom.state === 'PLAYING') {
        return await extra.reply('⚠️ *Tu es déjà dans une partie !* Tape *surrender* pour abandonner.');
      }
      
      let room = Object.values(games).find(room => 
        room.state === 'WAITING' && 
        room.id.startsWith('tictactoe') &&
        (text ? room.name === text : !room.name)
      );
      
      if (room) {
        room.o = from;
        room.game.playerO = sender;
        room.state = 'PLAYING';
        
        const board = renderBoard(room.game.render());
        const status = `Au tour de @${room.game.currentTurn.split('@')[0]} 🎮`;
        
        await sock.sendMessage(from, { 
          text: TTT_DESIGN(status, board, { x: room.game.playerX, o: room.game.playerO }),
          mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
        });
        
      } else {
        room = {
          id: 'tictactoe-' + (+new Date),
          x: from,
          o: '',
          game: new TicTacToe(sender, 'o'),
          state: 'WAITING',
          name: text || null
        };
        
        await sock.sendMessage(from, { 
          text: `╭╼━≪• ᴛᴛᴛ ᴡᴀɪᴛɪɴɢ •≫━╾╮\n┃ ᴇɴ ᴀᴛᴛᴇɴᴛᴇ ᴅ'ᴜɴ ᴀᴅᴠᴇʀ
