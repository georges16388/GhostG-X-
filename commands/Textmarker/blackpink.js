/**
 * Blackpink Logo Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (BLACKPINK STYLE) ---
const AGM_BP = (text) => `╭╼━≪• ᴀɢᴍ ʙᴘ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 💖
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏɴᴇ
┃ sᴛʏʟᴇ : ʙʟᴀᴄᴋᴘɪɴᴋ ᴠɪᴘ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'blackpink',
  aliases: ['bp', 'blink'],
  category: 'textmaker',
  description: 'Créer un logo style Blackpink avec signatures',
  usage: '.blackpink <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ʙʟᴀᴄᴋᴘɪɴᴋ GHOSTG');
      }
      
      // Réaction esthétique
      await sock.sendMessage(chatId, { react: { text: '✨', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_OFFLINE');
      }
      
      // Envoi du logo avec le cadre AGM Blackpink
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_BP(text)
      }, { quoted: msg });

      // Réaction finale
      await sock.sendMessage(chatId, { react: { text: '💕', key: msg.key } });

    } catch (error) {
      console.error('Error in blackpink command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ sᴛʏʟᴇ :* ${error.message}`);
    }
  }
};
