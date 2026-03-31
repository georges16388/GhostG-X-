/**
 * Bomb Game - Interactive number guessing game (GhostG-X Edition)
 */

const gameState = new Map();

module.exports = {
  gameState,
  name: 'ᴘɪᴇɢᴇ',
  aliases: ['bom', 'bombe', 'chaos', 'bomb', 'piege', 'piège'],
  category: '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'ᴅᴇ́ғɪᴇ ʟᴇ ᴅᴇsᴛɪɴ : ᴄʜᴏɪsɪs ʟᴇs ʙᴏɴs sᴄᴇᴀᴜx ᴇᴛ ᴇ́ᴠɪᴛᴇ ʟᴀ ʙᴏᴍʙᴇ !',
  usage: '.ᴘɪᴇɢᴇ',
  
  async execute(sock, msg, args, extra) {
    try {
      const sender = extra.sender;
      const timeout = 180000; // 3 minutes
      
      // Vérification d'une session active
      if (gameState.has(sender)) {
        const game = gameState.get(sender);
        const text = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     '';
        
        // Option d'abandon
        if (['suren', 'abandon', 'surrender'].includes(text.toLowerCase().trim())) {
          const bombBox = game.array.find(v => v.emot === '💥');
          await extra.reply(
            `*〆 ᴛᴜ ᴀs ᴀʙᴀɴᴅᴏɴɴᴇ́ ʟᴇ ᴅᴇ́ғɪ !* 💣\n\n` +
            `*ʟᴀ ʙᴏᴍʙᴇ ᴇ́ᴛᴀɪᴛ ᴅɪssɪᴍᴜʟᴇ́ᴇ ᴅᴀɴs ʟᴇ sᴄᴇᴀᴜ ɴᴜᴍᴇ́ʀᴏ ${bombBox.number}.*\n\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`, { quoted: game.msg }
          );
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        const number = parseInt(text.trim());
        if (isNaN(number) || number < 1 || number > 9) return;
        
        const selectedBox = game.array.find(v => v.position === number);
        if (!selectedBox || selectedBox.state) return;
        
        selectedBox.state = true;
        
        // CAS : EXPLOSION
        if (selectedBox.emot === '💥') {
          let teks = `*💥 ʟᴀ ʙᴏᴍʙᴇ ᴀ ᴇxᴘʟᴏsᴇ́ !*\n\n` +
                     `*ᴛᴜ ᴀs ʙʀɪsᴇ́ ʟᴇ sᴄᴇᴀᴜ ${selectedBox.number} ᴇᴛ...*\n\n` +
                     `*💣 ʙᴏᴏᴏᴏᴏᴍ ! 💣*\n\n` +
                     `*ᴇ́ᴄʜᴇᴄ ᴅᴜ ᴅᴇ́ғɪ. ᴛᴇs ᴘᴏɪɴᴛs sᴏɴᴛ ᴅɪssɪᴘᴇ́s.*\n\n` +
                     `*ʀᴇ́ᴠᴇ́ʟᴀᴛɪᴏɴ ғɪɴᴀʟᴇ :*\n`;
          
          for (let i = 0; i < game.array.length; i += 3) {
            teks += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          teks += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
          
          await sock.sendMessage(extra.from, { text: teks }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        // CAS : VICTOIRE
        const safeBoxes = game.array.filter(v => v.emot === '✅');
        const openedSafeBoxes = safeBoxes.filter(v => v.state);
        
        if (openedSafeBoxes.length === safeBoxes.length) {
          let teks = `*🎉 ᴠɪᴄᴛᴏɪʀᴇ ᴇ́ᴄʟᴀᴛᴀɴᴛᴇ !*\n\n` +
                     `*ɪɴᴄʀᴏʏᴀʙʟᴇ ! ᴛᴜ ᴀs ᴅᴇ́ᴊᴏᴜᴇ́ ʟᴇ ᴘɪᴇ̀ɢᴇ ᴇᴛ ᴏᴜᴠᴇʀᴛ ᴛᴏᴜs ʟᴇs sᴄᴇᴀᴜx sᴀɪɴs.*\n\n` +
                     `*ᴛᴀʙʟᴇᴀᴜ ᴅᴇ ɢᴜᴇʀʀᴇ :*\n`;
          
          for (let i = 0; i < game.array.length; i += 3) {
            teks += game.array.slice(i, i + 3).map(v => v.emot).join('') + '\n';
          }
          teks += `\n*✅ ᴛᴇs ᴘᴏɪɴᴛs ᴏɴᴛ ᴇ́ᴛᴇ́ ᴀᴜɢᴍᴇɴᴛᴇ́s.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
          
          await sock.sendMessage(extra.from, { text: teks }, { quoted: game.msg });
          clearTimeout(game.timeoutId);
          gameState.delete(sender);
          return;
        }
        
        // MISE À JOUR DU PLATEAU
        let teks = `*╭╼━━━≪• ʟᴇ ᴅᴇ́ғɪ ᴅᴇ ʟᴀ ʙᴏᴍʙᴇ •≫━━━╾╮*\n` +
                   `*┃ sᴄᴇᴀᴜ ${selectedBox.number} ᴏᴜᴠᴇʀᴛ : ${selectedBox.emot}*\n` +
                   `*┃ ᴇɴᴠᴏɪᴇ ᴜɴ ᴄʜɪғғʀᴇ (1-9) :*\n` +
                   `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
        
        for (let i = 0; i < game.array.length; i += 3) {
          teks += game.array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
        }
        teks += `\n*⏳ sᴀɴ sablier : [ 3 ᴍɪɴᴜᴛᴇs ]*\n` +
                `*ᴛᴀᴘᴇ sᴜʀᴇɴ ᴘᴏᴜʀ ᴀʙᴀɴᴅᴏɴɴᴇʀ.*\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await sock.sendMessage(extra.from, { text: teks }, { quoted: game.msg });
        return;
      }
      
      // INITIALISATION DU NOUVEAU JEU
      const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
      const number = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
      const array = bom.map((v, i) => ({
        emot: v,
        number: number[i],
        position: i + 1,
        state: false
      }));
      
      let teks = `*╭╼━━━≪• ʟᴇ ᴅᴇ́ғɪ ᴅᴇ ʟᴀ ʙᴏᴍʙᴇ •≫━━━╾╮*\n` +
                 `*┃ ᴇɴᴠᴏɪᴇ ᴜɴ ᴄʜɪғғʀᴇ ᴇɴᴛʀᴇ 1 ᴇᴛ 9 ᴘᴏᴜʀ*\n` +
                 `*┃ ᴛᴇɴᴛᴇʀ ᴅ'ᴏᴜᴠʀɪʀ ʟᴇs sᴄᴇᴀᴜx sᴀɪɴs.*\n` +
                 `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
      
      for (let i = 0; i < array.length; i += 3) {
        teks += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
      }
      teks += `\n*⏳ ᴛᴇᴍᴘs ᴅɪsᴘᴏɴɪʙʟᴇ : [ 3 ᴍɪɴᴜᴛᴇs ]*\n` +
              `*ᴇ́ᴠɪᴛᴇ ʟᴀ ʙᴏᴍʙᴇ ᴏᴜ ᴛᴇs ᴘᴏɪɴᴛs sᴇʀᴏɴᴛ ʀᴇ́ᴅᴜɪᴛs.*\n\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
      
      const gameMsg = await sock.sendMessage(extra.from, {
        text: teks,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛɢ-x : ᴄʜᴀᴏs ɢᴀᴍᴇ",
            body: 'ᴇ́ᴠɪᴛᴇ ʟᴀ ʙᴏᴍʙᴇ ᴘᴏᴜʀ sᴜʀᴠɪᴠʀᴇ !',
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
            text: `*⏳ ʟᴇ sᴀʙʟɪᴇʀ ᴇsᴛ ᴠɪᴅᴇ !*\n\n*ʟᴀ ʙᴏᴍʙᴇ s'ᴇsᴛ ᴀᴄᴛɪᴠᴇ́ᴇ ᴅᴀɴs ʟᴇ sᴄᴇᴀᴜ ${bombBox.number}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
          }, { quoted: game.msg });
          gameState.delete(sender);
        }
      }, timeout);
      
      gameState.set(sender, { msg: gameMsg, array, timeoutId });
      
    } catch (error) {
      console.error('Bomb Game Error:', error);
      return extra.reply(`*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ s'ᴇsᴛ ᴘʀᴏᴅᴜɪᴛᴇ ᴅᴀɴs ʟᴇ ᴄʜᴀᴏs : ${error.message}*`);
    }
  },
};
