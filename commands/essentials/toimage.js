/**
 * Sticker to Image/Video - AGM Converter Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (type) => `╭╼━≪• ᴍᴇᴅɪᴀ ᴄᴏɴᴠᴇʀᴛᴇʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 sᴜᴄᴄᴇss
┃ ᴏᴜᴛᴘᴜᴛ : ${type.toUpperCase()} ⚡
┃ ᴍᴏᴅᴇ : sʏsᴛᴇᴍ 🛡️
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'simage',
  aliases: ['toimg', 'stickertoimg', 'svideo', 'tovideo', 'toimage'],
  category: 'media',
  description: 'Convert sticker to image (PNG) or video (MP4)',
  usage: '.simage (reply to sticker)',
  
  async execute(sock, msg, args, extra) {
    try {
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctxInfo?.quotedMessage) {
        return await extra.reply('⚠️ *ʀéᴘᴏɴᴅᴇᴢ à ᴜɴ sᴛɪᴄᴋᴇʀ ᴘᴏᴜʀ ʟᴇ ᴄᴏɴᴠᴇʀᴛɪʀ.*');
      }
      
      const targetMessage = {
        key: {
          remoteJid: extra.from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: ctxInfo.quotedMessage,
      };
      
      const stickerMessage = targetMessage.message?.stickerMessage;
      if (!stickerMessage) {
        return await extra.reply('⚠️ *ᴄᴇ ᴍᴇssᴀɢᴇ ɴ\'ᴇsᴛ ᴘᴀs ᴜɴ sᴛɪᴄᴋᴇʀ.*');
      }

      await sock.sendMessage(extra.from, { react: { text: "🔄", key: msg.key } });
      
      const stickerBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );
      
      if (!stickerBuffer) throw new Error('Download failed');
      
      const isAnimated = stickerMessage.isAnimated || stickerMessage.mimetype?.includes('animated');
      
      if (isAnimated) {
        // --- CONVERSION ANIMÉE (VIDEO) ---
        const { webp2mp4 } = require('../../utils/webp2mp4');
        const mp4Buffer = await webp2mp4(stickerBuffer);
        
        await sock.sendMessage(extra.from, {
          video: mp4Buffer,
          caption: AGM_DESIGN('video'),
          mimetype: 'video/mp4',
          gifPlayback: true
        }, { quoted: msg });

      } else {
        // --- CONVERSION FIXE (IMAGE) ---
        const imageBuffer = await webp2png(stickerBuffer);
        
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: AGM_DESIGN('image')
        }, { quoted: msg });
      }
      
      await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('Error in simage command:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
