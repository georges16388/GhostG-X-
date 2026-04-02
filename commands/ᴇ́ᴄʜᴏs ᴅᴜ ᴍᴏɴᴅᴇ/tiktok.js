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
    return 'tiktok.com';
  }
}

module.exports = {
  name: 'tiktok',
  aliases: ['illusions_tiktok', 'tt', 'ttdl', 'tiktokdl', 'illusion_tiktok'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀsᴘɪʀᴇ ᴇᴛ ᴛᴇʟᴇᴄʜᴀʀɢᴇ ᴅᴇs ᴠɪᴅᴇᴏs ᴛɪᴋᴛᴏᴋ',
  usage: `${config.prefix || '.'}tiktok [lien tiktok]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const { reply } = { reply: async (text) => await sock.sendMessage(chatId, { text }, { quoted: msg }) };

    try {
      // 1️⃣ Sécurité anti-doublon
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const text = args.join(' ');

      if (!text) {
        return reply(
          `*⚠️ ${toSmallCaps('echec de l\'invocation')}*\n\n` +
          `*┃* 🔮 *${toSmallCaps('indique un lien tiktok')}*\n` +
          `*┃* *${toSmallCaps('pour aspirer le media')} !*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      // Vérification des formats d'URL TikTok
      const tiktokPatterns = [
        /https?:\/\/(?:www\.)?tiktok\.com\//,
        /https?:\/\/(?:vm\.)?tiktok\.com\//,
        /https?:\/\/(?:vt\.)?tiktok\.com\//,
        /https?:\/\/(?:www\.)?tiktok\.com\/@/,
        /https?:\/\/(?:www\.)?tiktok\.com\/t\//
      ];

      const isValidUrl = tiktokPatterns.some(pattern => pattern.test(text));

      if (!isValidUrl) {
        return reply(`*❌ ${toSmallCaps('ce lien nest pas une illusion tiktok valide')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Réaction avec l'orbe de téléchargement
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
      });

      try {
        let videoUrl = null;
        let title = null;
        const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');
        const sourceDomain = getDomain(text);

        // --- API 1: Ton API personnalisée ---
        try {
          const result = await APIs.getTikTokDownload(text);
          videoUrl = result.videoUrl;
          title = result.title;
        } catch (apiError) {
          console.error(`Siputzx API failed: ${apiError.message}`);
        }

        // --- API 2: TikWM (Fallback hyper stable) ---
        if (!videoUrl) {
          try {
            const tikwmResponse = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url: text }));
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
            let downloadData = await ttdl(text);
            if (downloadData && downloadData.data && downloadData.data.length > 0) {
              const mediaData = downloadData.data;

              for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                const media = mediaData[i];
                const mediaUrl = media.url;
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';

                let mediaCaption = `*╭╼━━━≪• 🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                                   `*┃* 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                                   `*┃* 🔗 *${toSmallCaps('source')} :* ${sourceDomain}\n`;

                if (downloadData.title) {
                  mediaCaption += `*┃* 🔖 *${toSmallCaps('titre')} :* ${toSmallCaps(downloadData.title)}\n\n`;
                } else {
                  mediaCaption += `\n`;
                }

                mediaCaption += `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

                if (isVideo) {
                  await sock.sendMessage(chatId, {
                    video: { url: mediaUrl },
                    mimetype: 'video/mp4',
                    caption: mediaCaption
                  }, { quoted: msg });
                } else {
                  await sock.sendMessage(chatId, {
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
          let caption = `*╭╼━━━≪• 🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ •≫━━━╾╮*\n` +
                        `*┃* 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                        `*┃* 🔗 *${toSmallCaps('source')} :* ${sourceDomain}\n`;

          if (title) {
            caption += `*┃* 🔖 *${toSmallCaps('titre')} :* ${toSmallCaps(title)}\n\n`;
          } else {
            caption += `\n`;
          }

          caption += `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

          try {
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

            await sock.sendMessage(chatId, {
              video: videoBuffer,
              mimetype: 'video/mp4',
              caption: caption
            }, { quoted: msg });

            return;
          } catch (downloadError) {
            console.error(`Failed to download video: ${downloadError.message}`);

            // Repli vers l'envoi par URL directe
            try {
              await sock.sendMessage(chatId, {
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
        return reply(`*❌ ${toSmallCaps('toutes les sources dinvocation ont echoue pour cette illusion')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

      } catch (error) {
        console.error('Error in TikTok download:', error);
        await reply(`*❌ ${toSmallCaps('loracle a echoue a sonder ce lien tiktok')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }
    } catch (error) {
      console.error('Error in TikTok command:', error);
      await reply(`*❌ ${toSmallCaps('une singularite est survenue lors du traitement')}...*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
