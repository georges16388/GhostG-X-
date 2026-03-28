/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Media Converter System
 * Powered by FFmpeg & Knight Bot Core
 * Optimized by Gemini - Powered by ɢʜᴏsᴛɢ-𝐗
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Moteur FFmpeg de base
 */
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      // Utilisation du dossier temp centralisé pour le Cleanup System
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tmp = path.join(tempDir, `ghostgx_${Date.now()}.${ext}`);
      const out = `${tmp}.${ext2}`;

      await fs.promises.writeFile(tmp, buffer);

      const ffmpegProcess = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ]);

      ffmpegProcess.on('error', (err) => {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        reject(err);
      });

      ffmpegProcess.on('close', async (code) => {
        try {
          if (fs.existsSync(tmp)) await fs.promises.unlink(tmp);
          if (code !== 0) return reject(new Error(`FFmpeg exited with code ${code}`));

          const result = await fs.promises.readFile(out);
          if (fs.existsSync(out)) await fs.promises.unlink(out);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convertir en Audio MP3 (Haute Qualité)
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '192k', // Augmenté pour un son plus "Premium"
    '-ar', '44100',
    '-f', 'mp3'
  ], ext, 'mp3');
}

/**
 * Convertir en Note Vocale (PTT Opus)
 * Parfait pour simuler un enregistrement direct
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

/**
 * Convertir en Vidéo MP4 (Optimisée WhatsApp)
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '28', // Meilleur équilibre qualité/poids que 32
    '-preset', 'faster', // Plus rapide pour le VPS
    '-pix_fmt', 'yuv420p' // Compatibilité maximale téléphones
  ], ext, 'mp4');
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
};
