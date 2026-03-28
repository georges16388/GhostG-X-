/**
 * ᴀᴛᴛᴘ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ɢᴇɴᴇʀᴀᴛᴏʀ
 * ᴄʀᴇᴀᴛᴇ ᴀɴɪᴍᴀᴛᴇᴅ ᴛᴇxᴛ sᴛɪᴄᴋᴇʀs (ʙʟɪɴᴋɪɴɢ ᴇꜰꜰᴇᴄᴛ)
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { spawn } = require('child_process');
const { writeExifVid } = require('../../utils/exif');
const config = require('../../config');

module.exports = {
  name: 'attp',
  aliases: ['ttp', 'animtext'],
  category: 'general',
  description: 'ᴄʀᴇ́ᴇʀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴀɴɪᴍᴇ́ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅᴇ ᴛᴇxᴛᴇ.',
  usage: '.ᴀᴛᴛᴘ <ᴛᴇxᴛᴇ>',

  async execute(sock, msg, args, { from, reply, react, prefix }) {
    try {
      const text = args.join(' ');

            if (!text) {
        return await reply(
          `╭╼━≪• *ᴀᴛᴛᴘ ɢᴇɴᴇʀᴀᴛᴏʀ* •≫━╾╮\n` +
          `┃ *ᴜsᴀɢᴇ* : ${prefix}ᴀᴛᴛᴘ <ᴛᴇxᴛᴇ>\n` +
          `┃ *ᴇxᴇᴍᴘʟᴇ* : ${prefix}ᴀᴛᴛᴘ ɢʜᴏsᴛɢ-x\n` +
          `┃ *sᴛʏʟᴇ* : ᴀɴɪᴍᴀᴛᴇᴅ ʙʟɪɴᴋ 🌈\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n`
        );
      }


      if (text.length > 50) {
        return await reply('❌ *ᴛᴇxᴛᴇ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀx 50 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs).*');
      }

      await react('⏳');

      try {
        // ɢᴇ́ɴᴇ́ʀᴀᴛɪᴏɴ ᴅᴇ ʟᴀ ᴠɪᴅᴇ́ᴏ ᴄʟɪɢɴᴏᴛᴀɴᴛᴇ ᴠɪᴀ ꜰꜰᴍᴘᴇɢ
        const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
        
        // ᴀᴊᴏᴜᴛ ᴅᴇs ᴍᴇ́ᴛᴀᴅᴏɴɴᴇ́ᴇs ᴇxɪꜰ (ɴᴏᴍ ᴅᴜ ᴘᴀᴄᴋ)
        const webpBuffer = await writeExifVid(mp4Buffer, { 
            packname: '', 
            author: 'ɢʜᴏsᴛɢ-x ᴍᴅ' 
        });

        await sock.sendMessage(from, { sticker: webpBuffer }, { quoted: msg });
        await react('✅');

      } catch (error) {
        console.error('[ᴀᴛᴛᴘ ʀᴇɴᴅᴇʀ ᴇʀʀᴏʀ]:', error);
        await react('❌');
        await reply('❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ ɢᴇ́ɴᴇ́ʀᴀᴛɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ.*');
      }

    } catch (error) {
      console.error('[ᴀᴛᴛᴘ ᴄᴏᴍᴍᴀɴᴅ ᴇʀʀᴏʀ]:', error);
      await reply('❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ.*');
    }
  }
};

/**
 * ꜰᴏɴᴄᴛɪᴏɴ ᴅᴇ ʀᴇɴᴅᴜ ꜰꜰᴍᴘᴇɢ (ɴᴇ ᴘᴀs ᴍᴏᴅɪꜰɪᴇʀ sᴀᴜꜰ sɪ ʙᴇsᴏɪɴ)
 */
function renderBlinkingVideoWithFfmpeg(text) {
  return new Promise((resolve, reject) => {
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
    const dur = 1.8;

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
