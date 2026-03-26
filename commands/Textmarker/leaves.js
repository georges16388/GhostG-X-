/**
 * Green Leaves Typography - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (NATURE STYLE) ---
const AGM_NATURE = (text) => `╭╼━≪• ᴀɢᴍ ɴᴀᴛᴜʀᴇ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 🌿
┃ sᴛᴀᴛᴜs : 🟢 ᴏʀɢᴀɴɪᴄ
┃ sᴛʏʟᴇ : ɢʀᴇᴇɴ ʙʀᴜsʜ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'leaves',
  aliases: ['nature', 'vert'],
  category: 'textmaker',
  description: 'Créer un effet de texte avec des feuilles vertes',
  usage: '.leaves <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ʟᴇᴀᴠᴇs GHOST-X');
      }
      
      // Réaction écologique
      await sock.sendMessage(chatId, { react: { text: '🍃', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_NATURE_TIMEOUT');
      }
      
      // Envoi de l'image avec le cadre AGM Nature
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_NATURE(text)
      }, { quoted: msg });

      // Réaction finale (floraison)
      await sock.sendMessage(chatId, { react: { text: '🌳', key: msg.key } });

    } catch (error) {
      console.error('Error in leaves command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴠéɢéᴛᴀʟᴇ :* ${error.message}`);
    }
  }
};
