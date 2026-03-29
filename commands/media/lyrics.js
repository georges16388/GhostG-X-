/**
 * ʟʏʀɪᴄs & ᴀᴜᴅɪᴏ ғɪɴᴅᴇʀ - ᴀɢᴍ ᴍᴜsɪᴄ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for GhostG-X V5.3
 */

const axios = require('axios');
const { youtube } = require('btch-downloader');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (title, artist) => {
  const shortTitle = title ? (title.length > 20 ? title.substring(0, 17) + '...' : title) : 'ᴜɴᴋɴᴏᴡɴ';
  const shortArtist = artist ? (artist.length > 20 ? artist.substring(0, 17) + '...' : artist) : 'ᴜɴᴋɴᴏᴡɴ';

  return `*╭╼━≪• ${toStyledCaps('ʟʏʀɪᴄs & ᴀᴜᴅɪᴏ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ғᴏᴜɴᴅ')}*
*┃* 🎵 *${toStyledCaps('sᴏɴɢ')}* : *${toStyledCaps(shortTitle)}*
*┃* 👤 *${toStyledCaps('ᴀʀᴛɪsᴛ')}* : *${toStyledCaps(shortArtist)}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'paroles'],
  category: 'media',
  description: 'Trouver les paroles et l\'audio d\'une chanson',
  usage: '.lyrics <nom de la chanson>',

  async execute(sock, msg, args, extra) {
    const query = args.join(' ');
    const chatId = extra.from;

    try {
      if (!query) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ sᴘᴇᴄɪғɪᴇʀ ᴜɴ ɴᴏᴍ ᴅᴇ ᴄʜᴀɴsᴏɴ")}*`);
      }

      await sock.sendMessage(chatId, { react: { text: "🔍", key: msg.key } });

      // 1. RECHERCHE DES PAROLES via API Vreden (Très stable)
      let lyricsData = null;
      try {
        const res = await axios.get(`https://api.vreden.my.id/api/lyrics?query=${encodeURIComponent(query)}`);
        if (res.data?.status === 200) {
          lyricsData = res.data.result;
        }
      } catch (e) {
        console.error("Lyrics API Error:", e.message);
      }

      if (!lyricsData || !lyricsData.lyrics) {
        return extra.reply(`❌ *${toStyledCaps("ᴀᴜᴄᴜɴᴇ ᴘᴀʀᴏʟᴇ ᴛʀᴏᴜᴠᴇᴇ")}*`);
      }

      // 2. ENVOI DES PAROLES AVEC IMAGE
      const thumbnail = lyricsData.thumbnail || lyricsData.image || 'https://files.catbox.moe/2fmwpu.jpg';
      const lyricsCaption = `${AGM_DESIGN(lyricsData.title, lyricsData.artist)}\n\n${lyricsData.lyrics}`;

      await sock.sendMessage(chatId, {
        image: { url: thumbnail },
        caption: lyricsCaption
      }, { quoted: msg });

      // 3. RECHERCHE ET ENVOI DE L'AUDIO (Utilisation de BTCH)
      await sock.sendMessage(chatId, { react: { text: "🎧", key: msg.key } });

      try {
        const searchTitle = `${lyricsData.title} ${lyricsData.artist}`;
        const ytData = await youtube(searchTitle);

        // Correction de la logique de récupération du lien MP3
        const audioUrl = ytData?.mp3 || ytData?.url || ytData?.[0]?.mp3;

        if (audioUrl) {
          await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg', // MPEG est préférable pour la lecture auto sur Android/iOS
            ptt: false,
            contextInfo: {
              externalAdReply: {
                title: toStyledCaps(lyricsData.title),
                body: toStyledCaps(lyricsData.artist),
                mediaType: 1,
                thumbnailUrl: thumbnail,
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: msg });
          
          await sock.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
        } else {
            throw new Error('Audio link not found');
        }
      } catch (audioErr) {
        console.error('Audio DL Error:', audioErr.message);
        // On ne coupe pas le processus ici, l'utilisateur a déjà reçu les paroles
      }

    } catch (error) {
      console.error('Lyrics Global Error:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴘʀᴏᴄᴇssᴜs")}*`);
    }
  }
};
