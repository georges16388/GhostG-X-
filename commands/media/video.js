/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, status) => `╭╼━≪• ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ •≫━╾╮
┃ ᴠɪᴅᴇᴏ : ${title.length > 20 ? title.substring(0, 17) + '...' : title} 🎬
┃ sᴛᴀᴛᴜs : ${status}
┃ ᴍᴏᴅᴇ : ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video'],
  category: 'media',
  description: 'Download video from YouTube',
  usage: '.video <name/url>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;

      if (!text) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ.*');
      }

      await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

      let video;
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const videoId = text.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!videoId) return extra.reply('❌ *ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ ɪɴᴠᴀʟɪᴅᴇ.*');
        video = { url: text, title: 'YouTube Video', thumbnail: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg` };
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) return extra.reply('❌ *ᴀᴜᴄᴜɴᴇ ᴠɪᴅéᴏ ᴛʀᴏᴜᴠéᴇ.*');
        video = search.videos[0];
      }

      // Envoi de l'aperçu avec Design AGM
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: AGM_DESIGN(video.title || text, '🟢 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...')
      }, { quoted: msg });

      // --- SYSTÈME DE FALLBACK MULTI-API (Elite > Yupra > Okatsu) ---
      let videoData;
      try {
        videoData = await APIs.getEliteProTechVideoByUrl(video.url);
      } catch (e1) {
        try {
          videoData = await APIs.getYupraVideoByUrl(video.url);
        } catch (e2) {
          videoData = await APIs.getOkatsuVideoByUrl(video.url);
        }
      }

      if (!videoData || !videoData.download) {
        throw new Error('No download URL found');
      }

      // Envoi de la vidéo finale
      await sock.sendMessage(chatId, {
        video: { url: videoData.download },
        mimetype: 'video/mp4',
        fileName: `${(videoData.title || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
        caption: AGM_DESIGN(videoData.title || video.title, '✅ sᴜᴄᴄᴇss')
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[VIDEO ERROR]:', error);
      await extra.reply('❌ *éᴄʜᴇᴄ ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ. ᴄᴏɴᴛᴇɴᴜ ᴘᴇᴜᴛ-êᴛʀᴇ ᴛʀᴏᴘ ʟᴏᴜʀᴅ ᴏᴜ ʙʟᴏǫᴜé.*');
    }
  }
};
