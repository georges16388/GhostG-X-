/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const yts = require('yt-search');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, duration) => `╭╼━≪• ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ •≫━╾╮
┃ sᴏɴɢ : ${title.length > 20 ? title.substring(0, 17) + '...' : title} 🎵
┃ ᴅᴜʀᴀᴛɪᴏɴ : ${duration} ⏱️
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube',
  usage: '.song <name/url>',
  
  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;
      
      if (!text) return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ.*');

      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      let video;
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        const videoId = text.split('v=')[1]?.split('&')[0] || text.split('/').pop();
        video = await yts({ videoId });
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) return extra.reply('❌ *ᴀᴜᴄᴜɴ ʀésᴜʟᴛᴀᴛ ᴛʀᴏᴜvé.*');
        video = search.videos[0];
      }

      // Notification avec Thumbnail et Design AGM
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: AGM_DESIGN(video.title, video.timestamp)
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
          const audioUrl = res.download || res.dl || res.url;
          if (!audioUrl) continue;

          const response = await axios.get(audioUrl, { 
            responseType: 'arraybuffer', 
            timeout: 90000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          audioBuffer = Buffer.from(response.data);
          if (audioBuffer.length > 0) {
            success = true;
            break; 
          }
        } catch (e) { console.log(`API ${api.name} failed, trying next...`); }
      }

      if (!success) throw new Error('Sources Exhausted');

      // --- CONVERSION EN MP3 SI NÉCESSAIRE ---
      // (Détection rapide du format pour assurer la compatibilité WhatsApp)
      const isM4A = audioBuffer.slice(4, 8).toString('ascii') === 'ftyp';
      let finalBuffer = audioBuffer;

      if (isM4A) {
        try {
          finalBuffer = await toAudio(audioBuffer, 'm4a');
        } catch (convErr) {
          // Si la conversion échoue, on envoie le M4A original (WhatsApp le lit souvent très bien)
          finalBuffer = audioBuffer;
        }
      }

      // Envoi du fichier audio final
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error(err);
      await extra.reply('❌ *ʟᴇ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴀ éᴄʜᴏᴜé. ᴄᴏɴᴛᴇɴᴜ ʙʟᴏǫᴜé ᴏᴜ ɪɴᴅɪsᴘᴏɴɪʙʟᴇ.*');
    }
  }
};
