/**
 * Song Downloader - GhostG-X Edition
 * Télécharge l'essence audio depuis l'univers YouTube
 */

const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');
const config = require('../../config.js');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

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
    return 'youtube.com';
  }
}

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta', 'cantique_youtube'],
  category: '‎⌘ ᴇ́ᴄʜᴏs ᴅᴜ ᴍᴏɴᴅᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴏᴡɴʟᴏᴀᴅ ᴀᴜᴅɪᴏ ғʀᴏᴍ ʏᴏᴜᴛᴜʙᴇ**',
  usage: `${config.prefix || '.'}song [nom ou lien youtube]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const { reply } = { reply: async (text) => await sock.sendMessage(chatId, { text }, { quoted: msg }) };

    try {
      const text = args.join(' ');

      if (!text) {
        return await sock.sendMessage(chatId, { 
          text: `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
                `┃ 🔮 *${toSmallCaps('indique un nom ou un lien')}*\n` +
                `┃ *${toSmallCaps('pour aspirer le media')} !*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }

      let video;

      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        video = { url: text, title: 'Lien Direct' };
      } else {
        const search = await yts(text);
        if (!search || !search.videos.length) {
          return await reply(`*❌ ${toSmallCaps('aucun resultat trouve dans les archives')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        video = search.videos[0];
      }

      const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');
      const sourceDomain = video.url ? getDomain(video.url) : 'youtube.com';

      // Information de l'utilisateur avec l'esthétique du sanctuaire sans ligne vide
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail || 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
        caption: `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                 `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                 `┃ 🔗 *${toSmallCaps('source')} :* ${sourceDomain}\n` +
                 `┃ 🔖 *${toSmallCaps('titre')} :* ${toSmallCaps(video.title || 'Inconnu')}\n` +
                 `┃ ⏱️ *${toSmallCaps('duree')} :* ${toSmallCaps(video.timestamp || 'Inconnue')}\n` +
                 `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });

      // Réaction avec l'orbe de téléchargement
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
      });

      // Tentative de téléchargement avec chaîne de replis
      let audioData;
      let audioBuffer;
      let downloadSuccess = false;

      const apiMethods = [
        { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
        { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
        { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) },
        { name: 'Izumi', method: () => APIs.getIzumiDownloadByUrl(video.url) }
      ];

      for (const apiMethod of apiMethods) {
        try {
          audioData = await apiMethod.method();
          const audioUrl = audioData.download || audioData.dl || audioData.url;

          if (!audioUrl) {
            console.log(`${apiMethod.name} returned no download URL, trying next API...`);
            continue;
          }

          try {
            const audioResponse = await axios.get(audioUrl, {
              responseType: 'arraybuffer',
              timeout: 90000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              decompress: true,
              validateStatus: s => s >= 200 && s < 400,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Encoding': 'identity'
              }
            });
            audioBuffer = Buffer.from(audioResponse.data);

            if (audioBuffer && audioBuffer.length > 0) {
              downloadSuccess = true;
              break; 
            }
          } catch (downloadErr) {
            const statusCode = downloadErr.response?.status || downloadErr.status;
            if (statusCode === 451) {
              console.log(`Download blocked (451) from ${apiMethod.name}, trying next API...`);
              continue;
            }

            // Tentative en mode stream
            try {
              const audioResponse = await axios.get(audioUrl, {
                responseType: 'stream',
                timeout: 90000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                validateStatus: s => s >= 200 && s < 400,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': '*/*',
                  'Accept-Encoding': 'identity'
                }
              });
              const chunks = [];
              await new Promise((resolve, reject) => {
                audioResponse.data.on('data', c => chunks.push(c));
                audioResponse.data.on('end', resolve);
                audioResponse.data.on('error', reject);
              });
              audioBuffer = Buffer.concat(chunks);

              if (audioBuffer && audioBuffer.length > 0) {
                downloadSuccess = true;
                break; 
              }
            } catch (streamErr) {
              const streamStatusCode = streamErr.response?.status || streamErr.status;
              if (streamStatusCode === 451) {
                console.log(`Stream download blocked (451) from ${apiMethod.name}, trying next API...`);
              } else {
                console.log(`Stream download failed from ${apiMethod.name}:`, streamErr.message);
              }
              continue; 
            }
          }
        } catch (apiErr) {
          console.log(`${apiMethod.name} API failed:`, apiErr.message);
          continue;
        }
      }

      if (!downloadSuccess || !audioBuffer) {
        throw new Error('All download sources failed. The content may be unavailable or blocked in your region.');
      }

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Downloaded audio buffer is empty');
      }

      // Détection du format réel du fichier
      const firstBytes = audioBuffer.slice(0, 12);
      const hexSignature = firstBytes.toString('hex');
      const asciiSignature = firstBytes.toString('ascii', 4, 8);

      let fileExtension = 'mp3';

      if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
        const ftypBox = audioBuffer.slice(4, 8).toString('ascii');
        if (ftypBox === 'ftyp') fileExtension = 'm4a';
      }
      else if (audioBuffer.toString('ascii', 0, 3) === 'ID3' || 
               (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)) {
        fileExtension = 'mp3';
      }
      else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') {
        fileExtension = 'ogg';
      }
      else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') {
        fileExtension = 'wav';
      }

      // Conversion en MP3 si nécessaire
      let finalBuffer = audioBuffer;
      let finalMimetype = 'audio/mpeg';
      let finalExtension = 'mp3';

      if (fileExtension !== 'mp3') {
        try {
          finalBuffer = await toAudio(audioBuffer, fileExtension);
          if (!finalBuffer || finalBuffer.length === 0) {
            throw new Error('Conversion returned empty buffer');
          }
        } catch (convErr) {
          throw new Error(`Failed to convert to MP3: ${convErr.message}`);
        }
      }

      // Envoi du fichier audio finalisé
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: finalMimetype,
        fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.${finalExtension}`,
        ptt: false
      }, { quoted: msg });

      // Nettoyage des fichiers résiduels de conversion
      try {
        const tempDir = path.join(__dirname, '../../temp');
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          const now = Date.now();
          files.forEach(file => {
            const filePath = path.join(tempDir, file);
            try {
              const stats = fs.statSync(filePath);
              if (now - stats.mtimeMs > 10000) {
                if (file.endsWith('.mp3') || file.endsWith('.m4a') || /^\d+\.(mp3|m4a)$/.test(file)) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch (e) { /* ignore */ }
          });
        }
      } catch (cleanupErr) { /* ignore */ }

    } catch (err) {
      console.error('Song command error:', err);

      let errorMessage = `*❌ ${toSmallCaps('loracle a echoue a aspirer ce cantique')} !*`;
      if (err.message && err.message.includes('blocked')) {
        errorMessage = `*❌ ${toSmallCaps('laspiration est sous le coup d un scelle geographique')} !*`;
      } else if (err.status === 451) {
        errorMessage = `*❌ ${toSmallCaps('arcane indisponible sous scelle legal ou regional')} !*`;
      } else if (err.message && err.message.includes('All download sources failed')) {
        errorMessage = `*❌ ${toSmallCaps('toutes les sources d invocation ont echoue')} !*`;
      }

      await reply(`${errorMessage}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
