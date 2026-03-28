/**
 * Instagram to Sticker - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (status, count) => `╭╼━≪• *ɪɢ ᴛᴏ sᴛɪᴄᴋᴇʀ* •≫━╾╮
┃ 
┃ ✅ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps(status)}
┃ 📸 ${toSmallCaps('ɪᴛᴇᴍs')} : ${count}
┃ ⚡ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps('sᴍᴀʀᴛ-ғɪᴛ')}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

async function convertToSticker(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = getTempDir();
  const timestamp = Date.now();
  const tempInput = path.join(tmpDir, `igs_in_${timestamp}${isAnimated ? '.mp4' : '.jpg'}`);
  const tempOutput = path.join(tmpDir, `igs_out_${timestamp}.webp`);

  try {
    fs.writeFileSync(tempInput, inputBuffer);

    // Filtres FFmpeg : Crop (Carré) vs Pad (Garder les proportions)
    const filter = cropSquare 
      ? "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512"
      : "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const ffmpegCmd = isAnimated
      ? `ffmpeg -y -i "${tempInput}" -t 5 -vf "${filter},fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 40 -compression_level 6 -b:v 200k "${tempOutput}"`
      : `ffmpeg -y -i "${tempInput}" -vf "${filter},format=rgba" -c:v libwebp -quality 75 "${tempOutput}"`;

    await new Promise((resolve, reject) => exec(ffmpegCmd, (err) => err ? reject(err) : resolve()));

    const img = new webp.Image();
    const resultBuffer = fs.readFileSync(tempOutput);
    await img.load(resultBuffer);

    // --- MÉTADONNÉES PRESTIGE GHOSTG-X ---
    const exifData = {
      "sticker-pack-id": crypto.randomBytes(32).toString('hex'),
      "sticker-pack-name": "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
      "sticker-pack-publisher": "ɢʜᴏsᴛɢ-𝐗",
      "emojis": ["🔥", "📸"]
    };

    const exif = Buffer.concat([
      Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]),
      Buffer.from(JSON.stringify(exifData), 'utf-8')
    ]);
    exif.writeUIntLE(Buffer.from(JSON.stringify(exifData), 'utf-8').length, 14, 4);
    img.exif = exif;

    return await img.save(null);
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
    try {
      const url = args[0] || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);
      const isCrop = msg.body.toLowerCase().startsWith('.igsc');

      if (!url || !/instagram.com/.test(url)) {
        const usage = toSmallCaps("usage : .igs <url> ou .igsc <url>");
        return extra.reply(`⚠️ *${usage}*`);
      }

      await sock.sendMessage(extra.from, { react: { text: '⏳', key: msg.key } });

      const res = await igdl(url);
      if (!res || !res.data) throw new Error('No media');

      const items = res.data.slice(0, 5); // Protection anti-spam
      await extra.reply(AGM_DESIGN("ᴘʀᴏᴄᴇssɪɴɢ", items.length));

      for (const item of items) {
        const mediaUrl = item.url || item.downloadUrl;
        const isVideo = item.type === 'video' || (mediaUrl && mediaUrl.includes('.mp4'));

        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        const sticker = await convertToSticker(buffer, isVideo, isCrop);
        await sock.sendMessage(extra.from, { sticker }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (err) {
      console.error(err);
      const fail = toSmallCaps("echec de la conversion instagram");
      await extra.reply(`❌ *${fail}*`);
    }
  }
};
