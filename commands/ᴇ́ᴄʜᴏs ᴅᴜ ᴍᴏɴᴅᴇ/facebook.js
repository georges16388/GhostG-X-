/**
 * Facebook Downloader - GhostG-X Edition
 * Télécharge des vidéos depuis l'univers Facebook
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');
const config = require('../../config');

// Stockage des ID de messages traités pour éviter les doublons
const processedMessages = new Set();

// Fonction pour le style Small Caps
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

module.exports = {
  name: 'ɪʟʟᴜsɪᴏɴ_ғᴀᴄᴇʙᴏᴏᴋ',
  aliases: ['illusions_facebook', 'facebook', 'fb', 'fbdl', 'facebookdl'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ', 
  description: 'ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇ ᴅᴇs ᴠɪᴅᴇ́ᴏs ғᴀᴄᴇʙᴏᴏᴋ',
  usage: '.ɪʟʟᴜsɪᴏɴ_ғᴀᴄᴇʙᴏᴏᴋ <ʟɪᴇɴ ғᴀᴄᴇʙᴏᴏᴋ>',
  
  async execute(sock, msg, args, extra) {
    try {
      // Vérification si le message a déjà été traité
      if (processedMessages.has(msg.key.id)) return;
      
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const url = args[0] || '';
      
      if (!url) {
        return await extra.reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('indique un lien facebook')}*\n` +
          `┃ *${toSmallCaps('pour aspirer la video')} !*\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }
      
      const facebookPatterns = [
        /https?:\/\/(?:www\.|m\.)?facebook\.com\//,
        /https?:\/\/(?:www\.|m\.)?fb\.com\//,
        /https?:\/\/fb\.watch\//,
        /https?:\/\/(?:www\.)?facebook\.com\/watch/,
        /https?:\/\/(?:www\.)?facebook\.com\/.*\/videos\//
      ];
      
      const isValidUrl = facebookPatterns.some(pattern => pattern.test(url));
      
      if (!isValidUrl) {
        return await extra.reply(`❌ *${toSmallCaps('ce lien nest pas une illusion facebook valide')} !*`);
      }
      
      // Réaction avec l'orbe de chargement
      await sock.sendMessage(extra.from, {
        react: { text: '⏳', key: msg.key }
      });
      
      try {
        // Extraction via l'API de Bochilteam
        const data = await facebookdl(url);
        
        // Vérification des résultats
        if (!data || (!data.hd && !data.sd)) {
          throw new Error('Aucun lien de téléchargement trouvé.');
        }
        
        // Priorité à la HD, sinon repli sur la SD
        const videoUrl = data.hd || data.sd;
        
        // Construction de la légende
        const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');
        
        let caption = `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                      `┃\n` +
                      `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                      `┃ 🔗 *${toSmallCaps('source')} :* ${url.length > 30 ? url.substring(0, 27) + '...' : url}\n` +
                      `┃ 📹 *${toSmallCaps('qualite')} :* ${data.hd ? 'ʜᴅ' : 'sᴅ'}\n` +
                      `┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                      `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
                      `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName.toUpperCase()}*`;
        
        // Envoi de la vidéo (directement via l'URL pour économiser la RAM de ton serveur)
        try {
          await sock.sendMessage(extra.from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: caption
          }, { quoted: msg });
        } catch (urlError) {
          console.error('URL send failed, trying buffer method:', urlError.message);
          
          // Méthode de secours : On télécharge d'abord la vidéo en mémoire
          const videoResponse = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://www.facebook.com/'
            }
          });
          
          const buffer = Buffer.from(videoResponse.data);
          
          await sock.sendMessage(extra.from, {
            video: buffer,
            mimetype: 'video/mp4',
            caption: caption
          }, { quoted: msg });
        }
        
      } catch (error) {
        console.error('Error in Facebook download action:', error);
        await extra.reply(
          `╭╼━≪• *❌ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪʟʟᴜsɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🥀 *${toSmallCaps('loracle a echoue a aspirer la video')}*\n` +
          `┃ ⚠️ *${toSmallCaps('erreur')} :* ${error.message}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
    } catch (error) {
      console.error('Error in Facebook main command:', error);
      await extra.reply(`❌ *${toSmallCaps('une singularite est survenue')}...*`);
    }
  }
};
