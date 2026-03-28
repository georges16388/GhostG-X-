/**
 * ʟʏʀɪᴄs & ᴀᴜᴅɪᴏ ғɪɴᴅᴇʀ - ᴀɢᴍ ᴍᴜsɪᴄ ᴇᴅɪᴛɪᴏɴ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const { youtube } = require('btch-downloader'); // Assure-toi d'avoir un scraper YT stable

const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const AGM_DESIGN = (title, artist) => {
  const shortTitle = title ? (title.length > 18 ? title.substring(0, 15) + '...' : title) : 'ᴜɴᴋɴᴏᴡɴ';
  const shortArtist = artist ? (artist.length > 18 ? artist.substring(0, 15) + '...' : artist) : 'ᴜɴᴋɴᴏᴡɴ';
  
  return `╭╼━≪• *ʟʏʀɪᴄs & ᴀᴜᴅɪᴏ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ғᴏᴜɴᴅ')}
┃ ${toSmallCaps('sᴏɴɢ')} : ${toSmallCaps(shortTitle)} 🎵
┃ ${toSmallCaps('ᴀʀᴛɪsᴛ')} : ${toSmallCaps(shortArtist)} 👤
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'music'],
  category: 'media',
  description: 'Trouver les paroles et l\'audio d\'une chanson',
  usage: '.lyrics <nom de la chanson>',

  async execute(sock, msg, args, extra) {
    try {
      const query = args.join(' ');
      if (!query) {
        return extra.reply(`⚠️ *${toSmallCaps("veuillez specifier un nom de chanson")}*`);
      }

      await sock.sendMessage(extra.from, { react: { text: "🔍", key: msg.key } });

      let lyricsData = null;

      // --- RECHERCHE PAROLES (API VREDEN) ---
      try {
        const res = await axios.get(`https://api.vreden.my.id/api/lyrics?query=${encodeURIComponent(query)}`);
        if (res.data?.result) {
          const r = res.data.result;
          lyricsData = {
            title: r.title || query,
            artist: r.artist || 'Unknown',
            lyrics: r.lyrics,
            thumbnail: r.thumbnail || r.image
          };
        }
      } catch (e) {}

      if (!lyricsData || !lyricsData.lyrics) {
        return extra.reply(`❌ *${toSmallCaps("aucune parole trouvee")}*`);
      }

      // Envoi des paroles
      const caption = `${AGM_DESIGN(lyricsData.title, lyricsData.artist)}\n\n${lyricsData.lyrics.substring(0, 3500)}`;
      await sock.sendMessage(extra.from, {
        image: { url: lyricsData.thumbnail || 'https://files.catbox.moe/2fmwpu.jpg' },
        caption: caption
      }, { quoted: msg });

      // --- ENVOI DE L'AUDIO (AUTO-DL) ---
      await sock.sendMessage(extra.from, { react: { text: "🎧", key: msg.key } });

      try {
          // On cherche la chanson sur YouTube pour récupérer l'audio
          const searchTitle = `${lyricsData.title} ${lyricsData.artist}`;
          const ytSearch = await youtube(searchTitle);
          const audioUrl = ytSearch.mp3;

          if (audioUrl) {
              await sock.sendMessage(extra.from, {
                  audio: { url: audioUrl },
                  mimetype: 'audio/mp4',
                  ptt: false, // true si tu veux que ce soit une note vocale
                  contextInfo: {
                      externalAdReply: {
                          title: toSmallCaps(lyricsData.title),
                          body: toSmallCaps(lyricsData.artist),
                          mediaType: 2,
                          thumbnailUrl: lyricsData.thumbnail,
                          showAdAttribution: true
                      }
                  }
              }, { quoted: msg });
          }
      } catch (audioErr) {
          console.error('Audio DL Error:', audioErr);
          // On ne stop pas le script si l'audio échoue, les paroles sont déjà envoyées.
      }

      await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('Global Error:', error);
      await extra.reply(`❌ *${toSmallCaps("erreur lors du processus")}*`);
    }
  }
};
