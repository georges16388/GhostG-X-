/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - WebP Sticker Converter
 * High-Performance Image & Video Processing
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const sharp = require('sharp');

/**
 * Convertir WebP en PNG (Sticker -> Photo)
 */
async function webp2png(webpBuffer) {
  try {
    // Sharp est 10x plus rapide que FFmpeg pour le statique
    return await sharp(webpBuffer).png().toBuffer();
  } catch (e) {
    console.error('[CONVERT ERROR]: Sharp failed, fallback to FFmpeg');
    // Fallback FFmpeg si Sharp échoue sur certains formats WebP exotiques
    return await ffmpegExecute(webpBuffer, 'png', [
      '-vf', 'select=eq(n\\,0)', 
      '-frames:v', '1'
    ]);
  }
}

/**
 * Convertir WebP animé en GIF
 */
async function webp2gif(webpBuffer) {
  const tempDir = path.join(__dirname, '../temp');
  const id = `ghost_gif_${Date.now()}`;
  const input = path.join(tempDir, `${id}.webp`);
  const output = path.join(tempDir, `${id}.gif`);

  try {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    await fs.promises.writeFile(input, webpBuffer);

    // Commande FFmpeg optimisée pour les palettes de couleurs GIF (évite l'effet grain)
    const cmd = `"${ffmpegPath}" -i "${input}" -vf "fps=15,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -y "${output}"`;
    
    await execPromise(cmd);
    const buffer = await fs.promises.readFile(output);
    
    // Nettoyage immédiat
    [input, output].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    return buffer;
  } catch (e) {
    throw new Error('[CONVERT ERROR]: Échec WebP to GIF');
  }
}

/**
 * Convertir WebP animé en MP4 (Sticker -> Vidéo)
 */
async function webp2mp4(webpBuffer) {
  const tempDir = path.join(__dirname, '../temp');
  const id = `ghost_vid_${Date.now()}`;
  const input = path.join(tempDir, `${id}.webp`);
  const output = path.join(tempDir, `${id}.mp4`);

  try {
    await fs.promises.writeFile(input, webpBuffer);

    // Paramètres optimisés pour la lecture WhatsApp (YUV420P)
    const cmd = `"${ffmpegPath}" -i "${input}" -pix_fmt yuv420p -c:v libx264 -crf 25 -preset faster -y "${output}"`;
    
    await execPromise(cmd);
    const buffer = await fs.promises.readFile(output);
    
    [input, output].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    return buffer;
  } catch (e) {
    throw new Error('[CONVERT ERROR]: Échec WebP to MP4');
  }
}

/**
 * Utilitaires internes
 */
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => err ? reject(err) : resolve());
  });
}

async function ffmpegExecute(buffer, ext, args) {
  const tempDir = path.join(__dirname, '../temp');
  const input = path.join(tempDir, `in_${Date.now()}.webp`);
  const output = path.join(tempDir, `out_${Date.now()}.${ext}`);
  
  await fs.promises.writeFile(input, buffer);
  const cmd = `"${ffmpegPath}" -i "${input}" ${args.join(' ')} "${output}"`;
  
  await execPromise(cmd);
  const result = await fs.promises.readFile(output);
  
  [input, output].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  return result;
}

module.exports = { webp2png, webp2gif, webp2mp4 };
