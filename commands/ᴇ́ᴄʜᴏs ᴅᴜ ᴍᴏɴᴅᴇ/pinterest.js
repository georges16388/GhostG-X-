/**
 * Pinterest Downloader - GhostG-X Edition
 * Télécharge des images ou des vidéos depuis l'univers Pinterest
 */

const axios = require('axios');
const config = require('../../config');

// Stockage des ID de messages traités pour éviter les doublons
const processedMessages = new Set();

module.exports = {
  name: 'ɪʟʟᴜsɪᴏɴ_ᴘɪɴᴛᴇʀᴇsᴛ',
  aliases: ['illusions_pinterest', 'pinterest', 'pin', 'pindl', 'pinterestdl'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: 'ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇ ᴅᴇs ɪᴍᴀɢᴇs/ᴠɪᴅᴇ́ᴏs ᴘɪɴᴛᴇʀᴇsᴛ',
  usage: '.ɪʟʟᴜsɪᴏɴ_ᴘɪɴᴛᴇʀᴇsᴛ <ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ>',
  
  async execute(sock, msg, args, extra) {
    try {
      const prefix = config.prefix || '.';

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
        return await extra.reply(
          `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛᴇᴜʀ ᴘɪɴᴛᴇʀᴇsᴛ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴜsᴀɢᴇ : ${prefix}ɪʟʟᴜsɪᴏɴ_ᴘɪɴᴛᴇʀᴇsᴛ <ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ>*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*📜 ᴇxᴇᴍᴘʟᴇ :*\n` +
          `*${prefix}ɪʟʟᴜsɪᴏɴ_ᴘɪɴᴛᴇʀᴇsᴛ https://in.pinterest.com/pin/1109363320773690068/*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      // Extraction de l'URL Pinterest (y compris les liens raccourcis pin.it)
      let urlMatch = text.match(/https?:\/\/[^\s]*pinterest[^\s]*\/pin\/[^\s]+/i);
      
      if (!urlMatch) {
        urlMatch = text.match(/https?:\/\/pin\.it\/[^\s]+/i);
      }
      
      if (!urlMatch) {
        urlMatch = text.match(/pin\.it\/[^\s]+/i);
      }
      
      if (!urlMatch) {
        return await extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴ ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ ᴠᴀʟɪᴅᴇ !*');
      }
      
      const pinterestUrl = urlMatch[0];
      
      // Réaction avec l'orbe de téléchargement
      await sock.sendMessage(extra.from, {
        react: { text: '📥', key: msg.key }
      });
      
      // Appel de l'API Pinterest
      const apiUrl = `https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(pinterestUrl)}`;
      
      let response;
      try {
        response = await axios.get(apiUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      } catch (error) {
        console.error('Pinterest API Error:', error);
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            return await extra.reply('*〆 ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ ɪɴᴠᴀʟɪᴅᴇ. ᴠᴇ́ʀɪғɪᴇ ʟ\'ᴜʀʟ sᴏᴜᴍɪsᴇ.*');
          } else if (status === 429) {
            return await extra.reply('*〆 ʟɪᴍɪᴛᴀᴛɪᴏɴ ᴅᴇs ᴀʀᴄᴀɴᴇs ᴀᴛᴛᴇɪɴᴛᴇ. ʀᴇ́ᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.*');
          } else if (status === 500) {
            return await extra.reply('*〆 ʟᴇ sᴇʀᴠᴇᴜʀ ᴇsᴛ ɪɴsᴛᴀʙʟᴇ. ʀᴇ́ᴇssᴀɪᴇ ᴘʟᴜs ᴛᴀʀᴅ.*');
          }
        }
        return await extra.reply('*〆 ʟ\'ᴏʀᴀᴄʟᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ ᴀ̀ sᴏɴᴅᴇʀ ᴄᴇ ʟɪᴇɴ ᴘɪɴᴛᴇʀᴇsᴛ.*');
      }
      
      if (!response.data || !response.data.status || !response.data.result) {
        return await extra.reply('*〆 ʀᴇ́ᴘᴏɴsᴇ ᴅᴇ sᴇʀᴠᴇᴜʀ ɪɴᴠᴀʟɪᴅᴇ. ʟᴇ ᴘɪɴ ᴇsᴛ ᴘᴇᴜᴛ-ᴇ̂ᴛʀᴇ ᴘʀɪᴠᴇ́.*');
      }
      
      const pinData = response.data.result;
      
      // Journalisation des réponses (conservation de ton système de log)
      console.log('Pinterest API Response:', JSON.stringify(pinData, null, 2));
      
      const isVideo = !!pinData.video;
      const imageUrl = pinData.video || pinData.image || pinData.url;
      const title = pinData.title || 'Pinterest Pin';
      const author = pinData.author || 'Inconnu';
      
      if (!imageUrl) {
        console.error('Pinterest API response structure:', JSON.stringify(pinData, null, 2));
        return await extra.reply('*〆 ᴀᴜᴄᴜɴ ᴍᴇ́ᴅɪᴀ ᴛʀᴏᴜᴠᴇ́ ᴅᴀɴs ʟᴇs ᴅᴏɴɴᴇ́ᴇs ᴅᴇ sᴇʀᴠᴇᴜʀ.*');
      }
      
      const botName = (config.botName || 'ɢʜᴏsᴛɢ-x').toUpperCase();
      
      // Construction de la légende
      let caption = `*╭╼━━━≪• ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                    `*┃ 📌 ᴛɪᴛʀᴇ : ${title}*\n`;
      if (author && author !== 'Inconnu') {
        caption += `*┃ 👤 ᴀᴜᴛᴇᴜʀ : ${author}*\n`;
      }
      caption += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}*`;
      
      // Envoi du média principal
      if (isVideo) {
        try {
          const videoResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 120000, 
            maxContentLength: 100 * 1024 * 1024, 
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'video/mp4,video/*,*/*',
              'Referer': 'https://www.pinterest.com/'
            }
          });
          
          const videoBuffer = Buffer.from(videoResponse.data);
          
          if (!videoBuffer || videoBuffer.length === 0) {
            throw new Error('Buffer vidéo vide');
          }
          
          if (videoBuffer.length < 100) {
            throw new Error('Buffer vidéo trop petit (potentiellement corrompu)');
          }
          
          console.log(`Video downloaded successfully: ${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB`);
          
          await sock.sendMessage(extra.from, {
            video: videoBuffer,
            caption: caption
          }, { quoted: msg });
        } catch (videoError) {
          console.error('Video download/send error:', videoError.message);
          return await extra.reply('*〆 ʟ\'ᴇɴᴠᴏɪ ᴅᴇ ʟ\'ɪʟʟᴜsɪᴏɴ ᴠɪᴅᴇ́ᴏ ᴀ ᴇ́ᴄʜᴏᴜᴇ́. ʟᴇ ʟɪᴇɴ ᴀ ᴘᴇᴜᴛ-ᴇ̂ᴛʀᴇ ᴇxᴘɪʀᴇ́.*');
        }
      } else {
        await sock.sendMessage(extra.from, {
          image: { url: imageUrl },
          caption: caption
        }, { quoted: msg });
      }
      
    } catch (error) {
      console.error('Error in pinterest command:', error);
      return await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message || 'ᴇʀʀᴇᴜʀ ɪɴᴄᴏɴɴᴜᴇ'}*`);
    }
  },
};
