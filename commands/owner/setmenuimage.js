/**
 * Menu Interface Controller - AGM Visual Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM (VISUAL STYLE) ---
const AGM_VISUAL = (status) => `╭╼━≪• ᴀɢᴍ ᴠɪsᴜᴀʟ ᴄᴏʀᴇ •≫━╾╮
┃ sʏsᴛᴇᴍ : ᴍᴇɴᴜ ɪɴᴛᴇʀғᴀᴄᴇ 🖼️
┃ sᴛᴀᴛᴜs : ${status}
┃ ᴀᴄᴛɪᴏɴ : sʏɴᴄɪɴɢ...
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'changemenuimage'],
  category: 'owner',
  description: 'Changer l\'image d\'en-tête du menu',
  usage: '.setmenuimage (répondre à une image/sticker)',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return extra.reply('📷 *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ.*');
      }
      
      const quotedMsg = ctx.quotedMessage;
      const isImage = quotedMsg.imageMessage || quotedMsg.stickerMessage;
      
      if (!isImage) {
        return extra.reply('❌ *ʟᴇ ᴍᴇssᴀɢᴇ ᴅᴏɪᴛ êᴛʀᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ.*');
      }

      await sock.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });
      await extra.reply(AGM_VISUAL('🟠 ᴘʀᴏᴄᴇssɪɴɢ'));

      // Téléchargement sécurisé via Baileys
      const mediaBuffer = await downloadMediaMessage(
        { key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant }, message: quotedMsg },
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      if (!mediaBuffer) throw new Error('Download failed');

      // Conversion en JPEG (Sharp est nécessaire pour gérer les stickers/formats)
      let finalBuffer = mediaBuffer;
      try {
        const sharp = require('sharp');
        finalBuffer = await sharp(mediaBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch (e) {
        console.log('Sharp conversion skipped or failed, using raw buffer.');
      }
      
      // Chemin vers l'image du menu
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      
      // Sauvegarde et écrasement
      fs.writeFileSync(imagePath, finalBuffer);
      
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
      await extra.reply(AGM_VISUAL('✅ ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ'));
      
    } catch (error) {
      console.error('SetMenuImg Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ${error.message}*`);
    }
  }
};
