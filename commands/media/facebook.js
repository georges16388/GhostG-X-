/**
 * Facebook Downloader - AGM Media Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (quality, duration) => `╭╼━≪• ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴄᴏᴍᴘʟᴇᴛᴇᴅ
┃ ǫᴜᴀʟɪᴛʏ : ${quality || 'ᴀᴜᴛᴏ'} 📹
┃ ᴅᴜʀᴀᴛɪᴏɴ : ${duration || '--:--'} ⏱️
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

const processedMessages = new Set();

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'media',
  description: 'Download Facebook videos',
  usage: '.fb <URL>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);
      
      if (!url) {
        return await extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ᴠᴀʟɪᴅᴇ.*');
      }
      
      // Validation du lien
      const fbPattern = /https?:\/\/(?:www\.|m\.)?(facebook\.com|fb\.watch|fb\.com)\//;
      if (!fbPattern.test(url)) {
        return await extra.reply('❌ *ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ɪɴᴠᴀʟɪᴅᴇ.*');
      }
      
      await sock.sendMessage(extra.from, { react: { text: '📥', key: msg.key } });
      
      try {
        const data = await facebookdl(url);
        if (!data?.video?.[0]) throw new Error('No data');
        
        const videoOption = data.video[0];
        const videoData = await videoOption.download();
        
        let videoContent = null;
        if (typeof videoData === 'string') videoContent = { url: videoData };
        else if (Buffer.isBuffer(videoData)) videoContent = videoData;
        else if (videoData?.url) videoContent = { url: videoData.url };
        
        if (!videoContent) throw new Error('Format Error');

        const caption = AGM_DESIGN(videoOption.quality, data.duration);
        
        // Envoi de la vidéo
        await sock.sendMessage(extra.from, {
          video: videoContent,
          mimetype: 'video/mp4',
          caption: caption
        }, { quoted: msg });

        await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

      } catch (error) {
        console.error('FB DL Error:', error);
        await extra.reply(`❌ *éᴄʜᴇᴄ ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ.*`);
      }
    } catch (e) {
      console.error('FB Cmd Error:', e);
    }
  }
};
