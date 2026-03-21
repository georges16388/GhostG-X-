/**
 * 3D Snow Text Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (SNOW STYLE) ---
const AGM_SNOW = (text) => `╭╼━≪• ᴀɢᴍ sɴᴏᴡ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} ❄️
┃ sᴛᴀᴛᴜs : 🟢 ғʀᴏᴢᴇɴ
┃ sᴛʏʟᴇ : 3ᴅ ʙʟɪᴢᴢᴀʀᴅ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'snow',
  aliases: ['neige', 'winter'],
  category: 'textmaker',
  description: 'Créer un effet de texte en neige 3D',
  usage: '.snow <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .sɴᴏᴡ GHOST-X');
      }
      
      // Réaction hivernale
      await sock.sendMessage(chatId, { react: { text: '❄️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html', text);
      
      if (!result || !result.image) {
        throw new Error('BLIZZARD_API_TIMEOUT');
      }
      
      // Envoi de l'image avec le cadre AGM Snow
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_SNOW(text)
      }, { quoted: msg });

      // Réaction finale (Tempête terminée)
      await sock.sendMessage(chatId, { react: { text: '⛄', key: msg.key } });

    } catch (error) {
      console.error('Error in snow command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ɢʟᴀᴄɪᴀʟᴇ :* ${error.message}`);
    }
  }
};
