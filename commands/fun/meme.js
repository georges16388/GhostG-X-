/**
 * Meme Command - Envoyer des mèmes aléatoires
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// Design pour la légende du Meme
const MEME_DESIGN = (title, sub, ups) => `╭╼━≪• *ɢʜᴏsᴛ ᴍᴇᴍᴇ ʜᴜʙ* •≫━╾╮
┃ ${toSmallCaps('ᴛɪᴛʀᴇ')} : ${toSmallCaps(title)} 😂
┃ ${toSmallCaps('sᴏᴜʀᴄᴇ')} : ʀ/${toSmallCaps(sub)} 📱
┃ ${toSmallCaps('ᴠᴏᴛᴇs')} : ${ups} ⬆️
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps('ғᴜɴɴʏ ᴀғ')}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'meme',
  aliases: ['memes', 'reddit'],
  category: 'fun',
  description: 'Obtenir des mèmes aléatoires de Reddit',
  usage: '.meme',

  async execute(sock, msg, args, extra) {
    try {
      // 1. Réaction de recherche
      await sock.sendMessage(extra.from, { 
        react: { text: "🔍", key: msg.key } 
      });

      // 2. Récupération du meme (On cible des subreddits de mèmes souvent visuels)
      const res = await axios.get('https://meme-api.com/gimme');
      const meme = res.data;

      if (!meme || !meme.url) throw new Error("Meme non trouvé");

      // 3. Téléchargement de l'image via axios
      const response = await axios.get(meme.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 4. Envoi avec le design signature
      await sock.sendMessage(extra.from, {
        image: buffer,
        caption: MEME_DESIGN(meme.title, meme.subreddit, meme.ups),
        contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ᴍᴇᴍᴇ ɢᴇɴᴇʀᴀᴛᴏʀ",
                body: "ᴛᴏɴ ᴅᴏsᴇ ǫᴜᴏᴛɪᴅɪᴇɴɴᴇ ᴅᴇ ғᴜɴ !",
                thumbnail: buffer,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: false
            }
        }
      }, { quoted: msg });

      // 5. Réaction de rire finale
      await sock.sendMessage(extra.from, { 
        react: { text: "😂", key: msg.key } 
      });

    } catch (error) {
      console.error('Meme Error:', error);
      const errorMsg = toSmallCaps("Impossible de récupérer un mème");
      await extra.reply(`❌ ${errorMsg}`);
    }
  }
};
