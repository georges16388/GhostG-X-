/**
 * Sticker Forge Engine - AGM Sticker-Forge
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const sharp = require('sharp');
const config = require('../config');

// --- PARAMÈTRES PAR DÉFAUT AGM ---
const DEFAULT_PACK = config.packname || '-ّ⸙𓆩ɢʜᴏꜱᴛɢ x 𓆪⸙-ّ';
const DEFAULT_AUTH = config.author || 'ɢʜᴏꜱᴛ-x';

/**
 * Création de Sticker Standard (Full)
 */
const createStickerBuffer = async (media, options = {}) => {
  try {
    const sticker = new Sticker(media, {
      pack: options.pack || DEFAULT_PACK,
      author: options.author || DEFAULT_AUTH,
      type: options.type || StickerTypes.FULL,
      categories: ['👑', '👻'],
      quality: options.quality || 60
    });
    return await sticker.toBuffer();
  } catch (e) {
    throw new Error(`❌ [ᴀɢᴍ_ꜱᴛɪᴄᴋᴇʀ_ꜰᴀɪʟ] : ${e.message}`);
  }
};

/**
 * Sticker Style "Cercle"
 */
const createCircleSticker = async (media, options = {}) => {
  try {
    const sticker = new Sticker(media, {
      pack: options.pack || DEFAULT_PACK,
      author: options.author || DEFAULT_AUTH,
      type: StickerTypes.CIRCLE,
      quality: 60
    });
    return await sticker.toBuffer();
  } catch (e) {
    throw new Error(`❌ [ᴀɢᴍ_ᴄɪʀᴄʟᴇ_ꜰᴀɪʟ]`);
  }
};

/**
 * Sticker Style "Cropped" (Remplissage carré)
 */
const createCroppedSticker = async (media, options = {}) => {
  try {
    const sticker = new Sticker(media, {
      pack: options.pack || DEFAULT_PACK,
      author: options.author || DEFAULT_AUTH,
      type: StickerTypes.CROPPED,
      quality: 60
    });
    return await sticker.toBuffer();
  } catch (e) {
    throw new Error(`❌ [ᴀɢᴍ_ᴄʀᴏᴘ_ꜰᴀɪʟ]`);
  }
};

/**
 * Transformation Sticker -> Image (PNG)
 */
const stickerToImage = async (stickerBuffer) => {
  try {
    // Sharp assure une conversion propre vers un PNG transparent
    return await sharp(stickerBuffer)
      .png()
      .toBuffer();
  } catch (e) {
    throw new Error(`❌ [ᴀɢᴍ_ᴄᴏɴᴠᴇʀᴛ_ꜰᴀɪʟ]`);
  }
};

module.exports = {
  createStickerBuffer,
  createCroppedSticker,
  createCircleSticker,
  stickerToImage
};
