/**
 * Pinterest Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for GhostG-X V5.3 (Fast Streaming)
 */

const axios = require('axios');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
    if (!text) return "";
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, type) => {
  const shortTitle = title ? (title.length > 20 ? title.substring(0, 17) + '...' : title) : 'ᴘɪɴᴛᴇʀᴇsᴛ';
  return `*╭╼━≪• ${toStyledCaps('ᴘɪɴᴛᴇʀᴇsᴛ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}*
*┃* 📝 *${toStyledCaps('ᴛɪᴛʟᴇ')}* : *${toStyledCaps(shortTitle)}*
*┃* ⚡ *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}* 📌
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pint', 'pindl'],
  category: 'media',
  description: 'Télécharger des images ou vidéos depuis Pinterest',
  usage: '.pin <URL>',

  async execute(sock, msg, args, extra) {
    const from = extra.from;
    const text = args.join(' ');

    try {
      // Extraction de l'URL Pinterest (Supporte pin.it et pinterest.com/pin/)
      const urlMatch = text.match(/https?:\/\/(?:[^\s]*pinterest[^\s]*\/pin\/|pin\.it\/)[^\s]+/i);
      if (!urlMatch) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ sᴀɪsɪʀ ᴜɴ ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ ᴠᴀʟɪᴅᴇ")}*`);
      }

      const pinterestUrl = urlMatch[0];
      await sock.sendMessage(from, { react: { text: '📌', key: msg.key } });

      // Utilisation d'une API de secours stable (Siputzx / Nexray Fallback)
      const res = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(pinterestUrl)}`);
      
      if (!res.data || !res.data.data) {
        throw new Error('Données introuvables');
      }

      const pinData = res.data.data;
      // Détection intelligente du média
      const mediaUrl = pinData.video || pinData.url || pinData.image || pinData.images;
      const isVideo = (typeof mediaUrl === 'string' && mediaUrl.includes('.mp4')) || !!pinData.video;

      const caption = AGM_DESIGN(pinData.title || 'Pinterest Pin', isVideo ? 'video' : 'image');

      if (isVideo) {
        // --- MODE VIDÉO ---
        await sock.sendMessage(from, {
          video: { url: mediaUrl },
          caption: caption,
          mimetype: 'video/mp4',
          contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ᴘɪɴᴛᴇʀᴇsᴛ ᴘʟᴀʏᴇʀ",
                body: toStyledCaps("flux video hd recupere"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false
            }
          }
        }, { quoted: msg });
      } else {
        // --- MODE IMAGE ---
        await sock.sendMessage(from, {
          image: { url: mediaUrl },
          caption: caption,
          contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ᴘɪɴᴛᴇʀᴇsᴛ ɪᴍᴀɢᴇ",
                body: toStyledCaps("image hd recuperee"),
                mediaType: 1,
                thumbnailUrl: mediaUrl,
                showAdAttribution: false
            }
          }
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[PINTEREST ERROR]:', error.message);
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴜ ᴛᴇʟᴇᴄʜᴀʀɢᴇᴍᴇɴᴛ. ʟɪᴇɴ ᴘᴇᴜᴛ-ᴇᴛʀᴇ ᴘʀɪᴠᴇ")}*`);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  }
};
