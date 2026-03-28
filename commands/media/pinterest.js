/**
 * Pinterest Downloader - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

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
  const shortTitle = title ? (title.length > 15 ? title.substring(0, 12) + '...' : title) : 'ᴘɪɴᴛᴇʀᴇsᴛ';
  return `╭╼━≪• *ᴘɪɴᴛᴇʀᴇsᴛ ᴅʟ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ')}
┃ ${toSmallCaps('ᴛɪᴛʟᴇ')} : ${toSmallCaps(shortTitle)}
┃ ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps(type)} 📌
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

const processedMessages = new Set();

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pindl'],
  category: 'media',
  description: 'Télécharger des images ou vidéos depuis Pinterest',
  usage: '.pin <URL>',

  async execute(sock, msg, args, extra) {
    try {
      // Anti-spam / Double exécution
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const text = args.join(' ') || (msg.message?.extendedTextMessage?.text?.split(' ')[1]);

      if (!text) {
        const warn = toSmallCaps("veuillez fournir un lien pinterest (pin.it / pinterest.com)");
        return extra.reply(`⚠️ *${warn}*`);
      }

      // Extraction propre de l'URL Pinterest
      const urlMatch = text.match(/https?:\/\/(?:[^\s]*pinterest[^\s]*\/pin\/|pin\.it\/)[^\s]+/i);
      if (!urlMatch) {
        const errLink = toSmallCaps("lien pinterest invalide");
        return extra.reply(`❌ *${errLink}*`);
      }

      const pinterestUrl = urlMatch[0];
      await sock.sendMessage(extra.from, { react: { text: '📌', key: msg.key } });

      // Appel API Nexray (Vérifie bien que ton instance est active)
      const apiUrl = `https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(pinterestUrl)}`;

      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      // Vérification de la structure de réponse
      if (!response.data || !response.data.result) {
        throw new Error('Invalid API response');
      }

      const pinData = response.data.result;
      
      // Détection Vidéo vs Image
      // Note: Nexray renvoie souvent .video ou .url selon le type
      const isVideo = !!(pinData.video || (pinData.url && pinData.url.includes('.mp4')));
      const mediaUrl = pinData.video || pinData.url || pinData.image;

      if (!mediaUrl) throw new Error('No media found');

      const caption = AGM_DESIGN(pinData.title || 'Pinterest Pin', isVideo ? 'video' : 'image');

      if (isVideo) {
        // Téléchargement du buffer vidéo (Plus stable pour WhatsApp)
        const videoRes = await axios.get(mediaUrl, { 
          responseType: 'arraybuffer',
          timeout: 60000 
        });

        await sock.sendMessage(extra.from, {
          video: Buffer.from(videoRes.data),
          caption: caption,
          mimetype: 'video/mp4',
          contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ᴘɪɴᴛᴇʀᴇsᴛ ᴘʟᴀʏᴇʀ",
                body: toSmallCaps("video recuperee avec succes"),
                mediaType: 2,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: true
            }
          }
        }, { quoted: msg });
      } else {
        // Envoi Image
        await sock.sendMessage(extra.from, {
          image: { url: mediaUrl },
          caption: caption
        }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Pinterest Error:', error);
      const fail = toSmallCaps("echec du telechargement pinterest");
      await extra.reply(`❌ *${fail}*`);
      await sock.sendMessage(extra.from, { react: { text: '❌', key: msg.key } });
    }
  }
};
