/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Multi-API Sync
 */

const yts = require('yt-search');
const axios = require('axios');
const APIs = require('../../utils/api');

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

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, duration, url) => {
  const shortTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  return `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ')} •≫━╾╮*
*┃*
*┃* 🎵 *${toStyledCaps('sᴏɴɢ')}* : *${toStyledCaps(shortTitle)}*
*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${duration}*
*┃* 🟢 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ')}...*
*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta', 'audio'],
  category: 'media',
  description: 'Télécharger de la musique depuis YouTube',
  usage: '.song <nom/url>',

  async execute(sock, msg, args, extra) {
    const text = args.join(' ');
    const chatId = extra.from;

    try {
      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      let video;
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
        video = await yts({ videoId: videoId || text });
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
            return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title, video.timestamp || video.duration?.timestamp || '00:00', video.url),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴍᴜsɪᴄ sʏsᴛᴇᴍ",
            body: toStyledCaps("recherche du meilleur flux audio"),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // --- SYSTÈME DE FALLBACK MULTI-API (SYNCHRO AVEC APIS.JS) ---
      const apiMethods = [
        APIs.getYupraDownloadByUrl,  // Très stable en MP3
        APIs.getIzumiDownloadByUrl,   // Excellent secours
        APIs.getEliteProTechVideoByUrl // Fonctionne aussi car souvent multi-format
      ];

      let finalUrl = null;
      for (const method of apiMethods) {
        try {
          const res = await method(video.url);
          finalUrl = res?.download || res?.dl || res?.url;
          if (finalUrl) break;
        } catch (e) { continue; }
      }

      if (!finalUrl) throw new Error('Toutes les sources audio ont échoué');

      // 2. Envoi du fichier audio final (Directement par URL pour économiser la RAM)
      await sock.sendMessage(chatId, {
        audio: { url: finalUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: toStyledCaps("ɢʜᴏsᴛɢ-x ᴘʀᴇsᴛɪɢᴇ ᴀᴜᴅɪᴏ"),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error('[SONG ERROR]:', err);
      await extra.reply(`❌ *${toStyledCaps('ʟᴇ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴀ ᴇᴄʜᴏᴜᴇ. sᴏᴜʀᴄᴇs ɪɴᴅɪsᴘᴏɴɪʙʟᴇs')}.*`);
      await sock.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
    }
  }
};
