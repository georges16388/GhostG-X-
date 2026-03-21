/**
 * Hacker Avatar Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (HACKER STYLE) ---
const AGM_HACKER = (text) => `╭╼━≪• ᴀɢᴍ ʜᴀᴄᴋᴇʀ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ɪᴅ : ${text} 👤
┃ sᴛᴀᴛᴜs : 🟢 ᴇɴᴄʀʏᴘᴛᴇᴅ
┃ ᴇғғᴇᴄᴛ : ᴄʏᴀɴ ɴᴇᴏɴ ʜᴀᴄᴋ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'hacker',
  aliases: ['anonymous', 'hackerlogo'],
  category: 'textmaker',
  description: 'Créer un avatar hacker néon style Anonymous',
  usage: '.hacker <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴀᴄᴄᴇ̀s ʀᴇғᴜsé. ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴘsᴇᴜᴅᴏ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ʜᴀᴄᴋᴇʀ GHOST-X');
      }
      
      // Réaction d'intrusion
      await sock.sendMessage(chatId, { react: { text: '🕵️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html', text);
      
      if (!result || !result.image) {
        throw new Error('SERVER_NOT_RESPONDING');
      }
      
      // Envoi de l'image avec le cadre AGM Hacker
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_HACKER(text)
      }, { quoted: msg });

      // Réaction finale (Hack réussi)
      await sock.sendMessage(chatId, { react: { text: '🎭', key: msg.key } });

    } catch (error) {
      console.error('Error in hacker command:', error);
      await extra.reply(`❌ *ʙʀᴇᴀᴄʜ ᴇʀʀᴏʀ :* ${error.message}`);
    }
  }
};
