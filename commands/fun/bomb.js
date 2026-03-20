/**
 * Bomb Game - Interactive number guessing game
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const gameState = new Map();

// Design pour les différents états du jeu
const BOMB_DESIGN = (content, status = 'ᴘʟᴀʏɪɴɢ 🎮') => `╭╼━≪• ɢʜᴏsᴛ ʙᴏᴍʙ ɢᴀᴍᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status}
┃ 
┃ ${content.split('\n').join('\n┃ ')}
┃ 
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  gameState,
  name: 'bomb',
  aliases: ['bom'],
  category: 'fun',
  description: 'Play bomb game - pick numbers 1-9, avoid the bomb!',
  usage: '.bomb',
  
  async execute(sock, msg, args, extra) {
    try {
      const sender = extra.sender;
      const timeout = 180000; // 3 minutes
      
      if (gameState.has(sender)) {
        const game = gameState.get(sender);
        const text = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || '';
        
        // Abandon
        if (text.toLowerCase().trim() === 'suren' || text.toLowerCase().trim() === 'surrender') {
          const bombBox = game.array.find(v => v.emot === '💥');
          const surenMsg = `ʏᴏᴜ sᴜʀʀᴇɴᴅᴇʀᴇᴅ! 🏳️\n\nᴛʜᴇ ʙᴏᴍʙ ᴡᴀs ɪɴ ʙᴏx: ${bombBox.number}`;
          await extra.reply(BOMB_DESIGN(surenMsg, 'ɢᴀᴠᴇ ᴜᴘ 🏳️'), { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        const number = parseInt(text.trim());
        if (isNaN(number) || number < 1 || number > 9) return;
        
        const selectedBox = game.array.find(v => v.position === number);
        if (!selectedBox || selectedBox.state) return;
        
        selectedBox.state = true;
        
        // Défaite : Bombe touchée
        if (selectedBox.emot === '💥') {
          let grid = '';
          for (let i = 0; i < game.array.length; i += 3) {
            grid += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          const loseMsg = `💥 *BOOM! EXPLOSION!*\n\n${grid}\nɢᴀᴍᴇ ᴏᴠᴇʀ! ʏᴏᴜ ʟᴏsᴛ.`;
          await sock.sendMessage(extra.from, { text: BOMB_DESIGN(loseMsg, 'ᴅᴇғᴇᴀᴛ 💀') }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        // Victoire
        const safeBoxes = game.array.filter(v => v.emot === '✅');
        const openedSafeBoxes = safeBoxes.filter(v => v.state);
        
        if (openedSafeBoxes.length === safeBoxes.length) {
          let grid = '';
          for (let i = 0; i < game.array.length; i += 3) {
            grid += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          const winMsg = `🎉 *CONGRATULATIONS!*\n\n${grid}\nʏᴏᴜ sᴜᴄᴄᴇssғᴜʟʟʏ ᴀᴠᴏɪᴅᴇᴅ ᴛʜᴇ ʙᴏᴍʙ!`;
          await sock.sendMessage(extra.from, { text: BOMB_DESIGN(winMsg, 'ᴠɪᴄᴛᴏʀʏ 🏆') }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        // Mise à jour du plateau
        let grid = '';
        for (let i = 0; i < game.array.length; i += 3) {
          grid += game.array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
        }
        const updateMsg = `ᴄʜᴏᴏsᴇ ᴀ ɴᴜᴍʙᴇʀ [1-9]:\n\n${grid}\nᴛʏᴘᴇ *suren* ᴛᴏ sᴛᴏᴘ.`;
        await sock.sendMessage(extra.from, { text: BOMB_DESIGN(updateMsg) }, { quoted: game.msg });
        return;
      }
      
      // Nouvelle partie
      const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
      const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
      const array = bom.map((v, i) => ({
        emot: v,
        number: numbers[i],
        position: i + 1,
        state: false
      }));
      
      let grid = '';
      for (let i = 0; i < array.length; i += 3) {
        grid += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
      }
      const startMsg = `ᴀᴠᴏɪᴅ ᴛʜᴇ ʜɪᴅᴅᴇɴ ʙᴏᴍʙ!\n\n${grid}\nᴛɪᴍᴇᴏᴜᴛ: 3 ᴍɪɴᴜᴛᴇs`;
      
      const gameMsg = await sock.sendMessage(extra.from, {
        text: BOMB_DESIGN(startMsg),
        contextInfo: {
          externalAdReply: {
            title: "GHOST BOMB GAME",
            body: 'Can you survive?',
            thumbnailUrl: "https://telegra.ph/file/b3138928493e78b55526f.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });
      
      const timeoutId = setTimeout(() => {
        if (gameState.has(sender)) {
          const game = gameState.get(sender);
          const bombBox = game.array.find(v => v.emot === '💥');
          sock.sendMessage(extra.from, {
            text: BOMB_DESIGN(`*TIME'S UP!* ⏰\n\nᴛʜᴇ ʙᴏᴍʙ ᴡᴀs ɪɴ: ${bombBox.number}`, 'ᴛɪᴍᴇᴏᴜᴛ ⌛')
          }, { quoted: game.msg });
          gameState.delete(sender);
        }
      }, timeout);
      
      gameState.set(sender, { msg: gameMsg, array, timeoutId });
      
    } catch (error) {
      console.error('Bomb error:', error);
      return extra.reply('❌ Error: ' + error.message);
    }
  },
};
