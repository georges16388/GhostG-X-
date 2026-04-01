/**
 * SetMenuImage Command - GhostG-X Edition
 * Modifie l'image d'illustration du menu dans l'Oracle
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config'); // Importation de la configuration
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ_ɢʀɪᴍᴏɪʀᴇ',
  aliases: ['illustration_grimoire', 'setmenuimage', 'setmenuimg', 'changemenuimage'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀɴsᴍᴜᴛᴇ ʟ\'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ ᴘʀɪɴᴄɪᴘᴀʟᴇ ᴅᴜ ᴍᴇɴᴜ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅ\'ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ**',
  usage: `${prefix}ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ_ɢʀɪᴍᴏɪʀᴇ (ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ/sᴛɪᴄᴋᴇʀ)`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;

    try {
      // Sécurité : On utilise directement le flag isOwner géré par ton handler et le .env
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      const from = extra.from;

      // Vérification si le message est une réponse (citation)
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.quotedMessage) {
        return reply(`*📷 ᴍᴜʀᴍᴜʀᴇ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*`);
      }

      const quotedMsg = ctx.quotedMessage;
      const imageMsg = quotedMsg.imageMessage || quotedMsg.stickerMessage;

      if (!imageMsg) {
        return reply('*〆 ʟ\'ᴀᴜʀᴀ ᴄɪᴛᴇ́ᴇ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }

      // Téléchargement du média
      const targetMessage = {
        key: {
          remoteJid: from,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: quotedMsg,
      };

      await reply('*🔮 ʟ\'ᴏʀᴀᴄʟᴇ ᴘʀᴏᴄᴇ̀ᴅᴇ ᴀ̀ ʟ\'ᴀsᴘɪʀᴀᴛɪᴏɴ ᴅᴇ ʟ\'ᴀᴜʀᴀ... ᴘᴀᴛɪᴇɴᴛᴇ.*');

      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) {
        return reply('*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇʀ ʟ\'ɪᴍᴀɢᴇ. ʀᴇ́ᴇssᴀɪᴇ.*');
      }

      // Conversion en JPEG si c'est un sticker (webp) ou un autre format
      let finalBuffer = mediaBuffer;
      const sharp = require('sharp');

      if (quotedMsg.stickerMessage || (!imageMsg.mimetype?.includes('jpeg') && !imageMsg.mimetype?.includes('jpg'))) {
        finalBuffer = await sharp(mediaBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // 1. Sauvegarde vers l'image de secours par défaut
      const fallbackPath = path.join(__dirname, '../../utils/bot_image.jpg');
      fs.writeFileSync(fallbackPath, finalBuffer);

      // 2. Écrasement synchronisé des 7 images aléatoires lues par le grimoire
      for (let i = 1; i <= 7; i++) {
        const imagePath = path.join(__dirname, `../../utils/bot_image_${i}.jpg`);
        try {
          fs.writeFileSync(imagePath, finalBuffer);
        } catch (e) {
          console.warn(`Could not overwrite bot_image_${i}.jpg:`, e);
        }
      }

      await reply('*✅ ʟ\'ɪʟʟᴜsᴛʀᴀᴛɪᴏɴ ᴅᴜ ᴍᴇɴᴜ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇ̀s sᴜʀ ᴛᴏᴜs ʟᴇs ᴀʀᴄᴀɴᴇs !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');

    } catch (error) {
      console.error('SetMenuImage command error:', error);
      await reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
