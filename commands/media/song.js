/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const yts = require('yt-search');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

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
const AGM_DESIGN = (title, duration) => {
  const shortTitle = title.length > 20 ? title.substring(0, 17) + '...' : title;
  return `╭╼━≪• *ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ* •≫━╾╮
┃ 
┃ 🎵 ${toSmallCaps('sᴏɴɢ')} : ${toSmallCaps(shortTitle)}
┃ ⏱️ ${toSmallCaps('ᴅᴜʀᴀᴛɪᴏɴ')} : ${duration}
┃ 🟢 ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ')}...
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta', 'audio'],
  category: 'media',
  description: 'Télécharger de la musique depuis YouTube',
  usage: '.song <nom/url>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;

      if (!text) {
        const warn = toSmallCaps("veuillez entrer un nom ou un lien youtube");
        return extra.reply(`⚠️ *${warn}*`);
      }

      // Réaction de recherche
      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      let video;
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        const videoId = text.split('v=')[1]?.split('&')[0] || text.split('/').pop();
        const search = await yts({ videoId });
        video = search;
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
            const noRes = toSmallCaps("aucun resultat trouve");
            return extra.reply(`❌ *${noRes}*`);
        }
        video = search.videos[0];
      }

      // 1. Envoi de l'aperçu avec Thumbnail et Design AGM
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || video.image },
        caption: AGM_DESIGN(video.title, video.timestamp || video.duration.timestamp),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴍᴜsɪᴄ ᴘʟᴀʏᴇʀ",
            body: toSmallCaps("recherche en cours..."),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            showAdAttribution: true
          }
        }
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
          const audioUrl = res?.download || res?.dl || res?.url;
          if (!audioUrl) continue;

          const response = await axios.get(audioUrl, { 
            responseType: 'arraybuffer', 
            timeout: 100000, // Augmenté pour les gros fichiers
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          audioBuffer = Buffer.from(response.data);
          if (audioBuffer.length > 50000) { // Vérifie que le fichier fait au moins 50ko
            success = true;
            break; 
          }
        } catch (e) { 
            console.log(`[LOG] API ${api.name} échouée...`); 
        }
      }

      if (!success) throw new Error('Sources épuisées');

      // --- CONVERSION & OPTIMISATION ---
      let finalBuffer = audioBuffer;
      const isM4A = audioBuffer.slice(4, 8).toString('ascii') === 'ftyp';

      if (isM4A) {
        try {
          finalBuffer = await toAudio(audioBuffer, 'm4a');
        } catch (convErr) {
          finalBuffer = audioBuffer;
        }
      }

      // 2. Envoi du fichier audio final (Mode Document/Audio pour éviter la compression)
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false, // Envoi en mode musique (pas vocal)
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: toSmallCaps(video.author.name || "ɢʜᴏsᴛɢ-x ᴍᴜsɪᴄ"),
            mediaType: 1,
            thumbnailUrl: video.thumbnail || video.image,
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error(err);
      const errTxt = toSmallCaps("le telechargement a echoue. sources indisponibles.");
      await extra.reply(`❌ *${errTxt}*`);
    }
  }
};
