/**
 * 3D Metallic Maker - AGM Maker Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const mumaker = require('mumaker');

// --- FONCTION DE DESIGN AGM (METALLIC STYLE) ---
const AGM_METAL = (text) => `╭╼━≪• ᴀɢᴍ ᴍᴇᴛᴀʟ ᴍᴀᴋᴇʀ •≫━╾╮
┃ ᴛᴇxᴛ : ${text} 🛡️
┃ sᴛᴀᴛᴜs : 🟢 ғᴏʀɢᴇᴅ
┃ sᴛʏʟᴇ : 3ᴅ sᴛᴇᴇʟ ᴅᴇᴄᴏʀ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'metallic',
  aliases: ['metal', 'acier', 'iron'],
  category: 'textmaker',
  description: 'Créer un effet de texte en métal 3D décoratif',
  usage: '.metallic <texte>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ.* \n*ᴇxᴇᴍᴘʟᴇ :* .ᴍᴇᴛᴀʟʟɪᴄ GHOST-X');
      }
      
      // Réaction de forge
      await sock.sendMessage(chatId, { react: { text: '⚙️', key: msg.key } });

      // Appel à l'API Ephoto360 via mumaker
      const result = await mumaker.ephoto('https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html', text);
      
      if (!result || !result.image) {
        throw new Error('FORGE_PROCESS_FAILED');
      }
      
      // Envoi de l'image avec le cadre AGM Metal
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: AGM_METAL(text)
      }, { quoted: msg });

      // Réaction finale (Acier trempé)
      await sock.sendMessage(chatId, { react: { text: '🛡️', key: msg.key } });

    } catch (error) {
      console.error('Error in metallic command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ ᴅᴇ ғᴏʀɢᴇ :* ${error.message}`);
    }
  }
};
