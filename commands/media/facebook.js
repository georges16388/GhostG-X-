/**
 * ғᴀᴄᴇʙᴏᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ - ᴀɢᴍ ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
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
const AGM_DESIGN = (quality, duration) => {
  return `╭╼━≪• *ғᴀᴄᴇʙᴏᴏᴋ ᴅʟ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴄᴏᴍᴘʟᴇᴛᴇᴅ')}
┃ ${toSmallCaps('ǫᴜᴀʟɪᴛʏ')} : ${toSmallCaps(quality || 'ᴀᴜᴛᴏ')} 📹
┃ ${toSmallCaps('ᴅᴜʀᴀᴛɪᴏɴ')} : ${duration || '--:--'} ⏱️
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

const processedMessages = new Set();

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'media',
  description: 'Télécharger des vidéos depuis Facebook',
  usage: '.fb <URL>',

  async execute(sock, msg, args, extra) {
    try {
      // Anti-spam
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const url = args[0] || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);

      if (!url) {
        const warn = toSmallCaps("veuillez fournir un lien facebook valide");
        return await extra.reply(`⚠️ *${warn}*`);
      }

      // Validation du lien
      const fbPattern = /https?:\/\/(?:www\.|m\.)?(facebook\.com|fb\.watch|fb\.com)\//;
      if (!fbPattern.test(url)) {
        const errLink = toSmallCaps("lien facebook invalide");
        return await extra.reply(`❌ *${errLink}*`);
      }

      await sock.sendMessage(extra.from, { react: { text: '📥', key: msg.key } });

      try {
        const data = await facebookdl(url);
        const videoOption = data.video?.[0] || data.result?.[0];

        if (!videoOption) throw new Error('No data found');

        // Récupération de l'URL de téléchargement
        const downloadUrl = typeof videoOption.download === 'function' 
          ? await videoOption.download() 
          : (videoOption.url || videoOption);

        const caption = AGM_DESIGN(videoOption.quality, data.duration);

        // Envoi de la vidéo avec Buffer pour la stabilité
        const videoRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

        await sock.sendMessage(extra.from, {
          video: Buffer.from(videoRes.data),
          mimetype: 'video/mp4',
          caption: caption,
          contextInfo: {
            externalAdReply: {
              title: "ɢʜᴏsᴛ ғᴀᴄᴇʙᴏᴏᴋ ᴘʟᴀʏᴇʀ",
              body: toSmallCaps("video telechargee avec succes"),
              mediaType: 2,
              thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg", // Remplace par ton propre logo si besoin
              showAdAttribution: true
            }
          }
        }, { quoted: msg });

        await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

      } catch (error) {
        console.error('FB DL Error:', error);
        const fail = toSmallCaps("echec du telechargement facebook");
        await extra.reply(`❌ *${fail}*`);
        await sock.sendMessage(extra.from, { react: { text: '❌', key: msg.key } });
      }
    } catch (e) {
      console.error('FB Cmd Error:', e);
    }
  }
};
