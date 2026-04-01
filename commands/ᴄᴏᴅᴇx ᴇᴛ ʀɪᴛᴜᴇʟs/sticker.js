/**
 * Sticker Command
 * Uses ffmpeg + webpmux-style EXIF metadata to always embed packname
 * GhostG-X Edition
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const webp = require('node-webpmux');
const ffmpegPath = require('ffmpeg-static');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
  name: 'sceau',
  aliases: ['s', 'stiker', 'stc', 'sticker'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴᴠᴇʀᴛɪᴛ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴᴇ ᴠɪᴅᴇᴏ ᴇɴ sᴛɪᴄᴋᴇʀ (ᴀᴜᴛᴏ ᴄᴏᴍᴘʀᴇssɪᴏɴ)**',
  usage: `${config.prefix || '.'}sceau [reponse ou legende]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = extra.from;
    let targetMessage = msg;

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };
    }

    const mediaMessage =
      targetMessage.message?.imageMessage ||
      targetMessage.message?.videoMessage ||
      targetMessage.message?.documentMessage;
    const prefix = config.prefix || '.';

    if (!mediaMessage) {
      return reply(`*⚠️ ${toSmallCaps('repondez a une image ou video avec')} ${prefix}${toSmallCaps('sceau ou envoyez le media avec')} ${prefix}${toSmallCaps('sceau en legende')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }

    const tempDir = getTempDir();
    const timestamp = Date.now();
    const tempInput = path.join(tempDir, `in_${timestamp}`);
    const tempOutput = path.join(tempDir, `out_${timestamp}.webp`);
    let tempFiles = [tempInput, tempOutput];

    try {
      // Téléchargement du média
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) {
        return reply(`*❌ ${toSmallCaps('echec de la creation : assurez vous que le media est valide')}*`);
      }

      // Vérification de la taille du fichier
      if (mediaBuffer.length > MAX_FILE_SIZE) {
        const sizeMB = (mediaBuffer.length / 1024 / 1024).toFixed(2);
        return reply(`*❌ ${toSmallCaps('fichier trop volumineux')} : ${sizeMB}MB (max: 50MB)*`);
      }

      fs.writeFileSync(tempInput, mediaBuffer);

      const isAnimated =
        mediaMessage.mimetype?.includes('gif') ||
        mediaMessage.mimetype?.includes('video') ||
        (mediaMessage.seconds || 0) > 0;

      // Commande de base FFMPEG
      const baseFfmpegCmd = isAnimated
        ? `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
        : `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

      const execPromise = (cmd) =>
        new Promise((resolve, reject) => exec(cmd, (err) => (err ? reject(err) : resolve())));

      await execPromise(baseFfmpegCmd);

      let webpBuffer = fs.readFileSync(tempOutput);

      // Fallback si l'animé dépasse 1MB (Limite de confort de WhatsApp)
      if (isAnimated && webpBuffer.length > 1000 * 1024) {
        const tempOutput2 = path.join(tempDir, `out_fallback_${Date.now()}.webp`);
        tempFiles.push(tempOutput2);
        const fileSizeKB = mediaBuffer.length / 1024;
        const isLargeFile = fileSizeKB > 5000;

        const fallbackCmd = isLargeFile
          ? `"${ffmpegPath}" -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=8,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput2}"`
          : `"${ffmpegPath}" -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput2}"`;

        await execPromise(fallbackCmd);

        if (fs.existsSync(tempOutput2)) {
          webpBuffer = fs.readFileSync(tempOutput2);
        }
      }

      // Injection des métadonnées EXIF (node-webpmux)
      const img = new webp.Image();
      await img.load(webpBuffer);

      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': config.packname || 'ɢʜᴏsᴛɢ 𝐗',
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

      // Envoi du sticker
      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

    } catch (error) {
      console.error('Sticker command error:', error);
      await reply(`*❌ ${toSmallCaps('echec de la creation : le sanctuaire a rencontre une erreur')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    } finally {
      // Nettoyage systématique des fichiers temporaires
      tempFiles.forEach(file => deleteTempFile(file));
    }
  },
};
