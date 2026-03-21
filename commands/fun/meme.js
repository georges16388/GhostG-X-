/**
 * Meme Command - Send random memes
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

// Design pour la légende du Meme
const MEME_DESIGN = (title, sub, ups) => `╭╼━≪• ɢʜᴏsᴛ ᴍᴇᴍᴇ ʜᴜʙ •≫━╾╮
┃ ᴛɪᴛʟᴇ : ${title} 😂
┃ sᴏᴜʀᴄᴇ : r/${sub} 📱
┃ ᴠᴏᴛᴇs : ${ups} ⬆️
┃ sᴛᴀᴛᴜs : ғᴜɴɴʏ ᴀғ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'meme',
  aliases: ['memes', 'reddit'],
  category: 'fun',
  description: 'Get random memes from Reddit',
  usage: '.meme',
  
  async execute(sock, msg, args, extra) {
    try {
      // 1. Petit effet sympa : le bot réagit pendant qu'il cherche
      await sock.sendMessage(extra.from, { 
        react: { text: "🔍", key: msg.key } 
      });

      // 2. Récupération du meme via une API publique fiable (ou la tienne)
      const res = await axios.get('https://meme-api.com/gimme');
      const meme = res.data;

      if (!meme || !meme.url) throw new Error("Meme non trouvé");

      // 3. Téléchargement de l'image
      const imageBuffer = await axios.get(meme.url, { responseType: 'arraybuffer' });
      
      // 4. Envoi avec ton design signature
      await sock.sendMessage(extra.from, {
        image: Buffer.from(imageBuffer.data),
        caption: MEME_DESIGN(meme.title, meme.subreddit, meme.ups),
        // On peut ajouter le lien de ta chaîne ici si tu veux
        contextInfo: {
            externalAdReply: {
                title: "GHOST MEME GENERATOR",
                body: "Enjoy your daily dose of fun!",
                thumbnailUrl: meme.url,
                mediaType: 1,
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
      await extra.reply(`❌ Error: Impossible de récupérer un meme pour le moment.`);
    }
  }
};
