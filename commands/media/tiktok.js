/**
 * TikTok Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { ttdl } = require('ruhend-scraper');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, type) => {
  const shortTitle = title ? (title.length > 15 ? title.substring(0, 12) + '...' : title) : 'ɴ/ᴀ';
  return `╭╼━≪• *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}
┃ ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps(type)} ⚡
┃ ${toSmallCaps('ᴛɪᴛʟᴇ')} : ${toSmallCaps(shortTitle)}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'media',
  description: 'Télécharger des vidéos ou diaporamas TikTok sans watermark',
  usage: '.tt <URL>',

  async execute(sock, msg, args, extra) {
    try {
      const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);

      if (!url) {
        const warn = toSmallCaps("veuillez fournir un lien tiktok");
        return extra.reply(`⚠️ *${warn}*`);
      }

      if (!url.includes('tiktok.com')) {
        const errLink = toSmallCaps("lien tiktok invalide");
        return extra.reply(`❌ *${errLink}*`);
      }

      // Réaction de chargement (Sablier)
      await sock.sendMessage(extra.from, { react: { text: '⏳', key: msg.key } });

      // Extraction via Ruhend-Scraper
      const res = await ttdl(url);

      if (!res || !res.data) {
        throw new Error("No data found");
      }

      const { title, video, nowm, photos } = res.data;

      // --- CAS 1 : DIAPORAMA (PHOTOS) ---
      if (photos && Array.isArray(photos) && photos.length > 0) {
        for (let i = 0; i < Math.min(10, photos.length); i++) {
          await sock.sendMessage(extra.from, {
            image: { url: photos[i] },
            caption: i === 0 ? AGM_DESIGN(title || "Slideshow", "photo") : ""
          }, { quoted: msg });
        }
      } 
      // --- CAS 2 : VIDÉO ---
      else {
        const videoUrl = nowm || video; // Priorité au No-Watermark

        await sock.sendMessage(extra.from, {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          caption: AGM_DESIGN(title || "TikTok Video", "video"),
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ᴛɪᴋᴛᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toSmallCaps("telechargement reussi"),
              mediaType: 2,
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              showAdAttribution: true
            }
          }
        }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('TikTok DL Error:', error);
      const failMsg = toSmallCaps("impossible de telecharger ce contenu");
      const apiMsg = toSmallCaps("l'api est peut-etre saturee");
      await extra.reply(`❌ *${failMsg}*\n_${apiMsg}_`);
      await sock.sendMessage(extra.from, { react: { text: '❌', key: msg.key } });
    }
  }
};
