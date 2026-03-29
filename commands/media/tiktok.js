/**
 * TikTok Downloader - AGM Elite Edition (Dual Mode)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for GhostG-X V5.3 (Ruhend Engine)
 */

const { ttdl } = require('ruhend-scraper');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, type) => {
  const shortTitle = title ? (title.length > 25 ? title.substring(0, 22) + '...' : title) : 'ᴛɪᴋᴛᴏᴋ ᴄᴏɴᴛᴇɴᴛ';
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
    const from = extra.from;
    const text = args.join(' ');
    const command = extra.command || '';

    try {
      // Extraction de l'URL plus robuste
      const url = text.match(/https?:\/\/(?:vm|vt|www)\.tiktok\.com\/[^\s?]+/i)?.[0];
      if (!url) return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ sᴀɪsɪʀ ᴜɴ ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ ᴠᴀʟɪᴅᴇ')}*`);

      // Détection automatique du mode audio via commande ou argument
      const isAudioMode = command.includes('mp3') || args.some(a => ['audio', 'mp3'].includes(a.toLowerCase()));

      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      const res = await ttdl(url);
      if (!res || !res.data) throw new Error("API_ERROR");

      const data = res.data;
      const title = data.title || "TikTok Video";

      // --- MODE AUDIO (MP3) ---
      if (isAudioMode) {
        const audioUrl = data.audio || data.mp3 || data.music;
        if (!audioUrl) throw new Error("AUDIO_NOT_FOUND");

        await sock.sendMessage(from, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: toStyledCaps("ᴛɪᴋᴛᴏᴋ ᴀᴜᴅɪᴏ ᴘʟᴀʏᴇʀ"),
              body: toStyledCaps(title),
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              mediaType: 1,
              showAdAttribution: false
            }
          }
        }, { quoted: msg });
      } 

      // --- MODE PHOTO (ALBUM) ---
      else if (data.photo || data.photos || Array.isArray(data.images)) {
        const album = data.photo || data.photos || data.images;
        for (let i = 0; i < Math.min(5, album.length); i++) {
          await sock.sendMessage(from, {
            image: { url: album[i] },
            caption: i === 0 ? AGM_DESIGN(title, "ᴘʜᴏᴛᴏ ᴀʟʙᴜᴍ") : ""
          }, { quoted: msg });
        }
      } 

      // --- MODE VIDÉO (DEFAULT) ---
      else {
        const videoUrl = data.nowm || data.video || data.no_watermark || data.wm;
        if (!videoUrl) throw new Error("VIDEO_NOT_FOUND");

        await sock.sendMessage(from, {
          video: { url: videoUrl },
          caption: AGM_DESIGN(title, "ᴠɪᴅᴇᴏ ɴᴏ ᴡᴍ"),
          mimetype: 'video/mp4',
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ᴛɪᴋᴛᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toStyledCaps("ᴠɪᴅᴇᴏ ʜᴅ ʀᴇᴄᴜᴘᴇʀᴇᴇ"),
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              mediaType: 1,
              showAdAttribution: false
            }
          }
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[TIKTOK ERROR]:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ. ʟᴇ sᴇʀᴠɪᴄᴇ ᴇsᴛ ᴘᴇᴜᴛ-ᴇᴛʀᴇ sᴀᴛᴜʀᴇ')}.*`);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  }
};
