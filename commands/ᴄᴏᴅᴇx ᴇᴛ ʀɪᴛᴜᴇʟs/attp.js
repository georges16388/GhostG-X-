/**
 * ATTP - Animated Text to Picture Sticker
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { writeExifVid } = require('../../utils/exif');

module.exports = {
  name: 'effet', // 💡 Passage en texte brut pour éviter les bugs de lecture !
  aliases: ['ttp', 'attp', 'effet', 'ᴇғғᴇᴛ'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: 'Creer un sticker animé',
  usage: '.effet <text>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇ́ᴄɪғɪᴇʀ ᴜɴ ᴛᴇxᴛᴇ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${extra.prefix || '.'}effet Bonjour* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      let text = args.join(' ');
      
      // 🛡️ Traducteur SmallCaps -> Texte normal au cas où l'utilisateur écrit en SmallCaps
      const normalMap = { 'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ғ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ǫ': 'q', 'ʀ': 'r', 's': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'x': 'x', 'ʏ': 'y', 'ᴢ': 'z' };
      text = text.split('').map(char => normalMap[char] || char).join('');
      
      if (text.length > 50) {
        return extra.reply(`❌ *ʟᴇ ᴛᴇxᴛᴇ ᴇsᴛ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀxɪᴍᴜᴍ 𝟻𝟶 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs).* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Message d'attente stylisé
      await extra.reply('*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ des couleurs magiques...*');
      
      try {
        const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
        const webpBuffer = await writeExifVid(mp4Buffer, { packname: 'GhostG-X' });
        await sock.sendMessage(extra.from, { sticker: webpBuffer }, { quoted: msg });
      } catch (error) {
        console.error('Error generating attp sticker:', error);
        await extra.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ ɢᴇ́ɴᴇ́ʀᴀᴛɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    } catch (error) {
      console.error('ATTP command error:', error);
      await extra.reply(`❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ ʟᴏʀs ᴅᴇ ʟᴀ ᴄʀᴇ́ᴀᴛɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};

function renderBlinkingVideoWithFfmpeg(text) {
  return new Promise((resolve, reject) => {
    // Détection de la police selon l'OS
    const fontPath = process.platform === 'win32'
      ? 'C:/Windows/Fonts/arialbd.ttf'
      : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

    const escapeDrawtextText = (s) => s
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,')
      .replace(/'/g, "\\'")
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/%/g, '\\%');

    const safeText = escapeDrawtextText(text);
    const safeFontPath = process.platform === 'win32'
      ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
      : fontPath;

    const cycle = 0.3;
    const dur = 1.8; // 6 cycles

    const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\\,${cycle})\\,0.1)'`;
    const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;
    const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\\,${cycle})\\,0.2)'`;

    const filter = `${drawRed},${drawBlue},${drawGreen}`;

    const args = [
      '-y',
      '-f', 'lavfi',
      '-i', `color=c=black:s=512x512:d=${dur}:r=20`,
      '-vf', filter,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart+frag_keyframe+empty_moov',
      '-t', String(dur),
      '-f', 'mp4',
      'pipe:1'
    ];

    const ff = spawn('ffmpeg', args);
    const chunks = [];
    const errors = [];
    ff.stdout.on('data', d => chunks.push(d));
    ff.stderr.on('data', e => errors.push(e));
    ff.on('error', reject);
    ff.on('close', code => {
      if (code === 0) return resolve(Buffer.concat(chunks));
      reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
    });
  });
}
