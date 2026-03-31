/**
 * GPT Image Command - GhostG-X Edition
 * Edit image using GPT Vision with prompt
 */

const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');
const sharp = require('sharp');
const config = require('../../config');

module.exports = {
  name: 'ᴠɪsɪᴏɴ',
  aliases: ['gptimg', 'editimage', 'aiimage', 'vision', 'gi', 'gptimage'],
  category: '⍟ ᴏʀᴀᴄʟᴇ & ᴀʀᴄᴀɴᴇs',
  description: 'ᴛʀᴀɴsᴍᴜᴛᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴠɪᴀ ʟ\'ᴀʟᴄʜɪᴍɪᴇ ᴅᴇ ʟ\'ɪᴀ (ɢᴘᴛ ᴠɪsɪᴏɴ)',
  usage: '.ᴠɪsɪᴏɴ <ᴍᴜʀᴍᴜʀᴇ> (ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ)',
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    try {
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      
      if (!ctxInfo?.quotedMessage) {
        return await extra.reply(
          `*╭╼━━━≪• ᴀʟᴄʜɪᴍɪᴇ ᴠɪsᴜᴇʟᴇ •≫━━━╾╮*\n` +
          `*┃ 📷 ᴜsᴀɢᴇ : ${prefix}ɢᴘᴛɪᴍᴀɢᴇ <ᴍᴜʀᴍᴜʀᴇ>*\n` +
          `*┃ 📜 ᴇxᴇᴍᴘʟᴇ : ʀᴇ́ᴘᴏɴᴅᴇᴢ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴀᴠᴇᴄ :*\n` +
          `*┃ ${prefix}ɢᴘᴛɪᴍᴀɢᴇ ᴄʜᴀɴɢᴇ ʟᴇ ғᴏɴᴅ ᴇɴ ᴘʟᴀɢᴇ*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const prompt = args.join(' ').trim();
      if (!prompt) {
        return await extra.reply(
          `*〆 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ɪɴᴄᴏᴍᴘʟᴇ̀ᴛᴇ : ᴠᴇᴜɪʟʟᴇᴢ ᴅɪᴄᴛᴇʀ ᴜɴ ᴍᴜʀᴍᴜʀᴇ ᴘᴏᴜʀ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ.*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const quotedMsg = ctxInfo.quotedMessage;
      const isImage = !!quotedMsg.imageMessage;
      const isSticker = !!quotedMsg.stickerMessage;
      
      if (!isImage && !isSticker) {
        return await extra.reply(`*〆 ᴀᴜᴄᴜɴ sᴜᴘᴘᴏʀᴛ ᴠɪsᴜᴇʟ ᴅᴇ́ᴛᴇᴄᴛᴇ́. ʀᴇ́ᴘᴏɴᴅᴇᴢ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      await extra.reply(`*☬ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴇ ʟ'ɪᴍᴀɢᴇ ᴇɴ ᴄᴏᴜʀs...*`);
      
      const targetMessage = {
        key: {
          remoteJid: extra.from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: quotedMsg,
      };
      
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );
      
      if (!mediaBuffer) {
        return await extra.reply(`*〆 ᴇ́ᴄʜᴇᴄ ᴅᴇ sᴀɪsɪᴇ : ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ʀᴇᴄᴜᴘᴇ́ʀᴇʀ ʟᴇ sᴜᴘᴘᴏʀᴛ ᴠɪsᴜᴇʟ.*`);
      }
      
      let imageBuffer = mediaBuffer;
      if (isSticker) {
        if (quotedMsg.stickerMessage.isAnimated) {
          return await extra.reply(`*〆 ʟᴇs ᴀʀᴛᴇғᴀᴄᴛs ᴀɴɪᴍᴇ́s ɴᴇ sᴏɴᴛ ᴘᴀs sᴜᴘᴘᴏʀᴛᴇ́s.*`);
        }
        imageBuffer = await webp2png(mediaBuffer);
      }
      
      let finalImageBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();
      
      const form = new FormData();
      form.append('image', finalImageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      form.append('param', prompt);
      
      const response = await axios.post('https://api.nexray.web.id/ai/gptimage', form, {
        headers: { ...form.getHeaders() },
        responseType: 'arraybuffer',
        timeout: 120000,
      });
      
      if (!response.data) {
        return await extra.reply(`*〆 ʟ'ᴏʀᴀᴄʟᴇ ɴ'ᴀ ʀɪᴇɴ ʀᴇɴᴠᴏʏᴇ́. ʀᴇᴇssᴀʏᴇᴢ ʟ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ.*`);
      }
      
      const resultImageBuffer = Buffer.from(response.data);
      
      await sock.sendMessage(extra.from, {
        image: resultImageBuffer,
        caption: `*✨ ᴍɪʀᴀɢᴇ ᴅᴇ ʟ'ᴏʀᴀᴄʟᴇ*\n\n*📝 ᴍᴜʀᴍᴜʀᴇ : ${prompt}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('GPT Image error:', error);
      return await extra.reply(`*〆 ʟ'ᴀʟᴄʜɪᴍɪᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message.toUpperCase()}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  },
};
