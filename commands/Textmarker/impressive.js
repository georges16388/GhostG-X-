/**
 * 3D Paint Text Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (SPECTRUM STYLE) ---
const AGM_SPECTRUM = (text) => `╭╼━≪• ᴀɢᴍ sᴘᴇᴄᴛʀᴜᴍ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 🎨
┃ sᴛᴀᴛᴜs : 🟢 ɪᴍᴘʀᴇssɪᴠᴇ
┃ sᴛʏʟᴇ : 3ᴅ ᴄᴏʟᴏʀғᴜʟ ᴘᴀɪɴᴛ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'impressive',
  aliases: ['paint', '3dtext'],
  category: 'textmaker',
  description: 'Créer un effet de texte en peinture 3D colorée',
  usage: '.impressive <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ɪᴍᴘʀᴇssɪᴠᴇ JÉSUS');
      }
      
      // Réaction artistique
      await sock.sendMessage(chatId, { react: { text: '🌈', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_ART_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Spectrum
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_SPECTRUM(text)
      }, { quoted: msg });

      // Réaction finale (chef-d'œuvre terminé)
      await sock.sendMessage(chatId, { react: { text: '🖌️', key: msg.key } });

    } catch (error) {
      console.error('Error in impressive command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴀʀᴛɪsᴛɪǫᴜᴇ :* ${error.message}`);
    }
  }
};
