/**
 * Instagram Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const { igdl } = require('ruhend-scraper');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (count, index) => `╭╼━≪• ɪɴsᴛᴀɢʀᴀᴍ ᴅʟ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
┃ ɪᴛᴇᴍ : ${index + 1}/${count} 📸
┃ ᴍᴏᴅᴇ : ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl', 'reels'],
  category: 'media',
  description: 'Télécharger des photos/vidéos/reels Instagram',
  usage: '.ig <URL>',

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);

    if (!url) {
      return sock.sendMessage(chatId, { text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ.*' }, { quoted: msg });
    }

    // Regex élargie pour inclure les nouveaux formats de partage (/share/, /s/, etc.)
    const igPattern = /(https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+\/)?(p|reel|tv|stories|share|s)\/|[a-zA-Z0-9_.]+\/)/;
    
    if (!igPattern.test(url)) {
      return sock.sendMessage(chatId, { text: '❌ *ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ ɪɴᴠᴀʟɪᴅᴇ.*' }, { quoted: msg });
    }

    await sock.sendMessage(chatId, { react: { text: '📥', key: msg.key } });

    try {
      const downloadData = await igdl(url);
      
      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
        throw new Error("Aucun média trouvé ou compte privé.");
      }

      const mediaList = downloadData.data.slice(0, 10); // Limite à 10 pour éviter le spam

      for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i];
        const mediaUrl = item.url || item.downloadUrl;
        
        // Détection intelligente du type de média
        const isVideo = item.type === 'video' || /\.(mp4|mov|avi)$/i.test(mediaUrl);
        const caption = AGM_DESIGN(mediaList.length, i);

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

        // Délai de sécurité pour éviter le spam/ban
        if (mediaList.length > 1) await new Promise(resolve => setTimeout(resolve, 1500));
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('IG DL Error:', error);
      await sock.sendMessage(chatId, { 
        text: `❌ *ᴇʀʀᴇᴜʀ* : ${error.message.includes('privé') ? 'ʟᴇ ᴄᴏᴍᴘᴛᴇ ᴇsᴛ ᴘʀɪᴠé.' : 'ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴛéʟéᴄʜᴀʀɢᴇʀ ᴄᴇ ᴍéᴅɪᴀ.'}` 
      }, { quoted: msg });
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
