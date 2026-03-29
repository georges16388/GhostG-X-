/**
 * Sticker to Image/Video - AGM Converter Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
// On importe les deux moteurs : Sharp (local/rapide) et Webp2mp4 (vidéo)
const { stickerToImage } = require('../../utils/sticker'); 
const { webp2mp4 } = require('../../utils/webp2mp4');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_DESIGN = (type) => `*╭╼━≪• ${toStyledCaps('ᴍᴇᴅɪᴀ ᴄᴏɴᴠᴇʀᴛᴇʀ')} •≫━╾╮*
*┃* *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('sᴜᴄᴄᴇss')}*
*┃* *${toStyledCaps('ᴏᴜᴛᴘᴜᴛ')}* : *${toStyledCaps(type)}* ⚡
*┃* *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('sʏsᴛᴇᴍ')}* 🛡️
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'simage',
  aliases: ['toimg', 'stickertoimg', 'svideo', 'tovideo', 'toimage'],
  category: 'media',
  description: 'Convert sticker to image (PNG) or video (MP4)',
  usage: '.simage (reply to sticker)',

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quoted?.stickerMessage;

      if (!stickerMessage) {
        return reply(`⚠️ *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴘᴏᴜʀ ʟᴇ ᴄᴏɴᴠᴇʀᴛɪʀ')}.*`);
      }

      await react("🔄");

      const buffer = await downloadMediaMessage(
        { message: quoted },
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      const isAnimated = stickerMessage.isAnimated === true;

      if (isAnimated) {
        // --- MODE VIDÉO (MP4) ---
        const mp4Buffer = await webp2mp4(buffer);
        await sock.sendMessage(from, {
          video: mp4Buffer,
          caption: AGM_DESIGN('video'),
          mimetype: 'video/mp4',
          gifPlayback: true
        }, { quoted: msg });

      } else {
        // --- MODE IMAGE (PNG via Sharp) ---
        const imageBuffer = await stickerToImage(buffer);
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: AGM_DESIGN('image')
        }, { quoted: msg });
      }

      await react("✅");

    } catch (error) {
      console.error('Simage Error:', error);
      reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ')}* : ${error.message}`);
    }
  }
};
