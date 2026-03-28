/**
 * Sticker Command - AGM Prestige Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const webp = require('node-webpmux');
const ffmpegPath = require('ffmpeg-static');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM (GRAS & SMALLCAPS) ---
const AGM_DESIGN = (type) => {
  // On retire la ligne "> Powered by" ici pour éviter le doublon avec le handler
  return `*╭╼━≪• ${toStyledCaps('sᴛɪᴄᴋᴇʀ ᴍᴀᴋᴇʀ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ɢᴇɴᴇʀᴀᴛᴇᴅ')}*
*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* 🛡️ *${toStyledCaps('ɢᴜᴀʀᴅ')}* : *${toStyledCaps('ᴀᴄᴛɪᴠᴇ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*`;
};

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stc'],
  category: 'media',
  description: 'Convertir image ou vidéo en sticker avec EXIF personnalisé',
  usage: '.sticker (répondez à un média)',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    let targetMessage = msg;

    try {
      // 1. Détection du message cité
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      if (ctxInfo?.quotedMessage) {
        targetMessage = {
          key: { remoteJid: chatId, id: ctxInfo.stanzaId, participant: ctxInfo.participant },
          message: ctxInfo.quotedMessage,
        };
      }

      const isImage = targetMessage.message?.imageMessage;
      const isVideo = targetMessage.message?.videoMessage;

      if (!isImage && !isVideo) {
        return extra.reply(`⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴠɪᴅᴇᴏ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: "🎨", key: msg.key } });

      // 2. Préparation des fichiers temporaires
      const tempInput = path.join(__dirname, `../../temp/in_${Date.now()}`);
      const tempOutput = path.join(__dirname, `../../temp/out_${Date.now()}.webp`);

      const mediaBuffer = await downloadMediaMessage(
        targetMessage, 
        'buffer', 
        {}, 
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );
      
      fs.writeFileSync(tempInput, mediaBuffer);

      // 3. Conversion via FFmpeg (Optimisé pour Stickers WhatsApp)
      const ffmpegCmd = `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => err ? reject(err) : resolve());
      });

      // 4. Ajout des métadonnées (EXIF) - TRUTH DEVICES
      const img = new webp.Image();
      await img.load(fs.readFileSync(tempOutput));

      const json = {
        'sticker-pack-name': "ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs",
        'sticker-pack-publisher': "ɢʜᴏsᴛɢ-𝐗",
        'emojis': ['👻']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      // 5. Envoi du Sticker et de la confirmation designée
      await sock.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });
      
      const typeLabel = isVideo ? 'ᴀɴɪᴍᴀᴛᴇᴅ' : 'sᴛᴀᴛɪᴄ';
      await extra.reply(AGM_DESIGN(typeLabel));

      // Nettoyage
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

    } catch (error) {
      console.error('Sticker Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴄʀᴇᴀᴛɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ')}*`);
    }
  },
};
