/**
 * ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for GhostG-X V5.3 (Dual Mode Video/Audio)
 */

// On utilise Ruhend-Scraper qui est plus stable
const { fbdown } = require('ruhend-scraper');

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

const AGM_DESIGN = (quality, type, url) => {
  return (
    `*╭╼━≪• ${toStyledCaps('ғᴀᴄᴇʙᴏᴏᴋ sʏsᴛᴇᴍ')} •≫━╾╮*\n` +
    `*┃*\n` +
    `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴄᴏᴍᴘʟᴇᴛᴇᴅ')}*\n` +
    `*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*\n` +
    `*┃* 📹 *${toStyledCaps('ǫᴜᴀʟɪᴛʏ')}* : *${toStyledCaps(quality || 'ᴀᴜᴛᴏ')}*\n` +
    `*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}\n` +
    `*┃*\n` +
    `*╰━━━━━━━━━━━━━━━╯*\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
  );
};

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'fbmp3', 'fbaudio'],
  category: 'media',
  description: 'Télécharger des vidéos ou l\'audio depuis Facebook',
  usage: '.fb <URL>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const command = (extra.commandName || extra.command || '').toLowerCase();
    const text = args.join(' ');

    try {
      const urlMatch = text.match(
        /https?:\/\/(?:www\.|m\.|web\.|fb\.)?(?:facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i
      );
      const url = urlMatch ? urlMatch[0] : null;

      if (!url) {
        return extra.reply(
          `⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ᴠᴀʟɪᴅᴇ')}*\n\n` +
          `📎 _Exemple_ : \`.fb https://www.facebook.com/xxx\``
        );
      }

      const isAudioMode = command.includes('mp3') || command.includes('audio') ||
        args.some(a => ['audio', 'mp3'].includes(a.toLowerCase()));

      await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

      // --- APPEL À RUHEND SCRAPER ---
      const data = await fbdown(url);

      if (!data || !data.url) {
        throw new Error('Aucune vidéo trouvée');
      }

      if (isAudioMode) {
        // --- MODE AUDIO ---
        await sock.sendMessage(chatId, {
          audio: { url: data.url },
          mimetype: 'audio/mpeg',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: toStyledCaps('ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ'),
              body: toStyledCaps('ᴀᴜᴅɪᴏ ᴇxᴛʀᴀɪᴛ ᴀᴠᴇᴄ sᴜᴄᴄᴇs'),
              mediaType: 1,
              showAdAttribution: false,
              renderLargerThumbnail: false,
              thumbnailUrl: 'https://files.catbox.moe/2fmwpu.jpg'
            }
          }
        }, { quoted: msg });

      } else {
        // --- MODE VIDÉO ---
        // Ruhend fournit souvent une URL directe, on l'envoie en MP4
        await sock.sendMessage(chatId, {
          video: { url: data.url },
          mimetype: 'video/mp4',
          caption: AGM_DESIGN('HD/Normal', 'ᴠɪᴅᴇᴏ', url),
          contextInfo: {
            externalAdReply: {
              title: toStyledCaps('ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴘʟᴀʏᴇʀ'),
              body: toStyledCaps('ᴠɪᴅᴇᴏ ʀᴇᴄᴜᴘᴇʀᴇᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇs'),
              mediaType: 1,
              showAdAttribution: false
            }
          }
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[FB ERROR]:', error.message);
      await extra.reply(
        `❌ *${toStyledCaps('ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ')}*\n\n` +
        `> ${toStyledCaps('ʟᴇ sᴇʀᴠᴇᴜʀ ғᴀᴄᴇʙᴏᴏᴋ ᴀ ʀᴇᴊᴇᴛᴇ ʟᴀ ʀᴇǫᴜᴇᴛᴇ ᴏᴜ ʟᴇ ᴄᴏɴᴛᴇɴᴜ ᴇsᴛ ᴘʀɪᴠᴇ.')}`
      );
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
