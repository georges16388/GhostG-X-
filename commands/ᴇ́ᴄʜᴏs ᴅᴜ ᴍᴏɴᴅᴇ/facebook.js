/**
 * Facebook Downloader - GhostG-X Edition
 * Télécharge des vidéos depuis l'univers Facebook
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');
const config = require('../../config');

// Stockage des ID de messages traités pour éviter les doublons
const processedMessages = new Set();

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

module.exports = {
  name: 'facebook',
  aliases: ['illusions_facebook', 'fb', 'fbdl', 'facebookdl', 'illusion_facebook'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ', 
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇʟᴇᴄʜᴀʀɢᴇ ᴅᴇs ᴠɪᴅᴇᴏs ғᴀᴄᴇʙᴏᴏᴋ**',
  usage: `${config.prefix || '.'}facebook [lien facebook]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const prefix = config.prefix || '.';

    try {
      // Vérification si le message a déjà été traité
      if (processedMessages.has(msg.key.id)) return;

      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const url = args[0] || '';

      if (!url) {
        return await reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃ \n` +
          `┃ 🔮 *${toSmallCaps('indique un lien facebook')}*\n` +
          `┃ *${toSmallCaps('pour aspirer la video')} !*\n` +
          `┃ \n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
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
        return await reply(`*❌ ${toSmallCaps('ce lien nest pas une illusion facebook valide')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
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
                      `┃ \n` +
                      `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                      `┃ 🔗 *${toSmallCaps('source')} :* ${url.length > 30 ? url.substring(0, 27) + '...' : url}\n` +
                      `┃ 📹 *${toSmallCaps('qualite')} :* ${data.hd ? 'ʜᴅ' : 'sᴅ'}\n` +
                      `┃ \n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                      `*_ᴊᴇsᴜs ᴇsᴛ ᴍᴀɪᴛʀᴇ sᴜᴘʀᴇᴍᴇ ♛_*\n` +
                      `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

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
        await reply(
          `╭╼━≪• *❌ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪʟʟᴜsɪᴏɴ* •≫━╾╮\n` +
          `┃ \n` +
          `┃ 🥀 *${toSmallCaps('loracle a echoue a aspirer la video')}*\n` +
          `┃ ⚠️ *${toSmallCaps('erreur')} :* ${error.message}\n` +
          `┃ \n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }
    } catch (error) {
      console.error('Error in Facebook main command:', error);
      await reply(`*❌ ${toSmallCaps('une singularite est survenue')}...*`);
    }
  }
};
