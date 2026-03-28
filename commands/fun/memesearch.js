/**
 * Meme Search Command - AGM Elite Edition
 * Search and get GIFs/Memes with Full Bold Small Caps
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
// Note : Assure-toi que ces utilitaires existent dans ton projet
// const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

// Fonction de conversion en Bold Small Caps (Style Prestige Intégral)
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', 
        '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'à': 'ᴀ', 'ç': 'ᴄ'
    };
    const capsText = text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

// Design Elite pour la recherche de mèmes
const MEME_SEARCH_DESIGN = (query) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ᴍᴇᴍᴇ sᴇᴀʀᴄʜ')} •≫━╾╮*
*┃*
*┃* 🔍 *${toBoldSmallCaps('sᴇᴀʀᴄʜ')}* : ${toBoldSmallCaps(query)}
*┃* ✨ *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : ${toBoldSmallCaps('ғᴏᴜɴᴅ')}
*┃* 🎬 *${toBoldSmallCaps('ᴛʏᴘᴇ')}* : ${toBoldSmallCaps('ᴅʏɴᴀᴍɪᴄ ᴍᴇᴅɪᴀ')}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

module.exports = {
  name: 'memesearch',
  aliases: ['memes', 'sm', 'smeme', 'gifsearch', 'gif'],
  category: 'fun',
  desc: 'Rechercher et obtenir des mèmes/GIFs',
  usage: '.memesearch <query>',
  execute: async (sock, msg, args, extra) => {
    try {
      const query = args.join(' ').trim();
      const prefix = extra.prefix || '.';

      if (!query) {
        return await extra.reply(
          `*╭╼━≪• ${toBoldSmallCaps('ᴍᴇᴍᴇ sᴇᴀʀᴄʜ')} •≫━╾╮*\n` +
          `*┃* 💡 *${toBoldSmallCaps('ᴜsᴀɢᴇ')}* : ${prefix}${toBoldSmallCaps('ɢɪғ <ǫᴜᴇʀʏ>')}\n` +
          `*┃* 📝 *${toBoldSmallCaps('ᴇx')}* : ${prefix}${toBoldSmallCaps('ɢɪғ ʜᴇʟʟᴏ')}\n` +
          `*╰━━━━━━━━━━━━━━━╯*`
        );
      }

      // Réaction de recherche
      await sock.sendMessage(extra.from, { react: { text: "🔍", key: msg.key } });

      const url = `https://api.shizo.top/tools/meme-search?apikey=shizo&query=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const mediaBuffer = Buffer.from(response.data);
      if (!mediaBuffer || mediaBuffer.length === 0) throw new Error('Empty response');

      const contentType = response.headers['content-type'] || '';
      const fileHeader = mediaBuffer.slice(0, 6).toString('ascii');
      const isGIF = fileHeader === 'GIF89a' || fileHeader === 'GIF87a' || contentType.includes('gif');

      const caption = MEME_SEARCH_DESIGN(query);

      if (isGIF) {
        // Logique simplifiée pour l'envoi de GIF en lecture automatique (MP4)
        // Note: l'utilisation de ffmpeg dépend de ton environnement (getTempDir/deleteTempFile)
        await sock.sendMessage(extra.from, {
            video: mediaBuffer,
            mimetype: 'video/mp4',
            gifPlayback: true,
            caption: caption
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          image: mediaBuffer,
          caption: caption
        }, { quoted: msg });
      }

      // Réaction de succès
      await sock.sendMessage(extra.from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('MemeSearch Error:', error);
      const errorMsg = toBoldSmallCaps(`Echec de la recherche : ${error.message}`);
      await extra.reply(`❌ ${errorMsg}`);
    }
  }
};
