/**
 * Thunder Strike Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (THUNDER STYLE) ---
const AGM_THUNDER = (text) => `╭╼━≪• ᴀɢᴍ sᴛᴏʀᴍ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} ⚡
┃ sᴛᴀᴛᴜs : 🟢 ᴇʟᴇᴄᴛʀɪғɪᴇᴅ
┃ ᴇғғᴇᴄᴛ : ᴛʜᴜɴᴅᴇʀ sᴛʀɪᴋᴇ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'thunder',
  aliases: ['foudre', 'storm', 'tonnerre'],
  category: 'textmaker',
  description: 'Créer un effet de texte avec de la foudre et du tonnerre',
  usage: '.thunder <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴛʜᴜɴᴅᴇʀ SAINT-ESPRIT');
      }
      
      // Réaction orageuse
      await sock.sendMessage(chatId, { react: { text: '⛈️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/thunder-text-effect-online-97.html', text);
      
      if (!result || !result.image) {
        throw new Error('STORM_API_DISCONNECTED');
      }
      
      // Envoi de l'image avec le cadre AGM Thunder
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_THUNDER(text)
      }, { quoted: msg });

      // Réaction finale (Impact réussi)
      await sock.sendMessage(chatId, { react: { text: '⚡', key: msg.key } });

    } catch (error) {
      console.error('Error in thunder command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅ'ɪᴍᴘᴀᴄᴛ :* ${error.message}`);
    }
  }
};
