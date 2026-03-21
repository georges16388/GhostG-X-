/**
 * Sand Writing Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (SAND STYLE) ---
const AGM_SAND = (text) => `╭╼━≪• ᴀɢᴍ sᴀɴᴅ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 🏖️
┃ sᴛᴀᴛᴜs : 🟢 ᴇɴɢʀᴀᴠᴇᴅ
┃ sᴛʏʟᴇ : sᴀɴᴅ ᴡʀɪᴛɪɴɢ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'sand',
  aliases: ['sable', 'beach'],
  category: 'textmaker',
  description: 'Écrire un nom ou un message sur le sable',
  usage: '.sand <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .sᴀɴᴅ GHOST-X');
      }
      
      // Réaction estivale
      await sock.sendMessage(chatId, { react: { text: '🏝️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html', text);
      
      if (!result || !result.image) {
        throw new Error('SAND_STORM_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Sand
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_SAND(text)
      }, { quoted: msg });

      // Réaction finale (Tracé terminé)
      await sock.sendMessage(chatId, { react: { text: '🌊', key: msg.key } });

    } catch (error) {
      console.error('Error in sand command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴛʀᴀçᴀɢᴇ :* ${error.message}`);
    }
  }
};
