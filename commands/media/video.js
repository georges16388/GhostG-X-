/**
 * YouTube Video Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');

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

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, status) => {
  const shortTitle = title.length > 20 ? title.substring(0, 17) + '...' : title;
  return `╭╼━≪• *ʏᴏᴜᴛᴜʙᴇ ᴠɪᴅᴇᴏ* •≫━╾╮
┃ 
┃ 🎬 ${toSmallCaps('ᴠɪᴅᴇᴏ')} : ${toSmallCaps(shortTitle)}
┃ 🟢 ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps(status)}
┃ ⚡ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps('ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ')}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video', 'shorts'],
  category: 'media',
  description: 'Télécharger des vidéos ou Shorts YouTube en HD',
  usage: '.video <nom/url>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const text = args.join(' ');

    try {
      if (!text) {
        const warn = toSmallCaps("veuillez entrer un nom ou un lien youtube");
        return extra.reply(`⚠️ *${warn}*`);
      }

      // Réaction de lancement
      await sock.sendMessage(chatId, { react: { text: '🎥', key: msg.key } });

      let video;
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];

        if (!videoId) {
            const errLink = toSmallCaps("lien youtube invalide");
            return extra.reply(`❌ *${errLink}*`);
        }

        video = { 
          url: `https://www.youtube.com/watch?v=${videoId}`, 
          title: 'ʏᴏᴜᴛᴜʙᴇ ᴄᴏɴᴛᴇɴᴛ', 
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` 
        };
      } else {
        // Recherche par mots-clés
        const search = await yts(text);
        if (!search || !search.videos.length) {
          const noRes = toSmallCaps("aucune video trouvee");
          return extra.reply(`❌ *${noRes}*`);
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu avec le design Ghost
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title || text, 'ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...'),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴠɪᴅᴇᴏ ᴘʟᴀʏᴇʀ",
            body: toSmallCaps("preparation du fichier mp4"),
            mediaType: 2,
            thumbnailUrl: video.thumbnail || video.image,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      // 2. Système de Fallback Multi-API
      let videoData = null;
      const methods = [
        APIs.getEliteProTechVideoByUrl,
        APIs.getYupraVideoByUrl,
        APIs.getOkatsuVideoByUrl
      ];

      for (const method of methods) {
        try {
          if (typeof method === 'function') {
            videoData = await method(video.url);
            if (videoData && (videoData.download || videoData.dl || videoData.url)) break;
          }
        } catch (e) { continue; }
      }

      const finalUrl = videoData?.download || videoData?.dl || videoData?.url;

      if (!finalUrl) throw new Error('No download URL');

      // 3. Envoi de la vidéo finale avec le statut Succès
      await sock.sendMessage(chatId, {
        video: { url: finalUrl },
        mimetype: 'video/mp4',
        fileName: `${(video.title || 'video')}.mp4`,
        caption: AGM_DESIGN(videoData?.title || video.title, 'sᴜᴄᴄᴇss ✅'),
        contextInfo: {
            externalAdReply: {
              title: videoData?.title || video.title,
              body: toSmallCaps("ghostg-x high definition"),
              mediaType: 2,
              thumbnailUrl: video.thumbnail || video.image,
              showAdAttribution: true
            }
          }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[VIDEO ERROR]:', error);
      const fail = toSmallCaps("echec du telechargement. contenu trop lourd ou indisponible.");
      await extra.reply(`❌ *${fail}*`);
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
