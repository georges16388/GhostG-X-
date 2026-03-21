/**
 * TikTok Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { ttdl } = require('ruhend-scraper');
const axios = require('axios');
const APIs = require('../../utils/api');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, type) => `╭╼━≪• ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} ⚡
┃ ᴛɪᴛʟᴇ : ${title ? (title.length > 15 ? title.substring(0, 12) + '...' : title) : 'ɴ/ᴀ'}
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

const processedMessages = new Set();

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'media',
  description: 'Download TikTok videos/slideshows',
  usage: '.tt <URL>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);
      
      if (!url) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ.*');
      }

      const ttPattern = /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\//;
      if (!ttPattern.test(url)) {
        return extra.reply('❌ *ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ ɪɴᴠᴀʟɪᴅᴇ.*');
      }

      await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

      let videoUrl = null;
      let title = null;

      // --- TEST API 1: SIPUTZX ---
      try {
        const result = await APIs.getTikTokDownload(url);
        videoUrl = result.videoUrl || result.nowm || result.url;
        title = result.title;
      } catch (e) { console.log("Siputzx fail, switching to Scraper..."); }

      // --- TEST API 2: RUHEND SCRAPER (Gère aussi les photos/slideshows) ---
      if (!videoUrl) {
        try {
          const res = await ttdl(url);
          if (res?.data) {
            const items = res.data;
            for (let i = 0; i < Math.min(10, items.length); i++) {
              const media = items[i];
              const isVideo = media.type === 'video' || /\.(mp4|mov)$/i.test(media.url);
              const caption = AGM_DESIGN(title || 'TikTok Content', isVideo ? 'video' : 'photo');

              await sock.sendMessage(chatId, {
                [isVideo ? 'video' : 'image']: { url: media.url },
                mimetype: isVideo ? 'video/mp4' : 'image/jpeg',
                caption: caption
              }, { quoted: msg });
            }
            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            return;
          }
        } catch (e) { console.log("Scraper fail."); }
      }

      // --- ENVOI FINAL SI VIDÉO TROUVÉE VIA API 1 ---
      if (videoUrl) {
        try {
          const videoRes = await axios.get(videoUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          await sock.sendMessage(chatId, {
            video: Buffer.from(videoRes.data),
            mimetype: 'video/mp4',
            caption: AGM_DESIGN(title, 'video')
          }, { quoted: msg });

          await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
        } catch (e) {
          // Fallback direct URL si le buffer échoue
          await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            caption: AGM_DESIGN(title, 'video')
          }, { quoted: msg });
        }
      } else {
        await extra.reply("❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴛéʟéᴄʜᴀʀɢᴇʀ ᴄᴇᴛᴛᴇ ᴠɪᴅéᴏ.*");
      }

    } catch (error) {
      console.error('TikTok Error:', error);
      await extra.reply("❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ.*");
    }
  }
};
