/**
 * 1917 Movie Text Effect - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (MAKER STYLE) ---
const AGM_MAKER = (effect) => `╭╼━≪• ᴀɢᴍ ᴛᴇxᴛ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴇғғᴇᴄᴛ : ${effect} 🎬
┃ sᴛᴀᴛᴜs : 🟢 ɢᴇɴᴇʀᴀᴛᴇᴅ
┃ ᴀʀᴛɪsᴛ : ᴏᴡɴᴇʀ 👑
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: '1917',
  aliases: ['movie1917', 'war-text'],
  category: 'textmaker',
  description: 'Créer un effet de texte style film 1917',
  usage: '.1917 <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.*\n*ᴇxᴇᴍᴘʟᴇ :* .1917 GHOSTG');
      }
      
      // Réaction de travail
      await sock.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });

      // Appel à l'API via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/1917-style-text-effect-523.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_EMPTY_RESPONSE');
      }
      
      // Envoi de l'image avec le cadre AGM
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_MAKER('1917 Style')
      }, { quoted: msg });

      // Réaction finale
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Error in 1917 command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ɢéɴéʀᴀᴛɪᴏɴ :* ${error.message}`);
    }
  }
};
