/**
 * Sticker Command - GhostG-X MD (Silent Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const webp = require('node-webpmux');
const ffmpegPath = require('ffmpeg-static');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stc'],
  category: 'media',
  description: 'Convertir image ou vidéo en sticker.',
  usage: '.sticker',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    
    // Détection du message (direct ou cité)
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = msg.message?.imageMessage || quoted?.imageMessage;
    const isVideo = msg.message?.videoMessage || quoted?.videoMessage;

    if (!isImage && !isVideo) {
      return extra.reply(`⚠️ *${toStyledCaps('repondez a une image ou video')}*`);
    }

    try {
      await sock.sendMessage(chatId, { react: { text: "🎨", key: msg.key } });

      // Création du dossier temp s'il n'existe pas
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const tempInput = path.join(tempDir, `in_${Date.now()}`);
      const tempOutput = path.join(tempDir, `out_${Date.now()}.webp`);

      // Téléchargement sécurisé
      const mediaMsg = quoted ? { message: quoted } : msg;
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, { 
        logger: undefined, 
        reuploadRequest: sock.updateMediaMessage 
      });

      fs.writeFileSync(tempInput, buffer);

      // FFmpeg : Optimisé pour Katabump (CPU friendly)
      const ffmpegCmd = `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => err ? reject(err) : resolve());
      });

      // Injection Métadonnées (Truth Devices)
      const img = new webp.Image();
      await img.load(fs.readFileSync(tempOutput));

      const exifData = {
        'sticker-pack-id': `ghostg-${Date.now()}`,
        'sticker-pack-name': "ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs 💠",
        'sticker-pack-publisher': "ɢʜᴏsᴛɢ-𝐗",
        'emojis': ['👻']
      };

      const exifBuffer = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(exifData), 'utf-8');
      const exif = Buffer.concat([exifBuffer, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      // Envoi Final
      await sock.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });
      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

      // Nettoyage immédiat
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

    } catch (error) {
      console.error('Sticker Error:', error);
      await extra.reply(`❌ *${toStyledCaps("erreur lors de la conversion")}*`);
    }
  },
};
