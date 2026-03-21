/**
 * Multimedia Converter - AGM Media-Engine
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const config = require('../config'); // Lien avec ton .env via config

/**
 * Moteur FFmpeg Universel
 */
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      // Utilise le dossier temp défini ou celui par défaut
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tmp = path.join(tempDir, `${Date.now()}.${ext}`);
      const out = `${tmp}.${ext2}`;

      await fs.promises.writeFile(tmp, buffer);

      const process = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ]);

      process.on('error', (err) => {
        console.error('❌ [ᴀɢᴍ_ꜰꜰᴍᴘᴇɢ_ᴇʀʀᴏʀ] :', err.message);
        reject(err);
      });

      process.on('close', async (code) => {
        try {
          if (fs.existsSync(tmp)) await fs.promises.unlink(tmp);
          if (code !== 0) return reject(new Error(`ꜰꜰᴍᴘᴇɢ ᴇxɪᴛᴇᴅ ᴡɪᴛʜ ᴄᴏᴅᴇ ${code}`));
          
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
 * Convertir en Audio (MP3)
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '128k',
    '-ar', '44100'
  ], ext, 'mp3');
}

/**
 * Convertir en Note Vocale (PTT - Opus)
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
 * Convertir/Optimiser en Vidéo (MP4)
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'veryfast' // Plus rapide pour les serveurs
  ], ext, 'mp4');
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
};
