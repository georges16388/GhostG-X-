/**
 * ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for GhostG-X V5.3 (Dual Mode Video/Audio)
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (quality, type) => {
  return `*╭╼━≪• ${toStyledCaps('ғᴀᴄᴇʙᴏᴏᴋ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴄᴏᴍᴘʟᴇᴛᴇᴅ')}*
*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* 📹 *${toStyledCaps('ǫᴜᴀʟɪᴛʏ')}* : *${toStyledCaps(quality || 'ᴀᴜᴛᴏ')}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'fbmp3', 'fbaudio'],
  category: 'media',
  description: 'Télécharger des vidéos ou l\'audio depuis Facebook',
  usage: '.fb <URL>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const command = extra.command || '';
    const text = args.join(' ');

    try {
      // Extraction de l'URL (depuis le texte ou un message cité)
      const urlMatch = text.match(/https?:\/\/(?:www\.|m\.|web\.|fb\.)?(facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i);
      const url = urlMatch ? urlMatch[0] : null;

      if (!url) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ ᴠᴀʟɪᴅᴇ")}*`);
      }

      // Détection du mode Audio (via alias ou argument)
      const isAudioMode = command.includes('mp3') || command.includes('audio') || args.some(a => ['audio', 'mp3'].includes(a.toLowerCase()));

      await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

      try {
        const data = await facebookdl(url);
        
        // Sélection de la meilleure qualité (HD si dispo, sinon le premier résultat)
        const videoRes = data.find(v => v.quality === 'hd') || data[0];

        if (!videoRes || !videoRes.url) {
          throw new Error('No video found');
        }

        if (isAudioMode) {
          // --- MODE AUDIO ---
          await sock.sendMessage(chatId, {
            audio: { url: videoRes.url },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
              externalAdReply: {
                title: "ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ",
                body: toStyledCaps("audio extrait avec succes"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false
              }
            }
          }, { quoted: msg });
        } else {
          // --- MODE VIDÉO ---
          await sock.sendMessage(chatId, {
            video: { url: videoRes.url },
            mimetype: 'video/mp4',
            caption: AGM_DESIGN(videoRes.quality, "ᴠɪᴅᴇᴏ ʜᴅ"),
            contextInfo: {
              externalAdReply: {
                title: "ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴘʟᴀʏᴇʀ",
                body: toStyledCaps("video recuperee avec succes"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false
              }
            }
          }, { quoted: msg });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

      } catch (error) {
        console.error('[FB DL ERROR]:', error.message);
        await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ. sᴏᴜʀᴄᴇ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ")}*`);
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
      }
    } catch (e) {
      console.error('[FB GLOBAL ERROR]:', e);
    }
  }
};
