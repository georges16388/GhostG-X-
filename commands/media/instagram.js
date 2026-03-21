/**
 * Instagram Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { igdl } = require('ruhend-scraper');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (count, index) => `╭╼━≪• ɪɴsᴛᴀɢʀᴀᴍ ᴅʟ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
┃ ɪᴛᴇᴍ : ${index + 1}/${count} 📸
┃ ᴍᴏᴅᴇ : ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

const processedMessages = new Set();

module.exports = {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl', 'reels'],
  category: 'media',
  description: 'Download Instagram photos/videos/reels',
  usage: '.ig <URL>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      if (processedMessages.has(msg.key.id)) return;
      
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const text = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);
      
      if (!text) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ.*');
      }
      
      const igPattern = /https?:\/\/(?:www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv|stories)\//;
      if (!igPattern.test(text)) {
        return extra.reply('❌ *ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ ɪɴᴠᴀʟɪᴅᴇ.*');
      }
      
      await sock.sendMessage(chatId, { react: { text: '📥', key: msg.key } });
      
      const downloadData = await igdl(text);
      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
        return extra.reply('❌ *ᴀᴜᴄᴜɴ ᴍéᴅɪᴀ ᴛʀᴏᴜvé. ʟᴇ ᴄᴏᴍᴘᴛᴇ ᴇsᴛ ᴘᴇᴜᴛ-êᴛʀᴇ ᴘʀɪvé.*');
      }

      const mediaToDownload = downloadData.data.slice(0, 15); // Limite de sécurité

      for (let i = 0; i < mediaToDownload.length; i++) {
        try {
          const media = mediaToDownload[i];
          const mediaUrl = media.url || media.downloadUrl;
          
          const isVideo = media.type === 'video' || /\.(mp4|mov|avi)$/i.test(mediaUrl);
          const caption = AGM_DESIGN(mediaToDownload.length, i);
          
          if (isVideo) {
            await sock.sendMessage(chatId, {
              video: { url: mediaUrl },
              mimetype: 'video/mp4',
              caption: caption
            }, { quoted: msg });
          } else {
            await sock.sendMessage(chatId, {
              image: { url: mediaUrl },
              caption: caption
            }, { quoted: msg });
          }
          
          // Petit délai pour éviter le ban de session
          if (i < mediaToDownload.length - 1) {
            await new Promise(r => setTimeout(r, 1200));
          }
          
        } catch (mediaError) {
          console.error(`Error at item ${i}:`, mediaError);
        }
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('IG DL Error:', error);
      await extra.reply('❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ ʟᴏʀs ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ.*');
    }
  }
};
