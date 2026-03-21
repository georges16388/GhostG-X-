/**
 * Neon Devil Wings Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (DEVIL STYLE) ---
const AGM_DEVIL = (text) => `╭╼━≪• ᴀɢᴍ ᴅᴇᴠɪʟ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 👿
┃ sᴛᴀᴛᴜs : 🟢 ɪɴғᴇʀɴᴀʟ
┃ sᴛʏʟᴇ : ɴᴇᴏɴ ᴡɪɴɢs 🪽
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'devil',
  aliases: ['devilwings', 'neondevil'],
  category: 'textmaker',
  description: 'Créer un effet de texte néon avec des ailes de diable',
  usage: '.devil <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴅᴇᴠɪʟ GHOSTG');
      }
      
      // Réaction sombre
      await sock.sendMessage(chatId, { react: { text: '🔥', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html', text);
      
      if (!result || !result.image) {
        throw new Error('API_DOWN');
      }
      
      // Envoi de l'image avec le cadre AGM Devil
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_DEVIL(text)
      }, { quoted: msg });

      // Réaction finale
      await sock.sendMessage(chatId, { react: { text: '🪽', key: msg.key } });

    } catch (error) {
      console.error('Error in devil command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ɪɴғᴇʀɴᴀʟᴇ :* ${error.message}`);
    }
  }
};
