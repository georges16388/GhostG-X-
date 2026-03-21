/**
 * Colorful Neon Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (NEON STYLE) ---
const AGM_NEON = (text) => `╭╼━≪• ᴀɢᴍ ɴᴇᴏɴ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} ⚡
┃ sᴛᴀᴛᴜs : 🟢 ᴠɪʙʀᴀɴᴛ
┃ sᴛʏʟᴇ : ᴄᴏʟᴏʀғᴜʟ ɴᴇᴏɴ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'neon',
  aliases: ['neonlight', 'glow'],
  category: 'textmaker',
  description: 'Créer un effet de texte néon coloré vibrant',
  usage: '.neon <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ɴᴇᴏɴ GHOST-X');
      }
      
      // Réaction d'allumage
      await sock.sendMessage(chatId, { react: { text: '✨', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html', text);
      
      if (!result || !result.image) {
        throw new Error('NEON_GRID_OFFLINE');
      }
      
      // Envoi de l'image avec le cadre AGM Neon
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_NEON(text)
      }, { quoted: msg });

      // Réaction finale (Éclat maximal)
      await sock.sendMessage(chatId, { react: { text: '🌈', key: msg.key } });

    } catch (error) {
      console.error('Error in neon command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅ'ɪʟʟᴜᴍɪɴᴀᴛɪᴏɴ :* ${error.message}`);
    }
  }
};
