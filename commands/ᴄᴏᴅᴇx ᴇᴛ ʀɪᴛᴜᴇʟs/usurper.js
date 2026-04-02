/**
 * Take Command - Steal a sticker and re-pack with custom or user packname
 * GhostG-X Edition
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');
const config = require('../../config');

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
  name: 'usurper',
  aliases: ['steal', 'take', 't'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴠᴏʟᴇ ᴜɴ sᴛɪᴄᴋᴇʀ ᴇᴛ ᴍᴏᴅɪғɪᴇ ʟᴇ ɴᴏᴍ ᴅᴇ sᴏɴ ᴘᴀᴄᴋ',
  usage: `${config.prefix || '.'}usurper [nom du pack ou en reponse]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    let targetMessage = msg;
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

    // Détection si c'est une réponse à un message
    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: { 
          remoteJid: extra.from, 
          id: ctxInfo.stanzaId, 
          participant: ctxInfo.participant 
        },
        message: ctxInfo.quotedMessage,
      };
    }

    const stickerMsg = targetMessage.message?.stickerMessage;
    const prefix = config.prefix || '.';

    if (!stickerMsg) {
      return reply(`*⚠️ ${toSmallCaps('repondez a un sticker avec')} ${prefix}${toSmallCaps('usurper pour vous en emparer')}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }

    try {
      // Téléchargement du média
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) {
        return reply(`*⚠️ ${toSmallCaps('echec de l\'invocation')} : ${toSmallCaps('impossible de saisir le sticker. reessaie')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Définition du nom du pack (Argument passé ou pseudo de l'auteur)
      const userName = msg.pushName || extra.sender.split('@')[0];
      const packname = args.length ? args.join(' ') : toSmallCaps(userName);

      const img = new webp.Image();
      await img.load(mediaBuffer);

      // Métadonnées du sticker
      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': packname || 'ɢʜᴏsᴛɢ 𝐗',
        emojis: ['🤖'],
      };

      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);

      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      // Envoi du sticker usurpé
      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

    } catch (error) {
      console.error('Take command error:', error);
      await reply(`*❌ ${toSmallCaps('echec du vol de sticker. veuillez reessayer')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  },
};
