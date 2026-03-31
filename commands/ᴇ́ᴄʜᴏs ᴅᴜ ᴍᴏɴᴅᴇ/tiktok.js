/**
 * TikTok Downloader - GhostG-X Edition
 * Télécharge des vidéos ou carrousels depuis l'univers TikTok
 */

const { ttdl } = require('ruhend-scraper');
const axios = require('axios');
const APIs = require('../../utils/api');
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
  name: 'ɪʟʟᴜsɪᴏɴ_ᴛɪᴋᴛᴏᴋ',
  aliases: ['illusions_tiktok', 'tiktok', 'tt', 'ttdl', 'tiktokdl'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: 'ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇ ᴅᴇs ᴠɪᴅᴇ́ᴏs ᴛɪᴋᴛᴏᴋ',
  usage: '.ɪʟʟᴜsɪᴏɴ_ᴛɪᴋᴛᴏᴋ <ʟɪᴇɴ ᴛɪᴋᴛᴏᴋ>',
  
  async execute(sock, msg, args) {
    try {
      // Vérification si le message a déjà été traité
      if (processedMessages.has(msg.key.id)) return;
      
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);
      
      const text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');
      
      if (!text) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: `*〆 ${toSmallCaps('murmure un lien tiktok pour aspirer la video')}.*` 
        }, { quoted: msg });
      }
      
      // Extraction de l'URL
      const url = text.split(' ').slice(1).join(' ').trim();
      
      if (!url) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: `*〆 ${toSmallCaps('murmure un lien tiktok pour aspirer la video')}.*` 
        }, { quoted: msg });
      }
      
      // Vérification des formats d'URL TikTok
      const tiktokPatterns = [
        /https?:\/\/(?:www\.)?tiktok\.com\//,
        /https?:\/\/(?:vm\.)?tiktok\.com\//,
        /https?:\/\/(?:vt\.)?tiktok\.com\//,
        /https?:\/\/(?:www\.)?tiktok\.com\/@/,
        /https?:\/\/(?:www\.)?tiktok\.com\/t\//
      ];
      
      const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));
      
      if (!isValidUrl) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: `*〆 ${toSmallCaps('ce lien nest pas une illusion tiktok valide')}.*` 
        }, { quoted: msg });
      }
      
      // Réaction avec l'orbe de chargement
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '⏳', key: msg.key }
      });
      
      try {
        let videoUrl = null;
        let title = null;
        const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');
        
        // --- API 1: Ton API personnalisée ---
        try {
          const result = await APIs.getTikTokDownload(url);
          videoUrl = result.videoUrl;
          title = result.title;
        } catch (apiError) {
          console.error(`Siputzx API failed: ${apiError.message}`);
        }
        
        // --- API 2: TikWM (Fallback hyper stable) ---
        if (!videoUrl) {
          try {
            const tikwmResponse = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url: url }));
            if (tikwmResponse.data && tikwmResponse.data.data) {
              const resData = tikwmResponse.data.data;
              videoUrl = resData.play || resData.hdplay;
              title = resData.title;
            }
          } catch (tikwmErr) {
            console.error('TikWM API failed, trying ttdl scraper...');
          }
        }
        
        // --- API 3: Scraper ttdl de Ruhend (Idéal pour les carrousels photo) ---
        if (!videoUrl) {
          try {
            let downloadData = await ttdl(url);
            if (downloadData && downloadData.data && downloadData.data.length > 0) {
              const mediaData = downloadData.data;
              const hasTitle = downloadData.title ? true : false;
              
              for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                const media = mediaData[i];
                const mediaUrl = media.url;
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';
                
                let mediaCaption = `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                                   `┃\n` +
                                   `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n`;
                
                if (hasTitle) {
                  mediaCaption += `┃ 📝 *${toSmallCaps('titre')} :* ${downloadData.title}\n`;
                }
                
                mediaCaption += `┃\n` +
                                 `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                                 `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                if (isVideo) {
                  await sock.sendMessage(msg.key.remoteJid, {
                    video: { url: mediaUrl },
                    mimetype: 'video/mp4',
                    caption: mediaCaption
                  }, { quoted: msg });
                } else {
                  await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: mediaUrl },
                    caption: mediaCaption
                  }, { quoted: msg });
                }
              }
              return;
            }
          } catch (ttdlError) {
            console.error('ttdl fallback also failed:', ttdlError.message);
          }
        }
        
        // Finalisation et envoi de l'extrait vidéo trouvé par l'API 1 ou 2
        if (videoUrl) {
          let caption = `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                        `┃\n` +
                        `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n`;
          
          if (title) {
            caption += `┃ 📝 *${toSmallCaps('titre')} :* ${title}\n`;
          }
          
          caption += `┃\n` +
                     `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                     `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

          try {
            // Tentative de téléchargement en buffer
            const videoResponse = await axios.get(videoUrl, {
              responseType: 'arraybuffer',
              timeout: 60000,
              maxContentLength: 100 * 1024 * 1024,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'video/mp4,video/*,*/*;q=0.9',
                'Referer': 'https://www.tiktok.com/'
              }
            });
            
            const videoBuffer = Buffer.from(videoResponse.data);
            
            if (videoBuffer.length === 0) throw new Error('Video buffer is empty');
            
            await sock.sendMessage(msg.key.remoteJid, {
              video: videoBuffer,
              mimetype: 'video/mp4',
              caption: caption
            }, { quoted: msg });
            
            return;
          } catch (downloadError) {
            console.error(`Failed to download video: ${downloadError.message}`);
            // Repli vers l'envoi par URL directe
            try {
              await sock.sendMessage(msg.key.remoteJid, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption: caption
              }, { quoted: msg });
              return;
            } catch (urlError) {
              console.error(`URL method also failed: ${urlError.message}`);
            }
          }
        }
        
        // Si aucun système n'a fonctionné
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: `*〆 ${toSmallCaps('toutes les sources dinvocation ont echoue pour cette illusion')}.*` 
        }, { quoted: msg });
        
      } catch (error) {
        console.error('Error in TikTok download:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
          text: `*〆 ${toSmallCaps('loracle a echoue a sonder ce lien tiktok')} !*` 
        }, { quoted: msg });
      }
    } catch (error) {
      console.error('Error in TikTok command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `*〆 ${toSmallCaps('une singularite est survenue lors du traitement')}...*` 
      }, { quoted: msg });
    }
  }
};
