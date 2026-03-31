/**
 * Arena Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'arena',
  aliases: [],
  category: '‎✎ ғᴏʀɢᴇ ᴅᴇ ᴛᴇxᴛᴇ',
  description: 'Create arena text effect',
  usage: '.arena <text>',
  
  async execute(sock, msg, args) {
  const prefix = config.prefix || '.';
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;
      
      if (!text) {
        return await sock.sendMessage(chatId, { 
          text: `*ғᴏᴜʀɴɪs ᴜɴ ᴛᴇxᴛᴇ*.\n *ᴇxᴀᴍᴘʟᴇ* : ${prefix}arena Jésus t'aime`
        }, { quoted: msg });
      }
      
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in arena command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `Error: ${error.message}` 
      }, { quoted: msg });
    }
  }
};

