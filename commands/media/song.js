/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const yts = require('yt-search');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

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
const AGM_DESIGN = (title, duration, url) => {
  const shortTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  return `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ')} •≫━╾╮*
*┃* *┃* 🎵 *${toStyledCaps('sᴏɴɢ')}* : *${toStyledCaps(shortTitle)}*
*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${duration}*
*┃* 🟢 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ')}...*
*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}
*┃* *╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta', 'audio'],
  category: 'media',
  description: 'Télécharger de la musique depuis YouTube',
  usage: '.song <nom/url>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;

      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ')}*`);
      }

      // Réaction de recherche
      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      let video;
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        const videoId = text.split('v=')[1]?.split('&')[0] || text.split('/').pop();
        video = await yts({ videoId });
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
            return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu (L'URL est cachée car elle est dans l'objet image)
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title, video.timestamp || video.duration.timestamp, video.url),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴍᴜsɪᴄ ᴘʟᴀʏᴇʀ",
            body: toStyledCaps("recherche en cours..."),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // --- SYSTÈME DE FALLBACK MULTI-API ---
      const apiMethods = [
        { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
        { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
        { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) }
      ];

      let audioBuffer;
      let success = false;

      for (const api of apiMethods) {
        try {
          const res = await api.method();
          const audioUrl = res?.download || res?.dl || res?.url;
          if (!audioUrl) continue;

          const response = await axios.get(audioUrl, { 
            responseType: 'arraybuffer', 
            timeout: 100000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          audioBuffer = Buffer.from(response.data);
          if (audioBuffer.length > 50000) { 
            success = true;
            break; 
          }
        } catch (e) { 
            console.log(`[LOG] API ${api.name} échouée...`); 
        }
      }

      if (!success) throw new Error('Sources épuisées');

      // --- CONVERSION & OPTIMISATION ---
      let finalBuffer = audioBuffer;
      // Détection simple du format m4a pour conversion si nécessaire
      const isM4A = audioBuffer.slice(4, 8).toString('ascii') === 'ftyp';

      if (isM4A && typeof toAudio === 'function') {
        try {
          finalBuffer = await toAudio(audioBuffer, 'mp3');
        } catch (convErr) {
          finalBuffer = audioBuffer;
        }
      }

      // 2. Envoi du fichier audio final
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: toStyledCaps(video.author.name || "ɢʜᴏsᴛɢ-x ᴍᴜsɪᴄ"),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error(err);
      await extra.reply(`❌ *${toStyledCaps('ʟᴇ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴀ ᴇᴄʜᴏᴜᴇ. sᴏᴜʀᴄᴇs ɪɴᴅɪsᴘᴏɴɪʙʟᴇs')}.*`);
    }
  }
};
