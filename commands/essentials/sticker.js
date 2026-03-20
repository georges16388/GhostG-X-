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
const config = require('../../config');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (type) => `╭╼━≪• sᴛɪᴄᴋᴇʀ ᴍᴀᴋᴇʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ɢᴇɴᴇʀᴀᴛᴇᴅ
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} ⚡
┃ ɢᴜᴀʀᴅ : 🛡️ ᴀᴄᴛɪᴠᴇ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stc'],
  description: 'Convert image or video to sticker with custom EXIF',
  usage: '.sticker (reply to media)',
  category: 'media',
  
  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    let targetMessage = msg;
    
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: { remoteJid: chatId, id: ctxInfo.stanzaId, participant: ctxInfo.participant },
        message: ctxInfo.quotedMessage,
      };
    }
    
    const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage;
    
    if (!mediaMessage) {
      return extra.reply('⚠️ *ʀéᴘᴏɴᴅᴇᴢ à ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴠɪᴅéᴏ ᴀᴠᴇᴄ .sᴛɪᴄᴋᴇʀ*');
    }

    await sock.sendMessage(chatId, { react: { text: "🎨", key: msg.key } });
    
    const tempDir = getTempDir();
    const timestamp = Date.now();
    const tempInput = path.join(tempDir, `in_${timestamp}`);
    const tempOutput = path.join(tempDir, `out_${timestamp}.webp`);
    let tempFiles = [tempInput, tempOutput];
    
    try {
      const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
      if (!mediaBuffer) throw new Error('Download failed');
      
      fs.writeFileSync(tempInput, mediaBuffer);
      
      const isAnimated = mediaMessage.mimetype?.includes('gif') || mediaMessage.mimetype?.includes('video');
      
      // FFmpeg command with high quality compression
      const ffmpegCmd = `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`;
      
      await new Promise((resolve, reject) => exec(ffmpegCmd, (err) => (err ? reject(err) : resolve())));
      
      const img = new webp.Image();
      await img.load(fs.readFileSync(tempOutput));
      
      // --- CONFIGURATION DU NOM DU PACK (GHOSTG-X) ---
      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ", // NOM DU PACK
        'sticker-pack-publisher': "ɢʜᴏsᴛɢ 𝐗", // NOM DE L'AUTEUR
        'emojis': ['👻', '🔥']
      };
      
      const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);
      
      img.exif = exif;
      const finalBuffer = await img.save(null);
      
      // Envoi du Sticker
      await sock.sendMessage(chatId, { sticker: finalBuffer }, { quoted: msg });

      // Envoi du design AGM en confirmation
      await extra.reply(AGM_DESIGN(isAnimated ? 'animated' : 'static'));

    } catch (error) {
      console.error('Sticker Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    } finally {
      tempFiles.forEach(file => deleteTempFile(file));
    }
  },
};
