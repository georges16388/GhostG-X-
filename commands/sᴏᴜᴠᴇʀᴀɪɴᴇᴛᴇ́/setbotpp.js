/**
 * Set Bot PP Command - GhostG-X Edition
 * Modifie la photo de profil du bot dans le sanctuaire
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Max file size: 10MB for profile pictures
const MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = {
  name: 'ᴇᴍᴘʀᴇɪɴᴛᴇ_ɢʀɪᴍᴏɪʀᴇ',
  aliases: ['empreinte_grimoire', 'setbotpp', 'setppbot', 'setpp', 'avatar'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴛʀᴀɴsᴍᴜᴛᴇ ʟ\'ɪᴍᴀɢᴇ ᴅᴇ ᴘʀᴏғɪʟ ᴅᴜ ʙᴏᴛ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅ\'ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ',
  usage: '.ᴇᴍᴘʀᴇɪɴᴛᴇ_ɢʀɪᴍᴏɪʀᴇ (ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const { isOwner, reply } = extra;
    
    try {
      // 🔥 LE FIX : On passe par isOwner défini via le .env
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      // Check if message is a reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return reply('*⚠️ ᴍᴜʀᴍᴜʀᴇ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }

      // Check if quoted message contains an image or sticker
      const imageMessage = quotedMessage.imageMessage;
      const stickerMessage = quotedMessage.stickerMessage;

      if (!imageMessage && !stickerMessage) {
        return reply('*〆 ʟ\'ᴀᴜʀᴀ ᴄɪᴛᴇ́ᴇ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }

      // Use whichever message type is available
      const mediaMessage = imageMessage || stickerMessage;

      const tmpDir = getTempDir();
      const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);

      try {
        // Download the media (image or sticker)
        const stream = await downloadContentFromMessage(mediaMessage, 'image');
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
          return reply(`*〆 ᴄᴇᴛ ᴀʀᴛᴇғᴀᴄᴛ ᴇsᴛ ᴛʀᴏᴘ ʟᴏᴜʀᴅ : ${(buffer.length / 1024 / 1024).toFixed(2)}ᴍʙ (ᴍᴀx : ${MAX_FILE_SIZE / 1024 / 1024}ᴍʙ)*`);
        }

        // Save the image
        fs.writeFileSync(imagePath, buffer);

        // Set the profile picture
        await sock.updateProfilePicture(sock.user.id.split(':')[0] + '@s.whatsapp.net', { url: imagePath });

        await reply('*✅ ʟ\'ᴇᴍᴘʀᴇɪɴᴛᴇ ᴠɪsᴜᴇʟʟᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      } catch (error) {
        console.error('setbotpp error:', error);
        reply('*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴍᴏᴅɪғɪᴇʀ ʟ\'ᴇᴍᴘʀᴇɪɴᴛᴇ ᴠɪsᴜᴇʟʟᴇ.*');
      } finally {
        // Always cleanup temp file
        deleteTempFile(imagePath);
      }
    } catch (error) {
      console.error('setbotpp error:', error);
      reply('*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴍᴏᴅɪғɪᴇʀ ʟ\'ᴇᴍᴘʀᴇɪɴᴛᴇ ᴠɪsᴜᴇʟʟᴇ.*');
    }
  }
};
