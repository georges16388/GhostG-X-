/**
 * TikTok Downloader - AGM Elite Edition (Dual Mode)
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
  return `╭╼━≪• *ᴛɪᴋᴛᴏᴋ sʏsᴛᴇᴍ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}
┃ ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps(type)} ⚡
┃ ${toSmallCaps('ᴛɪᴛʟᴇ')} : ${toSmallCaps(shortTitle)}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
};

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'ttmp3'],
  category: 'media',
  description: 'Télécharger Vidéo ou Audio TikTok',
  usage: '.tt <URL> [audio]',

  async execute(sock, msg, args, extra) {
    try {
      const url = args.find(a => a.includes('tiktok.com'));
      const isAudioMode = args.some(a => a.toLowerCase() === 'audio') || extra.prefix.includes('mp3');

      if (!url) {
        const warn = toSmallCaps("usage : .tt <lien> ou .tt <lien> audio");
        return extra.reply(`⚠️ *${warn}*`);
      }

      // Réaction selon le mode
      await sock.sendMessage(extra.from, { react: { text: isAudioMode ? '🎶' : '⏳', key: msg.key } });

      const res = await ttdl(url);
      if (!res || !res.data) throw new Error("No data");

      const { title, video, nowm, photos, audio } = res.data;

      // --- OPTION 1 : UNIQUEMENT L'AUDIO ---
      if (isAudioMode) {
        if (!audio) throw new Error("Audio not found");
        
        await sock.sendMessage(extra.from, {
          audio: { url: audio },
          mimetype: 'audio/mp4',
          ptt: false, // Envoi en tant que fichier audio (pas vocal)
          contextInfo: {
            externalAdReply: {
              title: toSmallCaps("tiktok mp3 player"),
              body: toSmallCaps(title || "Musique TikTok"),
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
              showAdAttribution: true
            }
          }
        }, { quoted: msg });
        
        await extra.reply(AGM_DESIGN(title, "audio mp3"));
      } 
      
      // --- OPTION 2 : DIAPORAMA PHOTOS ---
      else if (photos && Array.isArray(photos) && photos.length > 0) {
        for (let i = 0; i < Math.min(10, photos.length); i++) {
          await sock.sendMessage(extra.from, {
            image: { url: photos[i] },
            caption: i === 0 ? AGM_DESIGN(title || "Slideshow", "photo") : ""
          }, { quoted: msg });
        }
      } 
      
      // --- OPTION 3 : VIDÉO (PAR DÉFAUT) ---
      else {
        const videoUrl = nowm || video;
        await sock.sendMessage(extra.from, {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          caption: AGM_DESIGN(title || "TikTok Video", "video"),
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ᴛɪᴋᴛᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toSmallCaps("video sans watermark"),
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
      const failMsg = toSmallCaps("echec du telechargement");
      await extra.reply(`❌ *${failMsg}*`);
    }
  }
};
