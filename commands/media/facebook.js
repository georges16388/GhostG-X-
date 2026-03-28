/**
 * ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');

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
const AGM_DESIGN = (quality, url) => {
  return `*╭╼━≪• ${toStyledCaps('ғᴀᴄᴇʙᴏᴏᴋ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴄᴏᴍᴘʟᴇᴛᴇᴅ')}*
*┃* 📹 *${toStyledCaps('ǫᴜᴀʟɪᴛʏ')}* : *${toStyledCaps(quality || 'ᴀᴜᴛᴏ')}*
*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'media',
  description: 'Télécharger des vidéos depuis Facebook',
  usage: '.fb <URL>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const url = args[0] || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);

      if (!url) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ᴠᴀʟɪᴅᴇ")}*`);
      }

      // Validation regex pour Facebook
      const fbPattern = /https?:\/\/(?:www\.|m\.|web\.|fb\.)?(facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i;
      if (!fbPattern.test(url)) {
        return extra.reply(`❌ *${toStyledCaps("ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ɪɴᴠᴀʟɪᴅᴇ")}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '📥', key: msg.key } });

      try {
        const data = await facebookdl(url);
        
        // Bochilteam renvoie un tableau de résultats (SD/HD)
        const videoRes = data.find(v => v.quality === 'hd') || data[0];

        if (!videoRes || !videoRes.url) {
          throw new Error('No video found');
        }

        const caption = AGM_DESIGN(videoRes.quality, url);

        // Téléchargement via axios pour garantir que le fichier passe bien sur WhatsApp
        const response = await axios.get(videoRes.url, { 
          responseType: 'arraybuffer',
          timeout: 60000 
        });

        await sock.sendMessage(chatId, {
          video: Buffer.from(response.data),
          mimetype: 'video/mp4',
          caption: caption,
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toStyledCaps("video recuperee avec succes"),
              mediaType: 2,
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              showAdAttribution: false
            }
          }
        }, { quoted: msg });

        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

      } catch (error) {
        console.error('FB DL Internal Error:', error);
        await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ ғᴀᴄᴇʙᴏᴏᴋ")}*`);
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      }
    } catch (e) {
      console.error('FB Global Error:', e);
    }
  }
};
