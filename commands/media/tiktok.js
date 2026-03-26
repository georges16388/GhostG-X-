/**
 * TikTok Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { ttdl } = require('ruhend-scraper');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, type) => `╭╼━≪• ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} ⚡
┃ ᴛɪᴛʟᴇ : ${title ? (title.length > 15 ? title.substring(0, 12) + '...' : title) : 'ɴ/ᴀ'}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'media',
  description: 'Télécharger des vidéos ou diaporamas TikTok',
  usage: '.tt <URL>',

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);

    if (!url) {
      return sock.sendMessage(chatId, { text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ.*' }, { quoted: msg });
    }

    // Validation simple du lien
    if (!url.includes('tiktok.com')) {
      return sock.sendMessage(chatId, { text: '❌ *ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ ɪɴᴠᴀʟɪᴅᴇ.*' }, { quoted: msg });
    }

    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

    try {
      // Utilisation du scraper Ruhend (très stable pour Vidéos + Photos)
      const res = await ttdl(url);

      if (!res || !res.data) {
        throw new Error("Aucune donnée trouvée");
      }

      const data = res.data;

      // --- CAS 1 : C'EST UN DIAPORAMA (PHOTOS) ---
      if (Array.isArray(data)) {
        for (let i = 0; i < Math.min(10, data.length); i++) {
          await sock.sendMessage(chatId, {
            image: { url: data[i].url },
            caption: i === 0 ? AGM_DESIGN("Slideshow", "photo") : ""
          }, { quoted: msg });
        }
      } 
      // --- CAS 2 : C'EST UNE VIDÉO ---
      else if (data.video || data.nowm) {
        const videoUrl = data.video || data.nowm;
        
        await sock.sendMessage(chatId, {
          video: { url: videoUrl }, // Baileys gère le téléchargement via URL directement (plus stable)
          mimetype: 'video/mp4',
          caption: AGM_DESIGN(data.title || "TikTok Video", "video")
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('TikTok DL Error:', error);
      
      // Fallback si Ruhend échoue : on tente une extraction manuelle simple si possible
      await sock.sendMessage(chatId, { 
        text: "❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴛéʟéᴄʜᴀʀɢᴇʀ ᴄᴇᴛᴛᴇ ᴠɪᴅéᴏ.* \n_L'API est peut-être saturée._" 
      }, { quoted: msg });
      
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
