/**
 * Crop Command - Perfect Square Sticker
 * Custom Design & Metadata by -ɢʜᴏsᴛɢ 𝐗
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const config = require('../../config');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

module.exports = {
  name: 'crop',
  aliases: ['square', 'cropper', 'carre'],
  category: 'essentials', // Nouvelle catégorie CORE
  description: 'Recadre une image/vidéo en sticker carré parfait.',
  usage: '.crop (en répondant à un média)',
  
  async execute(sock, msg, args, extra) {
    const tmpDir = getTempDir();
    const tempInput = path.join(tmpDir, `ghost_in_${Date.now()}`);
    const tempOutput = path.join(tmpDir, `ghost_crop_${Date.now()}.webp`);
    
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const targetMessage = quoted ? { message: quoted } : msg;
      const type = Object.keys(targetMessage.message || {})[0];

      if (!/imageMessage|videoMessage|stickerMessage/.test(type)) {
        return extra.reply('✂️ *Répond à une image, vidéo ou sticker* pour le recadrer en carré parfait !');
      }

      // Réaction de "travail en cours"
      await sock.sendMessage(extra.from, { react: { text: "✂️", key: msg.key } });

      const mediaBuffer = await downloadMediaMessage(
        { key: msg.key, message: targetMessage.message },
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      fs.writeFileSync(tempInput, mediaBuffer);

      const isVideo = type === 'videoMessage' || targetMessage.message?.videoMessage;
      
      // FFmpeg : Crop intelligent (prend le plus petit côté pour faire un carré au centre)
      let ffmpegCommand;
      if (isVideo) {
        ffmpegCommand = `ffmpeg -i "${tempInput}" -t 5 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512:flags=lanczos,fps=12" -c:v libwebp -lossless 0 -compression_level 6 -q:v 40 -loop 0 -preset picture -an -vsync 0 "${tempOutput}"`;
      } else {
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512:flags=lanczos" -c:v libwebp -q:v 75 "${tempOutput}"`;
      }

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (err) => err ? reject(err) : resolve());
      });

      // Injection de ta signature Ghost dans le sticker
      const img = new webp.Image();
      await img.load(tempOutput);
      
      const exif = {
        'sticker-pack-name': '-ɢʜᴏsᴛɢ 𝐗',
        'sticker-author': 'Ghost AI 🤖',
        'emojis': ['✂️', '✨']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(exif), 'utf8');
      const exifBuffer = Buffer.concat([exifAttr, jsonBuffer]);
      exifBuffer.writeUIntLE(jsonBuffer.length, 14, 4);
      
      img.exif = exifBuffer;
      const finalSticker = await img.save(null);

      await sock.sendMessage(extra.from, { sticker: finalSticker }, { quoted: msg });
      await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('Crop Error:', error);
      await extra.reply('❌ *Erreur :* Le média est trop lourd ou invalide.');
    } finally {
      deleteTempFile(tempInput);
      deleteTempFile(tempOutput);
    }
  }
};
