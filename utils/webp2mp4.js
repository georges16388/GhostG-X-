/**
 * WebP to PNG/MP4/GIF Converter - AGM Media-Reverse
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { getTempDir, deleteTempFile } = require('./tempManager');

/**
 * Sticker (WebP) -> Image (PNG)
 */
async function webp2png(webpBuffer) {
  try {
    const sharp = require('sharp');
    // On extrait la première frame au cas où le sticker est animé
    return await sharp(webpBuffer, { animated: false })
      .png()
      .toBuffer();
  } catch (err) {
    console.error('❌ [ᴀɢᴍ_ᴡᴇʙᴘ2ᴘɴɢ_ᴇʀʀᴏʀ] :', err.message);
    throw err;
  }
}

/**
 * Sticker Animé -> Vidéo (MP4)
 */
async function webp2mp4(webpBuffer) {
  const tempDir = getTempDir();
  const tid = Date.now();
  const inWebp = path.join(tempDir, `in_${tid}.webp`);
  const outMp4 = path.join(tempDir, `out_${tid}.mp4`);

  try {
    fs.writeFileSync(inWebp, webpBuffer);

    // Conversion directe via FFmpeg (Plus rapide que l'extraction frame par frame)
    const cmd = `"${ffmpegPath}" -v quiet -i "${inWebp}" -vf "fps=15,scale=512:-1:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -y "${outMp4}"`;
    
    await new Promise((resolve, reject) => {
      exec(cmd, (error) => error ? reject(error) : resolve());
    });

    const buffer = fs.readFileSync(outMp4);
    
    // Nettoyage
    [inWebp, outMp4].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    
    return buffer;
  } catch (err) {
    [inWebp, outMp4].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    console.error('❌ [ᴀɢᴍ_ᴡᴇʙᴘ2ᴍᴘ4_ᴇʀʀᴏʀ] :', err.message);
    throw err;
  }
}

/**
 * Sticker Animé -> GIF
 */
async function webp2gif(webpBuffer) {
  const tempDir = getTempDir();
  const tid = Date.now();
  const inWebp = path.join(tempDir, `in_${tid}.webp`);
  const outGif = path.join(tempDir, `out_${tid}.gif`);

  try {
    fs.writeFileSync(inWebp, webpBuffer);

    // Utilisation d'une palette de couleurs pour un GIF de haute qualité
    const palette = path.join(tempDir, `palette_${tid}.png`);
    const cmdPalette = `"${ffmpegPath}" -v quiet -i "${inWebp}" -vf "fps=15,scale=512:-1:flags=lanczos,palettegen" -y "${palette}"`;
    const cmdGif = `"${ffmpegPath}" -v quiet -i "${inWebp}" -i "${palette}" -filter_complex "fps=15,scale=512:-1:flags=lanczos[x];[x][1:v]paletteuse" -y "${outGif}"`;

    await new Promise((resolve, reject) => {
      exec(cmdPalette, (err) => {
        if (err) return reject(err);
        exec(cmdGif, (err2) => err2 ? reject(err2) : resolve());
      });
    });

    const buffer = fs.readFileSync(outGif);
    [inWebp, outGif, palette].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    return buffer;
  } catch (err) {
    console.error('❌ [ᴀɢᴍ_ᴡᴇʙᴘ2ɢɪꜰ_ᴇʀʀᴏʀ] :', err.message);
    throw err;
  }
}

module.exports = { webp2png, webp2gif, webp2mp4 };
