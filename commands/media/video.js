/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Multi-API Fallback
 */

const yts = require('yt-search');
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
const AGM_DESIGN = (title, status, url) => {
  const shortTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  return `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ')} •≫━╾╮*
*┃*
*┃* 🎬 *${toStyledCaps('ᴠɪᴅᴇᴏ')}* : *${toStyledCaps(shortTitle)}*
*┃* 🟢 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(status)}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ')}*
*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video', 'shorts'],
  category: 'media',
  description: 'Télécharger des vidéos ou Shorts YouTube en HD',
  usage: '.video <nom/url>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const text = args.join(' ');

    try {
      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ")}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

      let video;
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
        const search = await yts({ videoId: videoId || text });
        video = search;
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
          return extra.reply(`❌ *${toStyledCaps("ᴀᴜᴄᴜɴᴇ ᴠɪᴅᴇᴏ ᴛʀᴏᴜᴠᴇᴇ")}*`);
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title, 'ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...', video.url),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴠɪᴅᴇᴏ sʏsᴛᴇᴍ",
            body: toStyledCaps("preparation du fichier hd"),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // 2. Système de Fallback Multi-API (Synchronisé avec APIs.js)
      let finalUrl = null;
      const methods = [
        APIs.getEliteProTechVideoByUrl,
        APIs.getYupraVideoByUrl,
        APIs.getOkatsuVideoByUrl
      ];

      for (const method of methods) {
        try {
          const res = await method(video.url);
          // Correction ici pour accepter plusieurs formats de retour
          finalUrl = res?.download || res?.url || (typeof res === 'string' ? res : null);
          if (finalUrl) break;
        } catch (e) { continue; }
      }

      if (!finalUrl) throw new Error('No download URL found after all attempts');

      // 3. Envoi de la vidéo finale
      await sock.sendMessage(chatId, {
        video: { url: finalUrl },
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: AGM_DESIGN(video.title, 'sᴜᴄᴄᴇss ✅', video.url),
        contextInfo: {
            externalAdReply: {
              title: video.title,
              body: toStyledCaps("ɢʜᴏsᴛɢ-x ʜɪɢʜ ᴅᴇғɪɴɪᴛɪᴏɴ"),
              mediaType: 1,
              thumbnailUrl: video.thumbnail || video.image,
              showAdAttribution: false
            }
          }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[VIDEO ERROR]:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ. ᴄᴏɴᴛᴇɴᴜ ɪɴᴅɪsᴘᴏɴɪʙʟᴇ")}*`);
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
