/**
 * TikTok Downloader - AGM Elite Edition (Dual Mode)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Engine : @bochilteam/scraper-tiktok + btch-downloader fallback
 */

const { tiktok } = require('@bochilteam/scraper-tiktok');
const { tiktokdl } = require('btch-downloader');

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

const AGM_DESIGN = (title, type, url) => {
  const shortTitle = title
    ? (title.length > 25 ? title.substring(0, 22) + '...' : title)
    : 'ᴛɪᴋᴛᴏᴋ ᴄᴏɴᴛᴇɴᴛ';
  return (
    `*╭╼━≪• ${toStyledCaps('ᴛɪᴋᴛᴏᴋ sʏsᴛᴇᴍ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}*\n` +
    `*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*\n` +
    `*┃* 📝 *${toStyledCaps('ᴛɪᴛʟᴇ')}* : *${toStyledCaps(shortTitle)}*\n` +
    `*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}\n` +  // ✅ Ajout ici
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
  );
};

// Normalise l'URL TikTok (gère les liens courts vm/vt)
const extractTikTokUrl = (text) => {
  return text.match(
    /https?:\/\/(?:vm|vt|www|m)?\.?tiktok\.com\/[^\s?#]+/i
  )?.[0] || null;
};

// Fetch data avec fallback
const fetchTikTokData = async (url) => {
  // Source 1 : @bochilteam/scraper-tiktok
  try {
    console.log('[TIKTOK] Tentative bochilteam...');
    const res = await tiktok(url);
    if (res) {
      console.log('[TIKTOK] bochilteam ✅');
      return {
        title: res.desc || res.title || 'TikTok',
        video: res.video?.noWatermark || res.video?.watermark || res.videoUrl,
        audio: res.music?.playUrl || res.audioUrl,
        photos: res.imagePost?.images || null,
        cover: res.cover || res.video?.cover || null
      };
    }
  } catch (e) {
    console.warn('[TIKTOK] bochilteam échoué:', e.message);
  }

  // Source 2 : btch-downloader
  try {
    console.log('[TIKTOK] Tentative btch-downloader...');
    const res = await tiktokdl(url);
    if (res) {
      console.log('[TIKTOK] btch-downloader ✅');
      return {
        title: res.title || 'TikTok',
        video: res.videoNoWatermark || res.video || res.dl,
        audio: res.audio || res.music,
        photos: null,
        cover: res.thumbnail || null
      };
    }
  } catch (e) {
    console.warn('[TIKTOK] btch-downloader échoué:', e.message);
  }

  return null;
};

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'ttmp3'],
  category: 'media',
  description: 'Télécharger Vidéo ou Audio TikTok',
  usage: '.tt <URL>  |  .ttmp3 <URL>',

  async execute(sock, msg, args, extra) {
    const from = extra.from;
    const text = args.join(' ');
    const command = (extra.commandName || extra.command || '').toLowerCase();

    try {
      const url = extractTikTokUrl(text);
      if (!url) {
        return extra.reply(
          `⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ sᴀɪsɪʀ ᴜɴ ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ ᴠᴀʟɪᴅᴇ')}*\n\n` +
          `📎 _Exemple_ : \`.tt https://vm.tiktok.com/xxx\``
        );
      }

      const isAudioMode = command.includes('mp3') ||
        args.some(a => ['audio', 'mp3', 'son'].includes(a.toLowerCase()));

      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      const data = await fetchTikTokData(url);

      if (!data) {
        throw new Error('TOUTES_SOURCES_ECHOUEES');
      }

      // ============================================================
      // MODE AUDIO (MP3)
      // ============================================================
      if (isAudioMode) {
        const audioUrl = data.audio;
        if (!audioUrl) {
          return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴅɪᴏ ɴᴏɴ ᴅɪsᴘᴏɴɪʙʟᴇ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴠɪᴅᴇᴏ')}*`);
        }

        await sock.sendMessage(from, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName: `${data.title}.mp3`,
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: toStyledCaps('ᴛɪᴋᴛᴏᴋ ᴀᴜᴅɪᴏ'),
              body: toStyledCaps(data.title.substring(0, 50)),
              mediaType: 1,
              showAdAttribution: false
            }
          }
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
        return;
      }

      // ============================================================
      // MODE PHOTO (ALBUM SLIDESHOW)
      // ============================================================
      if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
        const album = data.photos.slice(0, 10); // max 10 photos

        // Caption uniquement sur la première
        await sock.sendMessage(from, {
          image: { url: album[0] },
          caption: AGM_DESIGN(data.title, `ᴘʜᴏᴛᴏ ᴀʟʙᴜᴍ (${album.length})`)
        }, { quoted: msg });

        // Envoie le reste sans caption
        for (let i = 1; i < album.length; i++) {
          await sock.sendMessage(from, {
            image: { url: album[i] }
          });
        }

        // Audio de fond si dispo
        if (data.audio) {
          await sock.sendMessage(from, {
            audio: { url: data.audio },
            mimetype: 'audio/mpeg',
            ptt: false
          });
        }

        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
        return;
      }

      // ============================================================
      // MODE VIDÉO (DEFAULT — sans watermark)
      // ============================================================
      const videoUrl = data.video;
      if (!videoUrl) {
        throw new Error('VIDEO_NOT_FOUND');
      }

      await sock.sendMessage(from, {
        video: { url: videoUrl },
        caption: AGM_DESIGN(data.title, 'ᴠɪᴅᴇᴏ ɴᴏ ᴡᴍ'),
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: toStyledCaps('ɢʜᴏsᴛ ᴛɪᴋᴛᴏᴋ ᴘʟᴀʏᴇʀ'),
            body: toStyledCaps('ᴠɪᴅᴇᴏ ʜᴅ ꜱᴀɴꜱ ꜰɪʟɪɢʀᴀɴᴇ'),
            mediaType: 1,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[TIKTOK ERROR]:', error.message);
      await extra.reply(
        `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ')}*\n\n` +
        `> ${toStyledCaps('ʟɪᴇɴ ᴇxᴘɪʀᴇ ᴏᴜ sᴇʀᴠɪᴄᴇ sᴀᴛᴜʀᴇ. ʀᴇᴇssᴀɪᴇ.')}`
      );
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  }
};