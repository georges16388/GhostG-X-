/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Clean Preview & Link Fix
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- DESIGN AGM (Modifié pour gérer l'affichage du lien) ---
const AGM_DESIGN = (title, status, url, showLink = true) => {
  const shortTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  let design = `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ sʏsᴛᴇᴍ')} •≫━╾╮*\n`;
  design += `*┃*\n`;
  design += `*┃* 🎬 *${toStyledCaps('ᴠɪᴅᴇᴏ')}* : *${toStyledCaps(shortTitle)}*\n`;
  design += `*┃* 🟢 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps(status)}*\n`;
  design += `*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ')}*\n`;
  if (showLink) design += `*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}\n`;
  design += `*┃*\n`;
  design += `*╰━━━━━━━━━━━━━━━╯*\n`;
  design += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
  return design;
};

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video', 'shorts'],
  category: 'media',
  description: 'Télécharger des vidéos YouTube en HD',
  usage: '.video <nom/url>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const text = args.join(' ');

    try {
      if (!text) return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ")}*`);

      await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

      let video;
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
        video = await yts({ videoId: videoId || text });
      } else {
        const search = await yts(text);
        if (!search.videos.length) return extra.reply(`❌ *${toStyledCaps("ᴀᴜᴄᴜɴᴇ ᴠɪᴅᴇᴏ ᴛʀᴏᴜᴠᴇᴇ")}*`);
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu (showLink = false pour effacer le lien sur la photo)
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title, 'ᴘʀᴇᴘᴀʀᴀᴛɪᴏɴ...', video.url, false), 
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴠɪᴅᴇᴏ sʏsᴛᴇᴍ",
            body: toStyledCaps("analyse du flux hd..."),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // 2. Système de Fallback Multi-API
      let finalUrl = null;
      const methods = [
        APIs.getEliteProTechVideoByUrl,
        APIs.getYupraVideoByUrl,
        APIs.getOkatsuVideoByUrl
      ];

      for (const method of methods) {
        try {
          const res = await method(video.url);
          finalUrl = res?.download || res?.url;
          if (finalUrl) break;
        } catch (e) { continue; }
      }

      if (!finalUrl) throw new Error('Download failed');

      // 3. Envoi de la vidéo finale (showLink = true pour ajouter le 🔗lien)
      await sock.sendMessage(chatId, {
        video: { url: finalUrl },
        mimetype: 'video/mp4',
        fileName: `${video.title}.mp4`,
        caption: AGM_DESIGN(video.title, 'sᴜᴄᴄᴇss ✅', video.url, true),
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ. ʟᴇ sᴇʀᴠᴇᴜʀ ʏᴏᴜᴛᴜʙᴇ ᴇsᴛ sᴜʀᴄʜᴀʀɢᴇ.")}*`);
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
