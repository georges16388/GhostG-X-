/**
 * Instagram to Sticker - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - High Performance
 */

const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
    if (!text) return "";
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (status, count) => `*╭╼━≪• ${toStyledCaps('ɪɢ ᴛᴏ sᴛɪᴄᴋᴇʀ')} •≫━╾╮*
*┃* *┃* ✅ ${toStyledCaps('sᴛᴀᴛᴜs')} : ${toStyledCaps(status)}
*┃* 📸 ${toStyledCaps('ɪᴛᴇᴍs')} : ${count}
*┃* ⚡ ${toStyledCaps('ᴍᴏᴅᴇ')} : ${toStyledCaps('sᴍᴀʀᴛ-ғɪᴛ')}
*┃* *╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

async function convertToSticker(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = os.tmpdir();
  const timestamp = Date.now() + Math.random().toString(36).substring(7);
  const tempInput = path.join(tmpDir, `igs_in_${timestamp}${isAnimated ? '.mp4' : '.jpg'}`);
  const tempOutput = path.join(tmpDir, `igs_out_${timestamp}.webp`);

  try {
    fs.writeFileSync(tempInput, inputBuffer);

    // Filtres FFmpeg optimisés
    const filter = cropSquare 
      ? "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512:flags=lanczos"
      : "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const ffmpegCmd = isAnimated
      ? `ffmpeg -y -i "${tempInput}" -t 6 -vf "${filter},fps=15" -c:v libwebp -lossless 0 -compression_level 4 -q:v 40 -loop 0 -preset default -an -vsync 0 "${tempOutput}"`
      : `ffmpeg -y -i "${tempInput}" -vf "${filter}" -c:v libwebp -q:v 75 "${tempOutput}"`;

    await new Promise((resolve, reject) => exec(ffmpegCmd, (err) => err ? reject(err) : resolve()));

    return fs.readFileSync(tempOutput);
  } catch (e) {
    console.error("FFmpeg Error:", e);
    return null;
  } finally {
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
  }
}

module.exports = {
  name: 'igs',
  aliases: ['igsc', 'igsticker'],
  category: 'media',
  description: 'Convertir Instagram en Sticker (igs: fit | igsc: crop)',

  async execute(sock, msg, args, extra) {
    const from = extra.from;
    const text = args.join(' ');
    
    try {
      const urlMatch = text.match(/https?:\/\/(www\.)?instagram\.com\/(?:p|reels|reel|tv)\/([^\s/?#&]+)/i);
      if (!urlMatch) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ sᴀɪsɪʀ ᴜɴ ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ")}*`);
      }

      const url = urlMatch[0];
      const isCrop = (extra.command || '').toLowerCase().startsWith('igsc');

      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      const res = await igdl(url);
      if (!res || !res.data || res.data.length === 0) throw new Error('No media');

      const items = res.data.slice(0, 3); // Limité à 3 pour éviter les bannissements WhatsApp
      await extra.reply(AGM_DESIGN("ᴘʀᴏᴄᴇssɪɴɢ", items.length));

      for (const item of items) {
        try {
          const mediaUrl = item.url || item.downloadUrl || item;
          if (typeof mediaUrl !== 'string') continue;

          const isVideo = item.type === 'video' || mediaUrl.includes('.mp4');
          const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data);

          const stickerBuffer = await convertToSticker(buffer, isVideo, isCrop);
          
          if (stickerBuffer) {
            await sock.sendMessage(from, { 
              sticker: stickerBuffer,
              contextInfo: {
                externalAdReply: {
                  title: "ɢʜᴏsᴛɢ-x sᴛɪᴄᴋᴇʀ",
                  body: "ɪɴsᴛᴀɢʀᴀᴍ ᴄᴏɴᴠᴇʀᴛᴇʀ",
                  mediaType: 1,
                  thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                  showAdAttribution: false
                }
              }
            }, { quoted: msg });
          }
        } catch (e) { continue; }
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (err) {
      console.error('[IGS ERROR]:', err);
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴄᴏɴᴠᴇʀsɪᴏɴ")}*`);
    }
  }
};
