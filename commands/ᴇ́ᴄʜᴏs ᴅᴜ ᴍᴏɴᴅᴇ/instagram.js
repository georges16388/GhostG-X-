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
    
    // Vérifie uniquement les doublons d'URL exacts
    if (!seenUrls.has(media.url)) {
      seenUrls.add(media.url);
      uniqueMedia.push(media);
    }
  }
  
  return uniqueMedia;
}

// Fonction de validation d'URL média
function isValidMediaUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Accepte toute URL qui ressemble à un média
  return url.includes('cdninstagram.com') || 
         url.includes('instagram') || 
         url.includes('http');
}

module.exports = {
  name: 'ɪʟʟᴜsɪᴏɴ_ɪɴsᴛᴀɢʀᴀᴍ',
  aliases: ['illusions_instagram', 'instagram', 'ig', 'insta', 'igdl', 'reels'],
  category: '‎⌘ ',
  description: 'ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇ ᴅᴇs ᴘʜᴏᴛᴏs/ᴠɪᴅᴇ́ᴏs/ʀᴇᴇʟs ɪɴsᴛᴀɢʀᴀᴍ',
  usage: '.ɪʟʟᴜsɪᴏɴ_ɪɴsᴛᴀɢʀᴀᴍ <ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ>',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      
      // Vérification si le message a déjà été traité
      if (processedMessages.has(msg.key.id)) {
        return;
      }
      
      // Ajout de l'ID du message dans le set de traitement
      processedMessages.add(msg.key.id);
      
      // Nettoyage de l'ID après 5 minutes
      setTimeout(() => {
        processedMessages.delete(msg.key.id);
      }, 5 * 60 * 1000);
      
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');
      
      if (!text) {
        return extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ʟɪᴇɴ ɪɴsᴛᴀɢʀᴀᴍ ᴘᴏᴜʀ ᴀsᴘɪʀᴇʀ ʟᴇ ᴍᴇ́ᴅɪᴀ.*');
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
        return extra.reply('*〆 ᴄᴇ ʟɪᴇɴ ɴ\'ᴇsᴛ ᴘᴀs ᴜɴᴇ ɪʟʟᴜsɪᴏɴ ɪɴsᴛᴀɢʀᴀᴍ ᴠᴀʟɪᴅᴇ. ғᴏᴜʀɴɪs ᴜɴ ʟɪᴇɴ ᴄᴏʀʀᴇᴄᴛ.*');
      }
      
      // Réaction avec l'orbe de téléchargement
      await sock.sendMessage(chatId, {
        react: { text: '📥', key: msg.key }
      });
      
      const downloadData = await igdl(text);
      
      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
        return extra.reply('*〆 ᴀᴜᴄᴜɴ ᴍᴇ́ᴅɪᴀ ᴛʀᴏᴜᴠᴇ́. ʟᴇ ᴘᴏsᴛ ᴇsᴛ ᴘᴇᴜᴛ-ᴇ̂ᴛʀᴇ ᴘʀɪᴠᴇ́ ᴏᴜ ʟᴇ ʟɪᴇɴ ᴇsᴛ ɪɴᴠᴀʟɪᴅᴇ.*');
      }
      
      const mediaData = downloadData.data;
      
      // Déduplication simple des URL
      const uniqueMedia = extractUniqueMedia(mediaData);
      
      // Limite à un maximum de 20 médias
      const mediaToDownload = uniqueMedia.slice(0, 20);
      
      if (mediaToDownload.length === 0) {
        return extra.reply('*〆 ᴀᴜᴄᴜɴ ᴍᴇ́ᴅɪᴀ ᴠᴀʟɪᴅᴇ ᴀ̀ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇʀ.*');
      }
      
      const botName = (config.botName || 'ɢʜᴏsᴛɢ-x').toUpperCase();
      
      // Téléchargement et envoi silencieux de tous les médias
      for (let i = 0; i < mediaToDownload.length; i++) {
        try {
          const media = mediaToDownload[i];
          const mediaUrl = media.url;
          
          // Détection si l'URL ou le format correspond à une vidéo
          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                        media.type === 'video' || 
                        text.includes('/reel/') || 
                        text.includes('/tv/');
          
          if (isVideo) {
            await sock.sendMessage(chatId, {
              video: { url: mediaUrl },
              mimetype: 'video/mp4',
              caption: `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                        `*┃ 🔮 ᴇxᴛʀᴀɪᴛ ᴘᴀʀ : ${botName}*\n` +
                        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
            }, { quoted: msg });
          } else {
            await sock.sendMessage(chatId, {
              image: { url: mediaUrl },
              caption: `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                        `*┃ 🔮 ᴇxᴛʀᴀɪᴛ ᴘᴀʀ : ${botName}*\n` +
                        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
            }, { quoted: msg });
          }
          
          // Petit délai pour éviter la saturation d'envoi
          if (i < mediaToDownload.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (mediaError) {
          console.error(`Error downloading media ${i + 1}:`, mediaError);
        }
      }
    } catch (error) {
      console.error('Error in Instagram command:', error);
      await extra.reply('*〆 ᴜɴᴇ sɪɴɢᴜʟᴀʀɪᴛᴇ́ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ ʟᴏʀs ᴅᴜ ᴛʀᴀɪᴛᴇᴍᴇɴᴛ. ʀᴇ́ᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.*');
    }
  }
};
