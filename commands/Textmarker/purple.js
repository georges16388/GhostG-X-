/**
 * Purple Mystic Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (PURPLE STYLE) ---
const AGM_PURPLE = (text) => `╭╼━≪• ᴀɢᴍ ᴘᴜʀᴘʟᴇ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 💜
┃ sᴛᴀᴛᴜs : 🟢 ᴍʏsᴛɪᴄ
┃ sᴛʏʟᴇ : ᴘᴜʀᴘʟᴇ ɴᴇʙᴜʟᴀ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'purple',
  aliases: ['violet', 'purplelight'],
  category: 'textmaker',
  description: 'Créer un effet de texte violet mystique',
  usage: '.purple <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴘᴜʀᴘʟᴇ GHOSTG-X');
      }
      
      // Réaction mystique
      await sock.sendMessage(chatId, { react: { text: '🔮', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/purple-text-effect-online-100.html', text);
      
      if (!result || !result.image) {
        throw new Error('PURPLE_VOID_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Purple
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_PURPLE(text)
      }, { quoted: msg });

      // Réaction finale (Éclat violet)
      await sock.sendMessage(chatId, { react: { text: '🌌', key: msg.key } });

    } catch (error) {
      console.error('Error in purple command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴍʏsᴛɪǫᴜᴇ :* ${error.message}`);
    }
  }
};
