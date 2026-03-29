/**
 * Sticker Forge Engine - AGM Sticker-Forge
 * Architecture : FFmpeg + Webpmux (Anti-Sharp Dependency)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { Image } = require('node-webpmux');
const crypto = require('crypto');
const config = require('../config');

// --- PARAMÈTRES PAR DÉFAUT AGM ---
const DEFAULT_PACK = config.packname || '-ّ⸙𓆩ɢʜᴏꜱᴛɢ x 𓆪⸙-ّ';
const DEFAULT_AUTH = config.author || 'ɢʜᴏꜱᴛ-x';

/**
 * Génère les métadonnées EXIF pour le sticker (Nom du pack & Auteur)
 */
async function writeExif(buffer, packname, author) {
    const img = new Image();
    await img.load(buffer);
    const exif = {
        "sticker-pack-id": `ghostg-x-${crypto.randomBytes(8).toString('hex')}`,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": ["👑", "👻"]
    };
    const exifBuffer = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(exif), 'utf-8');
    const exifData = Buffer.concat([exifBuffer, jsonBuffer]);
    exifData.writeUInt32LE(jsonBuffer.length, 14);
    img.exif = exifData;
    return await img.save(null);
}

/**
 * Moteur de conversion universel via FFmpeg
 */
const convertToWebp = async (media, ffmpegFilters) => {
    const tmpFileIn = path.join('/tmp', `${crypto.randomBytes(10).toString('hex')}`);
    const tmpFileOut = path.join('/tmp', `${crypto.randomBytes(10).toString('hex')}.webp`);
    
    await fs.writeFile(tmpFileIn, media);

    return new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn)
            .on('error', (e) => reject(e))
            .on('end', async () => {
                const buffer = await fs.readFile(tmpFileOut);
                await fs.unlink(tmpFileIn);
                await fs.unlink(tmpFileOut);
                resolve(buffer);
            })
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", ffmpegFilters,
                "-lossless", "1",
                "-q:v", "60",
                "-loop", "0",
                "-preset", "picture",
                "-an", "-vsync", "0"
            ])
            .toFormat('webp')
            .save(tmpFileOut);
    });
};

/**
 * Création de Sticker Standard (Full)
 */
const createStickerBuffer = async (media, options = {}) => {
    try {
        // Redimensionnement avec padding pour garder le ratio (Full)
        const filter = "scale='if(gt(iw,ih),512,-1)':'if(gt(iw,ih),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=white@0";
        const webpBuffer = await convertToWebp(media, filter);
        return await writeExif(webpBuffer, options.pack || DEFAULT_PACK, options.author || DEFAULT_AUTH);
    } catch (e) {
        throw new Error(`❌ [ᴀɢᴍ_ꜱᴛɪᴄᴋᴇʀ_ꜰᴀɪʟ] : ${e.message}`);
    }
};

/**
 * Sticker Style "Cropped" (Carré forcé)
 */
const createCroppedSticker = async (media, options = {}) => {
    try {
        const filter = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512";
        const webpBuffer = await convertToWebp(media, filter);
        return await writeExif(webpBuffer, options.pack || DEFAULT_PACK, options.author || DEFAULT_AUTH);
    } catch (e) {
        throw new Error(`❌ [ᴀɢᴍ_ᴄʀᴏᴘ_ꜰᴀɪʟ]`);
    }
};

/**
 * Sticker Style "Cercle"
 */
const createCircleSticker = async (media, options = {}) => {
    try {
        // Filtre complexe pour masquer en cercle
        const filter = "scale=512:512,format=rgba,geq=lum='p(X,Y)':a='if(gt(hypot(X-256,Y-256),256),0,255)'";
        const webpBuffer = await convertToWebp(media, filter);
        return await writeExif(webpBuffer, options.pack || DEFAULT_PACK, options.author || DEFAULT_AUTH);
    } catch (e) {
        throw new Error(`❌ [ᴀɢᴍ_ᴄɪʀᴄʟᴇ_ꜰᴀɪʟ]`);
    }
};

/**
 * Transformation Sticker -> Image (PNG)
 */
const stickerToImage = async (stickerBuffer) => {
    const tmpFileIn = path.join('/tmp', `${crypto.randomBytes(10).toString('hex')}`);
    const tmpFileOut = path.join('/tmp', `${crypto.randomBytes(10).toString('hex')}.png`);
    
    await fs.writeFile(tmpFileIn, stickerBuffer);

    return new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn)
            .on('error', (e) => reject(e))
            .on('end', async () => {
                const buffer = await fs.readFile(tmpFileOut);
                await fs.unlink(tmpFileIn);
                await fs.unlink(tmpFileOut);
                resolve(buffer);
            })
            .toFormat('png')
            .save(tmpFileOut);
    });
};

module.exports = {
    createStickerBuffer,
    createCroppedSticker,
    createCircleSticker,
    stickerToImage
};
