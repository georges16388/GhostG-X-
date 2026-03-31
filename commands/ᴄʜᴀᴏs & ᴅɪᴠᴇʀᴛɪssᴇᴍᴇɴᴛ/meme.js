/**
 * Meme Command - Send random memes
 */

const APIs = require('../../utils/api');
const axios = require('axios');

module.exports = {
  name: 'ғʀᴇsǫᴜᴇ',
  aliases: ['memes', 'meme', 'fresque'],
  category:  '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'Get random memes',
  usage: '.ғʀᴇsǫᴜᴇ',
  
  async execute(sock, msg, args, extra) {
    try {
      const meme = await APIs.getMeme();
      
      const imageBuffer = await axios.get(meme.url, { responseType: 'arraybuffer' });
      
      await sock.sendMessage(extra.from, {
        image: Buffer.from(imageBuffer.data),
        caption: `😂 *${meme.title.toUpperCase()}*\n\n📱 sᴄᴇᴀᴜ : ʀ/${meme.subreddit}\n👤 ᴀᴜᴛᴇᴜʀ : ${meme.author}\n⬆️ ɪɴᴠᴏᴄᴀᴛɪᴏɴs : ${meme.ups}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
