/**
 * SetMenuImage Command - GhostG-X Edition
 * Modifie l'image d'illustration du menu dans le sanctuaire
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config'); // Importation de la configuration .env
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ_ɢʀɪᴍᴏɪʀᴇ',
  aliases: ['illustration_grimoire', 'setmenuimage', 'setmenuimg', 'changemenuimage'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴛʀᴀɴsᴍᴜᴛᴇ ʟ\'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ ᴘʀɪɴᴄɪᴘᴀʟᴇ ᴅᴜ ᴍᴇɴᴜ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅ\'ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ',
  usage: '.ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ_ɢʀɪᴍᴏɪʀᴇ (ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ/sᴛɪᴄᴋᴇʀ)',
  ownerOnly: true,
  adminOnly: false,
  groupOnly: false,
  botAdminOnly: false,
  
  async execute(sock, msg, args, extra) {
    try {
      // Sécurité absolue : Liaison avec le Maître Suprême défini dans le .env
      const supremeOwner = config.supremeOwner || '22651622652@s.whatsapp.net';
      if (extra.sender !== supremeOwner) {
        return extra.reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      const chatId = extra.from;
      
      // Vérification si le message est une réponse (citation)
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.quotedMessage) {
        return extra.reply('*📷 ᴍᴜʀᴍᴜʀᴇ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }
      
      const quotedMsg = ctx.quotedMessage;
      const imageMsg = quotedMsg.imageMessage || quotedMsg.stickerMessage;
      
      if (!imageMsg) {
        return extra.reply('*〆 ʟ\'ᴀᴜʀᴀ ᴄɪᴛᴇ́ᴇ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }
      
      // Téléchargement du média
      const targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quotedMsg,
      };
      
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );
      
      if (!mediaBuffer) {
        return extra.reply('*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇʀ ʟ\'ɪᴍᴀɢᴇ. ʀᴇ́ᴇssᴀɪᴇ.*');
      }
      
      // Conversion en JPEG si c'est un sticker (webp) ou un autre format
      let finalBuffer = mediaBuffer;
      const sharp = require('sharp');
      
      if (quotedMsg.stickerMessage || (!imageMsg.mimetype?.includes('jpeg') && !imageMsg.mimetype?.includes('jpg'))) {
        finalBuffer = await sharp(mediaBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      }
      
      // Sauvegarde vers utils/bot_image.jpg
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      
      // Suppression de l'ancienne image si elle existe
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          console.warn('Could not delete old menu image:', e);
        }
      }
      
      // Écriture du nouveau fichier d'illustration
      fs.writeFileSync(imagePath, finalBuffer);
      
      await extra.reply('*✅ ʟ\'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ ᴅᴜ ᴍᴇɴᴜ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      
    } catch (error) {
      console.error('SetMenuImage command error:', error);
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
