/**
 * Sticker to Image/Video - Convert sticker to PNG or MP4
 * GhostG-X Edition
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'image',
  aliases: ['toimg', 'stickertoimg', 'sticker2img', 'svideo', 'simage', 'img', 'tovideo', 'tovideo+'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴᴠᴇʀᴛɪᴛ ᴜɴ sᴛɪᴄᴋᴇʀ ᴇɴ ɪᴍᴀɢᴇ (ᴘɴɢ) ᴏᴜ ᴇɴ ᴠɪᴅᴇᴏ**',
  // Séparation visuelle nette dans l'usage pour guider l'utilisateur
  usage: `${config.prefix || '.'}image [reponse sticker fixe]\n` +
         `${config.prefix || '.'}tovideo [reponse sticker anime]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = extra.from;

    try {
      const notStickerMessage = `⚠️ *${toSmallCaps('repondez a un sticker pour enclencher la transmutation d\'origine')}.*`;

      // 1. Vérification isolée du message cité
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctxInfo?.quotedMessage) {
        return await reply(notStickerMessage);
      }

      const targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };

      // 2. Vérification s'il s'agit bien d'un sticker
      const stickerMessage = targetMessage.message?.stickerMessage;
      if (!stickerMessage) {
        return await reply(notStickerMessage);
      }

      // 3. Téléchargement du média WebP d'origine
      const stickerBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!stickerBuffer) {
        return await reply(`*❌ ${toSmallCaps('echec de l\'invocation : impossible de saisir le sticker')}*`);
      }

      // 4. Détection du type de sticker (Fixe vs Animé)
      const isAnimated = stickerMessage.isAnimated || stickerMessage.mimetype?.includes('animated');

      if (isAnimated) {
        // --- TRANSFORMATION EN VIDÉO (Animated Sticker) ---
        const { webp2mp4 } = require('../../utils/webp2mp4'); // Ton utilitaire de conversion
        const mp4Buffer = await webp2mp4(stickerBuffer);

        if (!mp4Buffer || mp4Buffer.length === 0) {
          throw new Error('Le buffer MP4 est vide ou nul');
        }

        // Vérification de la taille du fichier (Limite WhatsApp 16MB)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (mp4Buffer.length > maxSize) {
          throw new Error(`Fichier MP4 trop lourd : ${(mp4Buffer.length / 1024 / 1024).toFixed(2)}MB`);
        }

        // Envoi sous forme de vidéo/GIF cyclique
        await sock.sendMessage(chatId, {
          video: mp4Buffer,
          mimetype: 'video/mp4',
          gifPlayback: true
        }, { quoted: msg });

      } else {
        // --- TRANSFORMATION EN IMAGE (Static Sticker) ---
        const { webp2png } = require('../../utils/webp2mp4'); // Ton utilitaire de conversion WebP/PNG
        const imageBuffer = await webp2png(stickerBuffer);

        // Envoi sous forme d'image
        await sock.sendMessage(chatId, {
          image: imageBuffer
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('Error in image command:', error);
      await reply(`*❌ ${toSmallCaps('echec de la conversion du sticker')} :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
