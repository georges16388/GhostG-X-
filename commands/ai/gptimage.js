/**
 * GPT Image Command
 * Edit image using GPT Vision with prompt
 */

const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');
const sharp = require('sharp');

// Design pour le résultat de la vision IA
const VISION_DESIGN = (prompt) => `╭╼━≪• ɢʜᴏsᴛ ᴠɪsɪᴏɴ •≫━╾╮
┃ ᴘʀᴏᴍᴘᴛ : ${prompt}
┃ sᴛᴀᴛᴜs : ᴇᴅɪᴛᴇᴅ ✨
┃ ᴛʏᴘᴇ : ᴀɪ ɢᴇɴᴇʀᴀᴛᴇᴅ
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'gptimage',
  aliases: ['gptimg', 'editimage', 'aiimage', 'vision','gi'],
  category: 'ai',
  description: 'Edit image using GPT Vision with prompt',
  usage: '.gptimage <prompt> (reply to image/sticker)',
  
  async execute(sock, msg, args, extra) {
    try {
      const prefix = extra.prefix || '.';
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctxInfo?.quotedMessage) {
        return await extra.reply(
          `╭╼━≪• ɪᴍᴀɢᴇ ᴇᴅɪᴛᴏʀ •≫━╾╮\n` +
          `┃ ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ/sᴛɪᴄᴋᴇʀ\n` +
          `┃ ᴜsᴀɢᴇ : ${prefix}ɢɪ <ᴘʀᴏᴍᴘᴛ>\n` +
          `┃ ᴇx : ${prefix}ɢɪ sᴇᴛ ᴀ ʙᴇᴀᴄʜ\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }
      
      const prompt = args.join(' ').trim();
      if (!prompt) {
        return await extra.reply('❌ Please provide a prompt for the AI!');
      }
      
      const targetMessage = {
        key: {
          remoteJid: extra.from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };
      
      const quotedMsg = ctxInfo.quotedMessage;
      const isImage = !!quotedMsg.imageMessage;
      const isSticker = !!quotedMsg.stickerMessage;
      
      if (!isImage && !isSticker) {
        return await extra.reply('❌ Please reply to an *image* or *sticker*!');
      }
      
      await extra.reply('⏳ *Ghost AI is processing your image...*');

      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );
      
      if (!mediaBuffer) return await extra.reply('❌ Failed to download media.');

      let imageBuffer = mediaBuffer;
      if (isSticker) {
        if (quotedMsg.stickerMessage.isAnimated) {
          return await extra.reply('❌ Animated stickers are not supported.');
        }
        imageBuffer = await webp2png(mediaBuffer);
      }
      
      // Convert to JPEG for API compatibility
      let finalImageBuffer;
      try {
        finalImageBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();
      } catch (e) {
        finalImageBuffer
