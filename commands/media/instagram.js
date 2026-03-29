/**
 * ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Link Integration
 */

const { igdl } = require('ruhend-scraper');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- DESIGN MIS À JOUR (Ajout du paramètre url) ---
const AGM_DESIGN = (count, index, url) => (
  `*╭╼━≪• ${toStyledCaps('ɪɴsᴛᴀɢʀᴀᴍ sʏsᴛᴇᴍ')} •≫━╾╮*\n` +
  `*┃*\n` +
  `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴄᴏᴍᴘʟᴇᴛᴇᴅ')}*\n` +
  `*┃* 📦 *${toStyledCaps('ɪᴛᴇᴍ')}* : ${index + 1}/${count} 📸\n` +
  `*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('ʜɪɢʜ-ǫᴜᴀʟɪᴛʏ')}*\n` +
  `*┃* 🔗 *${toStyledCaps('ʟɪᴇɴ')}* : ${url}\n` +
  `*┃*\n` +
  `*╰━━━━━━━━━━━━━━━╯*\n` +
  `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
);

module.exports = {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl', 'reels'],
  category: 'media',
  description: 'Télécharger des photos/vidéos/reels Instagram',
  usage: '.ig <URL>',

  async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const text = args.join(' ');

    try {
      const urlMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
      const url = urlMatch ? urlMatch[0].split('?')[0] : null;

      if (!url) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ғᴏᴜʀɴɪʀ ᴜɴ ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ ᴠᴀʟɪᴅᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '📥', key: msg.key } });

      const res = await igdl(url);

      if (!res || !res.data || res.data.length === 0) {
        throw new Error("Contenu introuvable.");
      }

      const mediaList = res.data.slice(0, 5);

      for (let i = 0; i < mediaList.length; i++) {
        const mediaUrl = mediaList[i].url;
        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
        
        // --- APPEL DU DESIGN AVEC L'URL ---
        const caption = AGM_DESIGN(mediaList.length, i, url);

        if (isVideo) {
          await sock.sendMessage(chatId, {
            video: { url: mediaUrl },
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `ghostgx_ig_${i}.mp4`
          }, { quoted: msg });
        } else {
          await sock.sendMessage(chatId, {
            image: { url: mediaUrl },
            caption: caption
          }, { quoted: msg });
        }

        if (mediaList.length > 1) await new Promise(r => setTimeout(r, 1000));
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[IG ERROR]:', error.message);
      await extra.reply(`❌ *${toStyledCaps('ᴇᴄʜᴇᴄ')}* : ${toStyledCaps('ɪɴsᴛᴀɢʀᴀᴍ ᴀ ʙʟᴏǫᴜᴇ ʟᴀ ᴄᴏɴɴᴇxɪᴏɴ')}`);
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
  }
};
