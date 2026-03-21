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
const config = require('../../config');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (status, count) => `╭╼━≪• ɪɢ ᴛᴏ sᴛɪᴄᴋᴇʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status}
┃ ɪᴛᴇᴍs : ${count} 📸
┃ ᴍᴏᴅᴇ : sᴍᴀʀᴛ-ғɪᴛ ⚡
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

async function convertToSticker(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = getTempDir();
  const timestamp = Date.now();
  const tempInput = path.join(tmpDir, `igs_in_${timestamp}${isAnimated ? '.mp4' : '.jpg'}`);
  const tempOutput = path.join(tmpDir, `igs_out_${timestamp}.webp`);

  try {
    fs.writeFileSync(tempInput, inputBuffer);

    // Filtres FFmpeg : Crop vs Pad
    const filter = cropSquare 
      ? "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512"
      : "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const ffmpegCmd = isAnimated
      ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "${filter},fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 40 -compression_level 6 -b:v 200k "${tempOutput}"`
      : `ffmpeg -y -i "${tempInput}" -vf "${filter},format=rgba" -c:v libwebp -quality 75 "${tempOutput}"`;

    await new Promise((resolve, reject) => exec(ffmpegCmd, (err) => err ? reject(err) : resolve()));

    const img = new webp.Image();
    await img.load(fs.readFileSync(tempOutput));

    // --- MÉTADONNÉES PRESTIGE GHOSTG-X ---
    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
      'sticker-pack-publisher': "ɢʜᴏsᴛɢ 𝐗",
      'emojis': ['📸', '🔥']
    };

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;

    return await img.save(null);
  } finally {
    deleteTempFile(tempInput);
    deleteTempFile(tempOutput);
  }
}

async function handleIgSticker(sock, msg, args, extra, crop = false) {
  const url = args[0] || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);
  if (!url || !/instagram.com/.test(url)) {
    return extra.reply(`⚠️ *ᴜsᴀɢᴇ : .ɪɢs <ᴜʀʟ> ᴏᴜ .ɪɢsᴄ <ᴜʀʟ>*`);
  }

  await sock.sendMessage(extra.from, { react: { text: '⏳', key: msg.key } });

  try {
    const res = await igdl(url);
    if (!res || !res.data) throw new Error('No media');

    const items = res.data.slice(0, 5); // Limite à 5 stickers pour éviter le spam
    await extra.reply(AGM_DESIGN("🟢 ᴘʀᴏᴄᴇssɪɴɢ", items.length));

    for (const item of items) {
      const mediaUrl = item.url || item.downloadUrl;
      const isVideo = item.type === 'video';
      
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      
      const sticker = await convertToSticker(buffer, isVideo, crop);
      await sock.sendMessage(extra.from, { sticker }, { quoted: msg });
    }

    await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

  } catch (err) {
    console.error(err);
    await extra.reply("❌ *éᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴄᴏɴᴠᴇʀsɪᴏɴ ɪɴsᴛᴀɢʀᴀᴍ.*");
  }
}

module.exports = {
  name: 'igs',
  aliases: ['igsc', 'igsticker'],
  category: 'media',
  description: 'Convert Instagram to Sticker (igs: fit | igsc: crop)',
  
  async execute(sock, msg, args, extra) {
    const isCrop = msg.body.toLowerCase().startsWith('.igsc');
    await handleIgSticker(sock, msg, args, extra, isCrop);
  }
};
