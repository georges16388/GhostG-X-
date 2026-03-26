/**
 * Futuristic Light Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (PHOTON STYLE) ---
const AGM_PHOTON = (text) => `╭╼━≪• ᴀɢᴍ ᴘʜᴏᴛᴏɴ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} ⚡
┃ sᴛᴀᴛᴜs : 🟢 ɪʟʟᴜᴍɪɴᴀᴛᴇᴅ
┃ sᴛʏʟᴇ : ғᴜᴛᴜʀɪsᴛɪᴄ ʟɪɢʜᴛ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'light',
  aliases: ['neonlight', 'futur'],
  category: 'textmaker',
  description: 'Créer un effet de texte lumineux futuriste',
  usage: '.light <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ʟɪɢʜᴛ GHOSTG-X');
      }
      
      // Réaction électrique
      await sock.sendMessage(chatId, { react: { text: '💡', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html', text);
      
      if (!result || !result.image) {
        throw new Error('PHOTON_STREAM_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Photon
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_PHOTON(text)
      }, { quoted: msg });

      // Réaction finale (vitesse de la lumière)
      await sock.sendMessage(chatId, { react: { text: '⚡', key: msg.key } });

    } catch (error) {
      console.error('Error in light command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ғʟUX :* ${error.message}`);
    }
  }
};
