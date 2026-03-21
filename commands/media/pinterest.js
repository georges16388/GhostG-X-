/**
 * Pinterest Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, type) => `╭╼━≪• ᴘɪɴᴛᴇʀᴇsᴛ ᴅʟ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
┃ ᴛɪᴛʟᴇ : ${title.length > 15 ? title.substring(0, 12) + '...' : title}
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} 📌
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

const processedMessages = new Set();

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pindl'],
  category: 'media',
  description: 'Download images/videos from Pinterest',
  usage: '.pin <URL>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const text = args.join(' ') || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);
      
      if (!text) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ (ᴘɪɴ.ɪᴛ / ᴘɪɴᴛᴇʀᴇsᴛ.ᴄᴏᴍ).*');
      }

      // Extraction propre de l'URL
      const urlMatch = text.match(/https?:\/\/(?:[^\s]*pinterest[^\s]*\/pin\/|pin\.it\/)[^\s]+/i);
      if (!urlMatch) {
        return extra.reply('❌ *ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ ɪɴᴠᴀʟɪᴅᴇ.*');
      }
      
      const pinterestUrl = urlMatch[0];
      await sock.sendMessage(extra.from, { react: { text: '📌', key: msg.key } });

      // API Nexray
      const apiUrl = `https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(pinterestUrl)}`;
      
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (!response.data?.status || !response.data.result) {
        throw new Error('Invalid API response');
      }

      const pinData = response.data.result;
      const isVideo = !!pinData.video;
      const mediaUrl = pinData.video || pinData.image || pinData.url;
      
      if (!mediaUrl) throw new Error('No media found');

      const caption = AGM_DESIGN(pinData.title || 'Pinterest Pin', isVideo ? 'video' : 'image');

      if (isVideo) {
        // Téléchargement du buffer vidéo pour contourner les expirations de tokens
        const videoRes = await axios.get(mediaUrl, { 
          responseType: 'arraybuffer',
          timeout: 60000 
        });
        
        await sock.sendMessage(extra.from, {
          video: Buffer.from(videoRes.data),
          caption: caption,
          mimetype: 'video/mp4'
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          image: { url: mediaUrl },
          caption: caption
        }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Pinterest Error:', error);
      await extra.reply('❌ *éᴄʜᴇᴄ ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴘɪɴᴛᴇʀᴇsᴛ.*');
    }
  }
};
