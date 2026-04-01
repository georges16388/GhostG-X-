/**
 * Crop Command
 * Crop any sticker/image/video into a perfect square sticker (animated for videos)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const config = require('../../config.js');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const getQuotedMessage = (message) =>
  message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
  message.message?.buttonsResponseMessage?.contextInfo?.quotedMessage ||
  message.message?.listResponseMessage?.contextInfo?.quotedMessage ||
  null;

const resolveMedia = (message) => {
  const messageType = Object.keys(message.message || {})[0];
  if (messageType === 'imageMessage' || messageType === 'stickerMessage' || messageType === 'videoMessage' || messageType === 'documentMessage') {
    return { type: messageType, media: message.message[messageType] };
  }
  const quoted = getQuotedMessage(message);
  if (!quoted) return null;
  const quotedType = Object.keys(quoted || {})[0];
  if (quotedType === 'imageMessage' || quotedType === 'stickerMessage' || quotedType === 'videoMessage' || quotedType === 'documentMessage') {
    return { type: quotedType, media: quoted[quotedType] };
  }
  return null;
};

module.exports = {
  name: 'crop', // 💡 Passage en texte brut pour assurer la réactivité !
  aliases: ['square', 'cropper', 'cisaille', 'ᴄɪsᴀɪʟʟᴇ', 'cr'],
  description: 'couper un sticker/image/video en un parfait sticker carré  (animé pour les videos)',
  usage: '.crop (répond à un sticker/image/video)',
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  
  async execute(sock, msg, args, extra) {
    // Declare temp files outside try block so they're available in finally
    const tmpDir = getTempDir();
    const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
    const tempOutput = path.join(tmpDir, `crop_${Date.now()}.webp`);
    const tempFiles = [tempInput, tempOutput];
    
    try {
      // The message that will be quoted in the reply
      const messageToQuote = msg;
      
      // The message object that contains the media to be downloaded
      let targetMessage = msg;

      // If the message is a reply, the target media is in the quoted message
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedInfo = msg.message.extendedTextMessage.contextInfo;
        targetMessage = {
          key: {
            remoteJid: extra.from,
            id: quotedInfo.stanzaId,
            participant: quotedInfo.participant
          },
          message: quotedInfo.quotedMessage
        };
      }

      const mediaInfo = resolveMedia(targetMessage);
      
      if (!mediaInfo) {
        return extra.reply('✂️ *ᴠᴇᴜɪʟʟᴇᴢ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴ sᴛɪᴄᴋᴇʀ, ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴᴇ ᴠɪᴅᴇ́ᴏ ᴀ̀ ᴛᴀɪʟʟᴇʀ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      }

      const { type, media } = mediaInfo;
      const mediaMessage = media;

      if (!mediaMessage) {
        return extra.reply(`✂️ *ᴠᴇᴜɪʟʟᴇᴢ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴ ᴍᴇ́ᴅɪᴀ ᴀᴠᴇᴄ .crop, ᴏᴜ ʟ'ᴇɴᴠᴏʏᴇʀ ᴀᴠᴇᴄ .crop ᴇɴ ʟᴇ́ɢᴇɴᴅᴇ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Download media
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      if (!mediaBuffer) {
        return extra.reply('❌ *ᴇ́ᴄʜᴇᴄ ᴅᴜ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴜ ᴍᴇ́ᴅɪᴀ. ᴠᴇᴜɪʟʟᴇᴢ ʀᴇ́ᴇssᴀʏᴇʀ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      }

      // Check file size
      if (mediaBuffer.length > MAX_FILE_SIZE) {
        return extra.reply(`❌ *ғɪᴄʜɪᴇʀ ᴛʀᴏᴘ ᴠᴏʟᴜᴍɪɴᴇᴜx :* ${(mediaBuffer.length / 1024 / 1024).toFixed(2)}MB (max: ${MAX_FILE_SIZE / 1024 / 1024}MB) \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Notification d'attente
      await extra.reply('*☬ ᴄɪsᴀɪʟʟᴇᴍᴇɴᴛ en cours... Veuillez patienter.*');

      // Write media to temp file
      fs.writeFileSync(tempInput, mediaBuffer);

      // Check if media is animated (GIF or video)
      const isAnimated = mediaMessage.mimetype?.includes('gif') || 
                        mediaMessage.mimetype?.includes('video') || 
                        mediaMessage.seconds > 0 ||
                        type === 'videoMessage';

      // Get file size to determine compression level
      const fileSizeKB = mediaBuffer.length / 1024;
      const isLargeFile = fileSizeKB > 5000; // 5MB threshold

      // Convert to WebP using ffmpeg with crop to square
      let ffmpegCommand;
      
      if (isAnimated) {
        if (isLargeFile) {
          ffmpegCommand = `ffmpeg -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;
        } else {
          ffmpegCommand = `ffmpeg -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
        }
      } else {
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
      }

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('FFmpeg error:', error);
            console.error('FFmpeg stderr:', stderr);
            reject(error);
          } else {
            console.log('FFmpeg stdout:', stdout);
            resolve();
          }
        });
      });

      if (!fs.existsSync(tempOutput)) {
        throw new Error('FFmpeg failed to create output file');
      }

      const outputStats = fs.statSync(tempOutput);
      if (outputStats.size === 0) {
        throw new Error('FFmpeg created empty output file');
      }

      let webpBuffer = fs.readFileSync(tempOutput);
      
      const finalSizeKB = webpBuffer.length / 1024;
      console.log(`Final sticker size: ${Math.round(finalSizeKB)} KB`);
      
      if (finalSizeKB > 1000) {
        console.log(`⚠️ Warning: Sticker size (${Math.round(finalSizeKB)} KB) exceeds recommended limit but will be sent anyway`);
      }

      // Add metadata using webpmux
      const img = new webp.Image();
      await img.load(webpBuffer);

      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': config.packname || 'ɢʜᴏsᴛɢ-𝐗',
        'emojis': ['✂️']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;

      const finalBuffer = await img.save(null);

      await sock.sendMessage(extra.from, { 
        sticker: finalBuffer
      }, { quoted: messageToQuote });

    } catch (error) {
      console.error('Crop command error:', error);
      await extra.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴜ sᴇᴄᴛɪᴏɴɴᴇᴍᴇɴᴛ. ᴛᴇɴᴛᴇᴢ ᴀᴠᴇᴄ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴠɪᴅᴇ́ᴏ ᴘʟᴜs ᴄᴏᴜʀᴛᴇ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    } finally {
      tempFiles.forEach(file => deleteTempFile(file));
    }
  }
};
