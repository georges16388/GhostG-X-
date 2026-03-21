/**
 * Sticker Metadata Utilities - AGM Sticker-Exif
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webp = require('node-webpmux');
const config = require('../config');
const { getTempDir } = require('./tempManager');

// --- CONFIGURATION AGM ---
const STICKER_PACK = config.packname || '-ّ⸙𓆩ɢʜᴏꜱᴛɢ x 𓆪⸙-ّ';
const STICKER_AUTHOR = config.author || 'ɢʜᴏꜱᴛ-x';
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Générateur de Buffer EXIF Premium
 */
const createExifBuffer = (pack, author) => {
  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    'emojis': ['👑', '👻']
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ]);

  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  return exif;
};

/**
 * Ajouter EXIF à une Image (WebP)
 */
async function writeExifImg(imgBuffer, metadata = {}) {
  const img = new webp.Image();
  await img.load(imgBuffer);
  
  const pack = metadata.packname || STICKER_PACK;
  const author = metadata.author || STICKER_AUTHOR;
  
  img.exif = createExifBuffer(pack, author);
  return await img.save(null);
}

/**
 * Convertir Vidéo (MP4) en Sticker Animé avec EXIF
 */
async function writeExifVid(videoBuffer, metadata = {}) {
  const ffmpeg = require('ffmpeg-static');
  const { spawn } = require('child_process');

  if (videoBuffer.length > MAX_SIZE) throw new Error('ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ ꜰᴏʀ ꜱᴛɪᴄᴋᴇʀ');

  const tmpIn = path.join(getTempDir(), `vid_${Date.now()}.mp4`);
  const tmpOut = path.join(getTempDir(), `sticker_${Date.now()}.webp`);

  try {
    fs.writeFileSync(tmpIn, videoBuffer);

    // Conversion optimisée pour WhatsApp
    await new Promise((resolve, reject) => {
      const process = spawn(ffmpeg, [
        '-y', '-i', tmpIn,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
        '-c:v', 'libwebp', '-preset', 'default', '-loop', '0', '-vsync', '0',
        '-pix_fmt', 'yuva420p', '-quality', '75', outputPath = tmpOut
      ]);
      process.on('close', (code) => code === 0 ? resolve() : reject());
    });

    const webpBuffer = fs.readFileSync(tmpOut);
    const result = await writeExifImg(webpBuffer, metadata);

    // Cleanup
    [tmpIn, tmpOut].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    return result;

  } catch (e) {
    [tmpIn, tmpOut].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    throw e;
  }
}

module.exports = { writeExifImg, writeExifVid };
