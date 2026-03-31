/**
 * 1917 Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: '1917',
  aliases: [],
  category: '‎✎ ғᴏʀɢᴇ ᴅᴇ ᴛᴇxᴛᴇ',
  description: 'Create 1917 style text effect',
  usage: '.1917 <text>',
  
  async execute(sock, msg, args) {
  const prefix = config.prefix || '.';
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;
      
      if (!text) {
        return await sock.sendMessage(chatId, { 
          text: `*ғᴏᴜʀɴɪs ᴜɴ ᴛᴇxᴛᴇ*.\n *ᴇxᴀᴍᴘʟᴇ* : ${prefix}1917 Jésus-Christ`
        }, { quoted: msg });
      }
      
      const result = await mumaker.ephoto('https://en.ephoto360.com/1917-style-text-effect-523.html', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in 1917 command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `Error: ${error.message}` 
      }, { quoted: msg });
    }
  }
};

