/**
 * Sticker to Image/Video - AGM Converter Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');

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

// --- FONCTION DE DESIGN AGM AJUSTÉE (GRAS & SMALLCAPS) ---
const AGM_DESIGN = (type) => `*╭╼━≪• ${toStyledCaps('ᴍᴇᴅɪᴀ ᴄᴏɴᴠᴇʀᴛᴇʀ')} •≫━╾╮*
*┃* *┃* *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('sᴜᴄᴄᴇss')}*
*┃* *${toStyledCaps('ᴏᴜᴛᴘᴜᴛ')}* : *${toStyledCaps(type)}* ⚡
*┃* *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('sʏsᴛᴇᴍ')}* 🛡️
*┃* *╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

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
        return await extra.reply(`⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴘᴏᴜʀ ʟᴇ ᴄᴏɴᴠᴇʀᴛɪʀ')}.*`);
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
        return await extra.reply(`⚠️ *${toStyledCaps('ᴄᴇ ᴍᴇssᴀɢᴇ ɴᴇsᴛ ᴘᴀs ᴜɴ sᴛɪᴄᴋᴇʀ')}.*`);
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
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ')}* : ${error.message}`);
    }
  }
};
