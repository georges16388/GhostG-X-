/**
 * Video Downloader - GhostG-X Edition
 * Télécharge l'essence vidéo depuis l'univers YouTube
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');
const config = require('../../config');

module.exports = {
  name: 'ɪʟʟᴜsɪᴏɴ_ʏᴏᴜᴛᴜʙᴇ',
  aliases: ['illusions_youtube', 'ytvideo', 'ytv', 'ytmp4', 'ytvid', 'video'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: 'ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇ ʟᴀ ᴠɪᴅᴇ́ᴏ ᴅᴇᴘᴜɪs ʏᴏᴜᴛᴜʙᴇ',
  usage: '.ɪʟʟᴜsɪᴏɴ_ʏᴏᴜᴛᴜʙᴇ <ɴᴏᴍ ᴏᴜ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ>',

  async execute(sock, msg, args) {
    try {
      const botName = (config.botName || 'ɢʜᴏsᴛɢ-x').toUpperCase();

      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      const searchQuery = text.trim();

      if (!searchQuery) {
        return await sock.sendMessage(chatId, {
          text: '*〆 ᴍᴜʀᴍᴜʀᴇ ʟᴇ ɴᴏᴍ ᴏᴜ ʟᴇ ʟɪᴇɴ ᴅᴇ ʟᴀ ᴠɪᴅᴇ́ᴏ ᴀ̀ ᴀsᴘɪʀᴇʀ !*'
        }, { quoted: msg });
      }

      // Détermination si l'entrée est un lien YouTube
      let videoUrl = '';
      let videoTitle = '';
      let videoThumbnail = '';

      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        videoUrl = searchQuery;
        videoTitle = 'Lien Direct';
      } else {
        // Recherche de la vidéo sur YouTube
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
          return await sock.sendMessage(chatId, {
            text: '*〆 ᴀᴜᴄᴜɴᴇ ᴠɪᴅᴇ́ᴏ ᴛʀᴏᴜᴠᴇ́ᴇ ᴅᴀɴs ʟᴇs ᴀʀᴄʜɪᴠᴇs.*'
          }, { quoted: msg });
        }
        videoUrl = videos[0].url;
        videoTitle = videos[0].title;
        videoThumbnail = videos[0].thumbnail;
      }

      // Envoi immédiat de la miniature avec l'esthétique du sanctuaire
      try {
        const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
        const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
        const captionTitle = videoTitle || searchQuery;
        
        if (thumb) {
          await sock.sendMessage(chatId, {
            image: { url: thumb },
            caption: `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛɪᴏɴ ᴠɪᴅᴇ́ᴏ •≫━━━╾╮*\n` +
                     `*┃ 🔮 ᴛɪᴛʀᴇ : ${captionTitle}*\n` +
                     `*┃ 🔗 ʟɪᴇɴ : ${videoUrl}*\n` +
                     `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                     `*〆 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs...*`
          }, { quoted: msg });
        }
      } catch (e) {
        console.error('[VIDEO] thumb error:', e?.message || e);
      }

      // Validation de l'URL YouTube
      let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
      if (!urls) {
        return await sock.sendMessage(chatId, {
          text: '*〆 ᴄᴇ ʟɪᴇɴ ɴ\'ᴇsᴛ ᴘᴀs ᴜɴᴇ ɪʟʟᴜsɪᴏɴ ʏᴏᴜᴛᴜʙᴇ ᴠᴀʟɪᴅᴇ !*'
        }, { quoted: msg });
      }

      // Récupération de la vidéo : EliteProTech d'abord, puis Yupra, puis Okatsu en repli
      let videoData;
      try {
        videoData = await APIs.getEliteProTechVideoByUrl(videoUrl);
      } catch (e1) {
        try {
          videoData = await APIs.getYupraVideoByUrl(videoUrl);
        } catch (e2) {
          videoData = await APIs.getOkatsuVideoByUrl(videoUrl);
        }
      }

      // Envoi de l'artefact vidéo finalisé
      await sock.sendMessage(chatId, {
        video: { url: videoData.download },
        mimetype: 'video/mp4',
        fileName: `${(videoData.title || videoTitle || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
        caption: `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                 `*┃ 🔮 ᴇxᴛʀᴀɪᴛ : ${videoData.title || videoTitle || 'Video'}*\n` +
                 `*┃ 🔗 ʟɪᴇɴ : ${videoUrl}*\n` +
                 `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`
      }, { quoted: msg });

    } catch (error) {
      console.error('[VIDEO] Command Error:', error?.message || error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*〆 ʟ'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error?.message || 'ᴇʀʀᴇᴜʀ ɪɴᴄᴏɴɴᴜᴇ'}*`
      }, { quoted: msg });
    }
  }
};
