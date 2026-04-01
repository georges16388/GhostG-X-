/**
 * Instagram Downloader - GhostG-X Edition
 * Télécharge des photos/vidéos/reels depuis l'univers Instagram
 */

const { igdl } = require('ruhend-scraper');
const config = require('../../config');

// Stockage des ID de messages traités pour éviter les doublons
const processedMessages = new Set();

// Fonction d'extraction des URL uniques avec déduplication
function extractUniqueMedia(mediaData) {
  const uniqueMedia = [];
  const seenUrls = new Set();

  for (const media of mediaData) {
    if (!media.url) continue;

    if (!seenUrls.has(media.url)) {
      seenUrls.add(media.url);
      uniqueMedia.push(media);
    }
  }

  return uniqueMedia;
}

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

// Fonction pour extraire proprement le domaine source
function getDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return 'instagram.com';
  }
}

module.exports = {
  name: 'instagram',
  aliases: ['illusions_instagram', 'ig', 'insta', 'igdl', 'reels', 'illusion_instagram'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇʟᴇᴄʜᴀʀɢᴇ ᴅᴇs ᴘʜᴏᴛᴏs/ᴠɪᴅᴇᴏs/ʀᴇᴇʟs ɪɴsᴛᴀɢʀᴀᴍ**',
  usage: `${config.prefix || '.'}instagram [lien instagram]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const prefix = config.prefix || '.';

    try {
      const chatId = extra.from;

      // Vérification si le message a déjà été traité
      if (processedMessages.has(msg.key.id)) return;

      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const text = args.join(' ');

      if (!text) {
        return reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃ 🔮 *${toSmallCaps('indique un lien instagram')}*\n` +
          `┃ *${toSmallCaps('pour aspirer le media')} !*\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      // Vérification des formats d'URL Instagram
      const instagramPatterns = [
        /https?:\/\/(?:www\.)?instagram\.com\//,
        /https?:\/\/(?:www\.)?instagr\.am\//,
        /https?:\/\/(?:www\.)?instagram\.com\/p\//,
        /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
        /https?:\/\/(?:www\.)?instagram\.com\/tv\//
      ];

      const isValidUrl = instagramPatterns.some(pattern => pattern.test(text));

      if (!isValidUrl) {
        return reply(`*❌ ${toSmallCaps('ce lien nest pas une illusion instagram valide')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Réaction avec l'orbe de téléchargement
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
      });

      const downloadData = await igdl(text);

      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
        return reply(`*❌ ${toSmallCaps('aucun media trouve. le post est peut-etre prive')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const mediaData = downloadData.data;
      const uniqueMedia = extractUniqueMedia(mediaData);
      const mediaToDownload = uniqueMedia.slice(0, 20);

      if (mediaToDownload.length === 0) {
        return reply(`*❌ ${toSmallCaps('aucun media valide a telecharger')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');
      const sourceDomain = getDomain(text);

      // Téléchargement et envoi de tous les médias
      for (let i = 0; i < mediaToDownload.length; i++) {
        try {
          const media = mediaToDownload[i];
          const mediaUrl = media.url;

          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                        media.type === 'video' || 
                        text.includes('/reel/') || 
                        text.includes('/tv/');

          const caption = `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                          `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                          `┃ 🔗 *${toSmallCaps('source')} :* ${sourceDomain}\n` +
                          `┃ 📊 *${toSmallCaps('statut')} :* ᴀᴄᴛɪғ\n` +
                          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

          if (isVideo) {
            await sock.sendMessage(chatId, {
              video: { url: mediaUrl },
              mimetype: 'video/mp4',
              caption: caption
            }, { quoted: msg });
          } else {
            await sock.sendMessage(chatId, {
              image: { url: mediaUrl },
              caption: caption
            }, { quoted: msg });
          }

          if (i < mediaToDownload.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (mediaError) {
          console.error(`Error downloading media ${i + 1}:`, mediaError);
        }
      }
    } catch (error) {
      console.error('Error in Instagram command:', error);
      await reply(`*❌ ${toSmallCaps('une singularite est survenue lors du traitement')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
