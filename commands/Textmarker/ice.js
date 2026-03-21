/**
 * Ice Text Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (FROST STYLE) ---
const AGM_FROST = (text) => `╭╼━≪• ᴀɢᴍ ғʀᴏsᴛ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} ❄️
┃ sᴛᴀᴛᴜs : 🟢 ғʀᴏᴢᴇɴ
┃ ᴇғғᴇᴄᴛ : ɪᴄᴇ sᴛʏʟᴇ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'ice',
  aliases: ['snow', 'glace'],
  category: 'textmaker',
  description: 'Créer un effet de texte glacé',
  usage: '.ice <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ɪᴄᴇ GHOST-X');
      }
      
      // Réaction glaciale
      await sock.sendMessage(chatId, { react: { text: '❄️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/ice-text-effect-online-101.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_FROZEN_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Frost
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_FROST(text)
      }, { quoted: msg });

      // Réaction finale (cristalisation)
      await sock.sendMessage(chatId, { react: { text: '🧊', key: msg.key } });

    } catch (error) {
      console.error('Error in ice command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴄʀɪsᴛᴀʟʟɪɴᴇ :* ${error.message}`);
    }
  }
};
