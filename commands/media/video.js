/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 *
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, status) => `╭╼━≪• ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ •≫━╾╮
┃ ᴠɪᴅᴇᴏ : ${title.length > 20 ? title.substring(0, 17) + '...' : title} 🎬
┃ sᴛᴀᴛᴜs : ${status}
┃ ᴍᴏᴅᴇ : ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ ⚡
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video', 'shorts'],
  category: 'media',
  description: 'Télécharger des vidéos ou Shorts YouTube',
  usage: '.video <nom/url>',

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');

    try {
      if (!text) {
        return sock.sendMessage(chatId, { text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ.*' }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

      let video;
      // Regex améliorée pour détecter : Shorts, v/, embed/, youtu.be/, etc.
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        // Extraction précise de l'ID pour les Shorts et vidéos classiques
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
        
        if (!videoId) {
            return sock.sendMessage(chatId, { text: '❌ *ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ ɪɴᴠᴀʟɪᴅᴇ (sʜᴏʀᴛs ɴᴏɴ ᴅᴇᴛᴇᴄᴛᴇ).*' }, { quoted: msg });
        }

        video = { 
          url: text, 
          title: 'ʏᴏᴜᴛᴜʙᴇ ᴄᴏɴᴛᴇɴᴛ', 
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` 
        };
      } else {
        // Recherche par mots-clés
        const search = await yts(text);
        if (!search || !search.videos.length) {
          return sock.sendMessage(chatId, { text: '❌ *ᴀᴜᴄᴜɴᴇ ᴠɪᴅéᴏ ᴛʀᴏᴜᴠéᴇ.*' }, { quoted: msg });
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: AGM_DESIGN(video.title || text, '🟢 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...')
      }, { quoted: msg });

      // 2. Système de Fallback Multi-API (Elite > Yupra > Okatsu)
      let videoData = null;
      const methods = [
        APIs.getEliteProTechVideoByUrl,
        APIs.getYupraVideoByUrl,
        APIs.getOkatsuVideoByUrl
      ];

      for (const method of methods) {
        try {
          if (typeof method === 'function') {
            videoData = await method(video.url);
            if (videoData && videoData.download) break;
          }
        } catch (e) { continue; }
      }

      if (!videoData || !videoData.download) {
        throw new Error('No download URL found');
      }

      // 3. Envoi de la vidéo/Short final
      await sock.sendMessage(chatId, {
        video: { url: videoData.download },
        mimetype: 'video/mp4',
        fileName: `${(videoData.title || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
        caption: AGM_DESIGN(videoData.title || video.title, '✅ sᴜᴄᴄᴇss')
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[VIDEO ERROR]:', error);
      const errMsg = '❌ *éᴄʜᴇᴄ ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ.*\n_ʟᴇ ᴄᴏɴᴛᴇɴᴜ ᴇsᴛ ᴘᴇᴜᴛ-êᴛʀᴇ ᴛʀᴏᴘ ʟᴏᴜʀᴅ ᴏᴜ ʟɪᴍɪᴛé._';
      await sock.sendMessage(chatId, { text: errMsg }, { quoted: msg });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
