/**
 * TikTok Downloader - AGM Elite Edition (Dual Mode)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { ttdl } = require('ruhend-scraper');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, type) => {
  const shortTitle = title ? (title.length > 25 ? title.substring(0, 22) + '...' : title) : 'ɴ/ᴀ';
  return `*╭╼━≪• ${toStyledCaps('ᴛɪᴋᴛᴏᴋ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}*
*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* 📝 *${toStyledCaps('ᴛɪᴛʟᴇ')}* : *${toStyledCaps(shortTitle)}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'ttmp3'],
  category: 'media',
  description: 'Télécharger Vidéo ou Audio TikTok',
  usage: '.tt <URL>',

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      const text = args.join(' ');
      
      // Extraction de l'URL
      const urlMatch = text.match(/https?:\/\/(www\.|v[mt]\.|)tiktok\.com\/[^\s]+/i);
      if (!urlMatch) return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ sᴀɪsɪʀ ᴜɴ ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ ᴠᴀʟɪᴅᴇ')}*`);

      const url = urlMatch[0];
      const isAudioMode = args.some(a => a.toLowerCase() === 'audio' || a.toLowerCase() === 'mp3');

      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      // Appel à l'API
      const res = await ttdl(url);
      if (!res || !res.data) throw new Error("API_ERROR");

      const data = res.data;
      const title = data.title || "TikTok Content";

      // --- MODE AUDIO (MP3) ---
      if (isAudioMode) {
        const audioUrl = data.audio || data.mp3;
        if (!audioUrl) throw new Error("AUDIO_NOT_FOUND");

        await sock.sendMessage(from, {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: toStyledCaps("ᴛɪᴋᴛᴏᴋ ᴀᴜᴅɪᴏ ᴘʟᴀʏᴇʀ"),
              body: toStyledCaps(title),
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              mediaType: 1,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: msg });
      } 

      // --- MODE PHOTO (DIAPORAMA) ---
      else if (data.photo || data.photos) {
        const album = data.photo || data.photos;
        for (let i = 0; i < Math.min(5, album.length); i++) {
          await sock.sendMessage(from, {
            image: { url: album[i] },
            caption: i === 0 ? AGM_DESIGN(title, "ᴘʜᴏᴛᴏ ᴀʟʙᴜᴍ") : ""
          }, { quoted: msg });
        }
      } 

      // --- MODE VIDÉO ---
      else {
        const videoUrl = data.nowm || data.video || data.no_watermark;
        if (!videoUrl) throw new Error("VIDEO_NOT_FOUND");

        await sock.sendMessage(from, {
          video: { url: videoUrl },
          caption: AGM_DESIGN(title, "ᴠɪᴅᴇᴏ ɴᴏ ᴡᴍ"),
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ᴛɪᴋᴛᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toStyledCaps("ᴠɪᴅᴇᴏ ʜᴅ ʀᴇᴄᴜᴘᴇʀᴇᴇ"),
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              mediaType: 1, // Type 1 évite les bugs de lecture directe dans l'aperçu
              renderLargerThumbnail: false
            }
          }
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('TikTok DL Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ. ʟᴇ sᴇʀᴠɪᴄᴇ ᴇsᴛ ᴘᴇᴜᴛ-ᴇᴛʀᴇ sᴀᴛᴜʀᴇ')}.*`);
    }
  }
};
