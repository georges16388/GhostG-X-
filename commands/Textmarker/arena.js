/**
 * Arena of Valor Text Effect - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (ARENA STYLE) ---
const AGM_ARENA = (text) => `╭╼━≪• ᴀɢᴍ ᴀʀᴇɴᴀ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴀʀɢᴇᴛ : ${text} ⚔️
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇᴀᴅʏ
┃ ɢᴀᴍᴇ : ᴀʀᴇɴᴀ ᴏғ ᴠᴀʟᴏʀ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'arena',
  aliases: ['aov', 'valor'],
  category: 'textmaker',
  description: 'Créer un effet de texte style Arena of Valor',
  usage: '.arena <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴅᴇ ᴄʜᴀᴍᴘɪᴏɴ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴀʀᴇɴᴀ GHOSTG');
      }
      
      // Réaction de combat
      await sock.sendMessage(chatId, { react: { text: '⚔️', key: msg.key } });

      // Appel à l'API Ephoto360
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_TIMEOUT');
      }
      
      // Envoi du résultat avec le cadre AGM Arena
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_ARENA(text)
      }, { quoted: msg });

      // Réaction de victoire
      await sock.sendMessage(chatId, { react: { text: '🏆', key: msg.key } });

    } catch (error) {
      console.error('Error in arena command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏᴍʙᴀᴛ :* ${error.message}`);
    }
  }
};
