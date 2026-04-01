/**
 * QR Code Generator Command
 */

const qrcode = require('qrcode');
const config = require('../../config.js');

module.exports = {
  name: 'ʀᴇғʟᴇᴛ',
  aliases: ['qrcode', 'qr', 'reflet'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: ' *ɢᴇ́ɴᴇ̀ʀᴇ ᴜɴ sᴄᴇᴀᴜ ǫʀ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅ\'ᴜɴ ᴛᴇxᴛᴇ*',
  usage: '.ʀᴇғʟᴇᴛ <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      const prefix = config.prefix || '^';
      
      if (args.length === 0) {
        return extra.reply(`⎔ *ᴜsᴀɢᴇ ᴅᴜ sʏsᴛᴇ̀ᴍᴇ :* ${prefix}ʀᴇғʟᴇᴛ <ᴛᴇxᴛᴇ>\n\n🔮 *ᴇxᴇᴍᴘʟᴇ :* ${prefix}ʀᴇғʟᴇᴛ ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      const text = args.join(' ');
      
      // Génération du QR Code mystique
      const qrBuffer = await qrcode.toBuffer(text, {
        type: 'png',
        width: 500,
        margin: 2
      });
      
      await sock.sendMessage(extra.from, {
        image: qrBuffer,
        caption: `✅ *sᴄᴇᴀᴜ ǫʀ ᴍᴀᴛᴇ́ʀɪᴀʟɪsᴇ́*\n\n📝 *ᴄɪʙʟᴇ :* ${text}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      await extra.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟ\'ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
