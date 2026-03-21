/**
 * Matrix Code Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (MATRIX STYLE) ---
const AGM_MATRIX = (text) => `╭╼━≪• ᴀɢᴍ ᴍᴀᴛʀɪx ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴅᴀᴛᴀ : ${text} 📟
┃ sᴛᴀᴛᴜs : 🟢 ᴏᴠᴇʀʀɪᴅᴇɴ
┃ sᴏᴜʀᴄᴇ : ᴅɪɢɪᴛᴀʟ ʀᴀɪɴ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'matrix',
  aliases: ['neo', 'code'],
  category: 'textmaker',
  description: 'Créer un effet de texte style Matrix (pluie de code)',
  usage: '.matrix <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴᴇ séǫᴜᴇɴᴄᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴍᴀᴛʀɪx GHOST-X');
      }
      
      // Réaction de décodage
      await sock.sendMessage(chatId, { react: { text: '💾', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/matrix-text-effect-154.html', text);
      
      if (!result || !result.image) {
        throw new Error('MATRIX_DECODING_FAILED');
      }
      
      // Envoi de l'image avec le cadre AGM Matrix
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_MATRIX(text)
      }, { quoted: msg });

      // Réaction finale (Entrée dans la Matrix)
      await sock.sendMessage(chatId, { react: { text: '🧪', key: msg.key } });

    } catch (error) {
      console.error('Error in matrix command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};
