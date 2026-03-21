/**
 * Digital Glitch Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (GLITCH STYLE) ---
const AGM_GLITCH = (text) => `╭╼━≪• ᴀɢᴍ ɢʟɪᴛᴄʜ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 👾
┃ sᴛᴀᴛᴜs : 🟢 ᴅɪsᴛᴏʀᴛᴇᴅ
┃ sʏsᴛᴇᴍ : ᴄʏʙᴇʀ-ᴇғғᴇᴄᴛ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'glitch',
  aliases: ['glitchtext', 'distort'],
  category: 'textmaker',
  description: 'Créer un effet de texte glitch numérique',
  usage: '.glitch <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ɢʟɪᴛᴄʜ GHOSTG-X');
      }
      
      // Réaction de chargement système
      await sock.sendMessage(chatId, { react: { text: '💻', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html', text);
      
      if (!result || !result.image) {
        throw new Error('SYSTEM_MALFUNCTION');
      }
      
      // Envoi de l'image avec le cadre AGM Glitch
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_GLITCH(text)
      }, { quoted: msg });

      // Réaction finale (effet bug réussi)
      await sock.sendMessage(chatId, { react: { text: '💾', key: msg.key } });

    } catch (error) {
      console.error('Error in glitch command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};
