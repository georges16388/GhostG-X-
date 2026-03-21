/**
 * Sticker Conversion Engine - AGM Sticker-Pro
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { getTempDir } = require('./tempManager');

// --- CONFIGURATION AGM ---
const STICKER_PACK = config.packname || '-ّ⸙𓆩ɢʜᴏꜱᴛɢ x 𓆪⸙-ّ';
const STICKER_AUTH = config.author || 'ɢʜᴏꜱᴛ-x';
const MAX_FILE_SIZE = 50 * 1024 * 1024; 

/**
 * Moteur de Conversion FFmpeg (WebP Animé & Statique)
 */
const convertToSticker = async (mediaBuffer, isVideo = false) => {
  if (mediaBuffer.length > MAX_FILE_SIZE) throw new Error('ꜰɪʟᴇ ᴛᴏᴏ ʟᴀʀɢᴇ');

  const tempDir = getTempDir();
  const inputPath = path.join(tempDir, `agm_in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
  const outputPath = path.join(tempDir, `agm_out_${Date.now()}.webp`);

  try {
    fs.writeFileSync(inputPath, mediaBuffer);
    
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
          '-lossless', '0',
          '-compression_level', '6',
          '-q:v', '70',
          '-loop', '0',
          '-preset', 'picture',
          '-an', '-vsync', '0'
        ])
        .toFormat('webp')
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const stickerBuffer = fs.readFileSync(outputPath);
    
    // Nettoyage immédiat
    [inputPath, outputPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    
    return stickerBuffer;
  } catch (e) {
    [inputPath, outputPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    throw new Error(`❌ [ᴀɢᴍ_ᴄᴏɴᴠᴇʀᴛ_ꜰᴀɪʟ] : ${e.message}`);
  }
};

/**
 * Injection de Métadonnées (Branding)
 */
const addStickerMetadata = async (stickerBuffer, pack = STICKER_PACK, author = STICKER_AUTH) => {
  try {
    const webpmux = require('node-webpmux');
    const img = new webpmux.Image();
    await img.load(stickerBuffer);
    
    const exifData = {
      'sticker-pack-name': pack,
      'sticker-pack-publisher': author,
      'emojis': ['👻', '🔥']
    };

    // Structure EXIF spécifique à WhatsApp
    const exifHeader = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonStr = JSON.stringify(exifData);
    const jsonBuffer = Buffer.from(jsonStr, 'utf8');
    const exif = Buffer.concat([exifHeader, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    img.exif = exif;
    return await img.save(null);
  } catch (e) {
    return stickerBuffer; // Retourne le sticker sans metadata si fail
  }
};

/**
 * Fonction Maîtresse : Création Complète
 */
const createSticker = async (buffer, isVideo = false) => {
  let sticker = await convertToSticker(buffer, isVideo);
  return await addStickerMetadata(sticker);
};

module.exports = { convertToSticker, addStickerMetadata, createSticker };
