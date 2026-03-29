/**
 * Song Downloader - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Source : ytdl-core + btch-downloader fallback
 */

const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { ytmp3 } = require('btch-downloader');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_DESIGN = (title, duration) => {
  const shortTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
  return (
    `*╭╼━≪• ${toStyledCaps('ʏᴏᴜᴛᴜʙᴇ ᴍᴜsɪᴄ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* 🎵 *${toStyledCaps('sᴏɴɢ')}* : *${toStyledCaps(shortTitle)}*\n` +
    `*┃* ⏱️ *${toStyledCaps('ᴅᴜʀᴀᴛɪᴏɴ')}* : *${duration}*\n` +
    `*┃* 🟢 *${toStyledCaps('sᴛᴀᴛᴜs')}* : *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ')}...*\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
  );
};

// Télécharge l'audio en buffer via ytdl-core
const downloadAudioBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    });
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta', 'audio'],
  category: 'media',
  description: 'Télécharger de la musique depuis YouTube',
  usage: '.song <nom/url>',

  async execute(sock, msg, args, extra) {
    const text = args.join(' ');
    const chatId = extra.from;

    try {
      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ɴᴏᴍ ᴏᴜ ᴜɴ ʟɪᴇɴ ʏᴏᴜᴛᴜʙᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      // Recherche de la vidéo
      let video;
      const ytUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

      if (ytUrlPattern.test(text)) {
        const videoId = text.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1];
        video = await yts({ videoId: videoId || text });
        if (!video?.title) {
          const search = await yts(text);
          video = search.videos?.[0];
        }
      } else {
        const search = await yts(text);
        if (!search?.videos?.length) {
          return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
        }
        video = search.videos[0];
      }

      if (!video?.url) {
        return extra.reply(`❌ *${toStyledCaps('ᴠɪᴅᴇᴏ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ')}*`);
      }

      const duration = video.timestamp || video.duration?.timestamp || '??:??';
      const thumbnail = video.thumbnail || video.image;

      // Envoi de l'aperçu SANS lien dans le thumbnail
      await sock.sendMessage(chatId, {
        image: { url: thumbnail },
        caption: AGM_DESIGN(video.title, duration),
        contextInfo: {
          externalAdReply: {
            title: toStyledCaps('ɢʜᴏsᴛ ᴍᴜsɪᴄ sʏsᴛᴇᴍ'),
            body: toStyledCaps('téléchargement en cours...'),
            mediaType: 1,
            showAdAttribution: false
            // ✅ thumbnailUrl retiré = plus de lien affiché
          }
        }
      }, { quoted: msg });

      // ============================================================
      // TÉLÉCHARGEMENT : ytdl-core → btch-downloader fallback
      // ============================================================
      let audioBuffer = null;
      let finalUrl = null;

      // Méthode 1 : ytdl-core (buffer direct, le plus fiable sur VPS)
      try {
        console.log('[SONG] Tentative ytdl-core...');
        audioBuffer = await downloadAudioBuffer(video.url);
        console.log('[SONG] ytdl-core ✅', audioBuffer.length, 'bytes');
      } catch (e) {
        console.warn('[SONG] ytdl-core échoué:', e.message);
      }

      // Méthode 2 : btch-downloader (URL directe)
      if (!audioBuffer) {
        try {
          console.log('[SONG] Tentative btch-downloader...');
          const result = await ytmp3(video.url);
          finalUrl = result?.dl || result?.url || result?.download;
          if (finalUrl) console.log('[SONG] btch-downloader ✅');
        } catch (e) {
          console.warn('[SONG] btch-downloader échoué:', e.message);
        }
      }

      if (!audioBuffer && !finalUrl) {
        throw new Error('Toutes les sources audio ont échoué');
      }

      // Envoi de l'audio
      const audioPayload = audioBuffer
        ? { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, ptt: false }
        : { audio: { url: finalUrl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, ptt: false };

      await sock.sendMessage(chatId, {
        ...audioPayload,
        contextInfo: {
          externalAdReply: {
            title: video.title.substring(0, 60),
            body: toStyledCaps('ɢʜᴏsᴛɢ-x ᴘʀᴇsᴛɪɢᴇ ᴀᴜᴅɪᴏ'),
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

    } catch (err) {
      console.error('[SONG ERROR]:', err.message);
      await extra.reply(
        `❌ *${toStyledCaps('ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴇᴄʜᴏᴜᴇ')}*\n\n` +
        `> ${toStyledCaps('sources indisponibles. réessaie dans quelques secondes.')}`
      );
      await sock.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
    }
  }
};