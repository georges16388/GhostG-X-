/**
 * Lyrics Finder - AGM Music Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (title, artist) => `╭╼━≪• ʟʏʀɪᴄs ғɪɴᴅᴇʀ •≫━╾╮
┃ sᴏɴɢ : ${title.length > 15 ? title.substring(0, 12) + '...' : title} 🎵
┃ ᴀʀᴛɪsᴛ : ${artist.length > 15 ? artist.substring(0, 12) + '...' : artist} 👤
┃ sᴛᴀᴛᴜs : 🟢 ғᴏᴜɴᴅ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'lirik'],
  category: 'media',
  description: 'Get lyrics of a song',
  usage: '.lyrics <song name>',
  
  async execute(sock, msg, args, extra) {
    try {
      const query = args.join(' ');
      
      if (!query) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ sᴘéᴄɪғɪᴇʀ ᴜɴ ɴᴏᴍ ᴅᴇ ᴄʜᴀɴsᴏɴ.*');
      }

      await sock.sendMessage(extra.from, { react: { text: "🔍", key: msg.key } });
      
      let lyricsData = null;
      
      // --- API 1: VREDEN ---
      try {
        const res = await axios.get(`https://api.vreden.my.id/api/lyrics?query=${encodeURIComponent(query)}`);
        if (res.data?.result) {
          lyricsData = {
            title: res.data.result.title,
            artist: res.data.result.artist,
            lyrics: res.data.result.lyrics,
            thumbnail: res.data.result.thumbnail
          };
        }
      } catch (err) { /* Silent fallback */ }
      
      // --- API 2: SIPUTZX (FALLBACK) ---
      if (!lyricsData) {
        try {
          const res = await axios.get(`https://api.siputzx.my.id/api/s/lyrics?query=${encodeURIComponent(query)}`);
          if (res.data?.status && res.data?.data) {
            lyricsData = {
              title: res.data.data.title,
              artist: res.data.data.artist,
              lyrics: res.data.data.lyrics,
              thumbnail: res.data.data.image
            };
          }
        } catch (err) { /* API Down */ }
      }
      
      if (!lyricsData) {
        return extra.reply('❌ *ᴀᴜᴄᴜɴᴇ ᴘᴀʀᴏʟᴇ ᴛʀᴏᴜᴠéᴇ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄʜᴀɴsᴏɴ.*');
      }
      
      // Limitation pour éviter le crash WhatsApp (max 4000 chars)
      let lyrics = lyricsData.lyrics;
      if (lyrics.length > 4000) {
        lyrics = lyrics.substring(0, 3900) + '...\n\n_ (ᴛᴇxᴛᴇ ᴛʀᴏᴘ ʟᴏɴɢ) _';
      }
      
      const caption = `${AGM_DESIGN(lyricsData.title, lyricsData.artist)}\n\n${lyrics}`;
      
      if (lyricsData.thumbnail) {
        await sock.sendMessage(extra.from, {
          image: { url: lyricsData.thumbnail },
          caption: caption
        }, { quoted: msg });
      } else {
        await extra.reply(caption);
      }

      await sock.sendMessage(extra.from, { react: { text: "🎶", key: msg.key } });
      
    } catch (error) {
      console.error('Lyrics error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʀᴇᴄʜᴇʀᴄʜᴇ.*');
    }
  }
};
