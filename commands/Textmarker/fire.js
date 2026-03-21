/**
 * Flame Lettering Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (FIRE STYLE) ---
const AGM_FIRE = (text) => `╭╼━≪• ᴀɢᴍ ғɪʀᴇ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 🔥
┃ sᴛᴀᴛᴜs : 🟢 ʙᴜʀɴɪɴɢ
┃ ᴇғғᴇᴄᴛ : ғʟᴀᴍᴇ ʟᴇᴛᴛᴇʀɪɴɢ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'fire',
  aliases: ['flame', 'bruler'],
  category: 'textmaker',
  description: 'Créer un effet de texte enflammé',
  usage: '.fire <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ғɪʀᴇ GHOSTG');
      }
      
      // Réaction volcanique
      await sock.sendMessage(chatId, { react: { text: '🔥', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/flame-lettering-effect-372.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_CONNECTION_ERROR');
      }
      
      // Envoi de l'image avec le cadre AGM Fire
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_FIRE(text)
      }, { quoted: msg });

      // Réaction finale
      await sock.sendMessage(chatId, { react: { text: '💥', key: msg.key } });

    } catch (error) {
      console.error('Error in fire command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏᴍʙᴜsᴛɪᴏɴ :* ${error.message}`);
    }
  }
};
