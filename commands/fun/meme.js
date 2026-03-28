/**
 * Meme Command - AGM Elite Edition
 * Reddit Meme Fetcher with Full Bold Small Caps
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

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

// Design Elite pour la légende du Meme
const MEME_DESIGN = (title, sub, ups) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ᴍᴇᴍᴇ ʜᴜʙ')} •≫━╾╮*
*┃*
*┃* 😂 *${toBoldSmallCaps('ᴛɪᴛʀᴇ')}* : ${toBoldSmallCaps(title)}
*┃* 📱 *${toBoldSmallCaps('sᴏᴜʀᴄᴇ')}* : ${toBoldSmallCaps('ʀ/')}${toBoldSmallCaps(sub)}
*┃* ⬆️ *${toBoldSmallCaps('ᴠᴏᴛᴇs')}* : ${toBoldSmallCaps(ups.toString())}
*┃* ✨ *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : ${toBoldSmallCaps('ғᴜɴɴʏ ᴀғ')}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x')}***`;

module.exports = {
  name: 'meme',
  aliases: ['memes', 'reddit'],
  category: 'fun',
  description: 'Obtenir des mèmes aléatoires de Reddit (Elite Style)',
  usage: '.meme',

  async execute(sock, msg, args, extra) {
    try {
      // 1. Réaction de recherche
      await sock.sendMessage(extra.from, { 
        react: { text: "🔍", key: msg.key } 
      });

      // 2. Récupération du mème via API
      const res = await axios.get('https://meme-api.com/gimme');
      const meme = res.data;

      if (!meme || !meme.url) throw new Error("Meme non trouvé");

      // 3. Téléchargement de l'image
      const response = await axios.get(meme.url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 4. Envoi avec le design signature et External Ad Reply
      await sock.sendMessage(extra.from, {
        image: buffer,
        caption: MEME_DESIGN(meme.title, meme.subreddit, meme.ups),
        contextInfo: {
            externalAdReply: {
                title: toBoldSmallCaps(`ɢʜᴏsᴛ ᴍᴇᴍᴇ : ${meme.title}`),
                body: toBoldSmallCaps("ᴛᴏɴ ᴅᴏsᴇ ǫᴜᴏᴛɪᴅɪᴇɴɴᴇ ᴅᴇ ғᴜɴ !"),
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
      const errorMsg = toBoldSmallCaps("Impossible de récupérer un mème");
      await extra.reply(`❌ ${errorMsg}`);
    }
  }
};
