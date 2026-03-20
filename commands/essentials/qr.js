/**
 * QR Code Generator - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const qrcode = require('qrcode');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (text) => `╭╼━≪• ǫʀ ᴄᴏᴅᴇ ɢᴇɴᴇʀᴀᴛᴏʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ɢᴇɴᴇʀᴀᴛᴇᴅ
┃ ᴛᴇxᴛ : ${text.length > 20 ? text.substring(0, 17) + '...' : text}
┃ ᴍᴏᴅᴇ : sʏsᴛᴇᴍ ⚡
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'qr',
  aliases: ['qrcode'],
  category: 'utility',
  description: 'Generate QR code from text',
  usage: '.qr <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ ᴏᴜ ᴜɴ ʟɪᴇɴ.*');
      }
      
      const text = args.join(' ');
      
      // Génération du Buffer QR
      const qrBuffer = await qrcode.toBuffer(text, {
        type: 'png',
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      await sock.sendMessage(extra.from, {
        image: qrBuffer,
        caption: AGM_DESIGN(text)
      }, { quoted: msg });
      
      await sock.sendMessage(extra.from, { react: { text: "🔳", key: msg.key } });
      
    } catch (error) {
      console.error('QR Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
