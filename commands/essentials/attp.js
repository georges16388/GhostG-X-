/**
 * ATTP - Animated Text to Picture Sticker
 * Full GhostG-X Edition
 */

const { spawn } = require('child_process');
const { writeExifVid } = require('../../utils/exif'); // Vérifie bien que ce chemin est correct
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'attp',
  aliases: ['ttp'],
  category: 'essentials',
  description: 'Crée un sticker animé à partir d\'un texte.',
  usage: '<texte>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      if (!text) {
        return extra.reply(`╭╼━≪• ɢʜᴏsᴛ ᴀᴛᴛᴘ •≫━╾╮\n┃ ᴜsᴀɢᴇ : ${extra.prefix || '.'}ᴀᴛᴛᴘ <ᴛᴇxᴛᴇ>\n╰━━━━━━━━━━━━━━━╯`);
      }

      if (text.length > 50) return extra.reply('⚠️ *Texte trop long !*');

      await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });

      // Génération de la vidéo via FFmpeg
      const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);

      // Conversion en Sticker avec tes métadonnées
      const webpBuffer = await writeExifVid(mp4Buffer, { 
          packname: '-ɢʜᴏꜱᴛɢ x 𓆪⸙-', 
          author: 'ɢʜᴏꜱᴛ-x' 
      });

      await sock.sendMessage(extra.from, { sticker: webpBuffer }, { quoted: msg });

    } catch (error) {
      console.error('ATTP Error:', error);
      await extra.reply('❌ Erreur lors de la création du sticker.');
    }
  }
};

/**
 * Moteur de rendu FFmpeg pour texte clignotant
 */
function renderBlinkingVideoWithFfmpeg(text) {
  return new Promise((resolve, reject) => {
    // Sur téléphone (Termux), les polices sont souvent ici, sinon on utilise 'sans'
    const font = "/system/fonts/Roboto-Bold.ttf"; 
    const output = path.join(__dirname, `../../temp/attp_${Date.now()}.mp4`);
    
    // Commande FFmpeg : crée un texte qui change de couleur 10 fois par seconde
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi', '-i', 'color=c=black:s=512x512:d=2', // Fond noir 512x512
      '-vf', `drawtext=text='${text}':fontfile=${font}:fontcolor='if(lt(mod(t,0.2),0.1),white,cyan)':fontsize=50:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-pix_fmt', 'yuv420p',
      '-y', output
    ]);

    ffmpeg.on('close', async (code) => {
      if (code === 0 && fs.existsSync(output)) {
        const buffer = fs.readFileSync(output);
        fs.unlinkSync(output); // Nettoyage
        resolve(buffer);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => reject(err));
  });
}
