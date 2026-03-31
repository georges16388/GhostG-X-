/**
 * Snow Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'snow',
  aliases: [],
  category: '‎✎ ғᴏʀɢᴇ ᴅᴇ ᴛᴇxᴛᴇ',
  description: 'Create snow text effect',
  usage: '.snow <text>',
  
  async execute(sock, msg, args) {
  const prefix = config.prefix || '.'; 
    try {
      const text = args.join(' ');
      if (!text) {
        return await sock.sendMessage(msg.key.remoteJid, { 
          text: `*ғᴏᴜʀɴɪs ᴜɴ ᴛᴇxᴛᴇ*.\n *ᴇxᴀᴍᴘʟᴇ* : ${prefix}1917 Jésus-Christ`
        }, { quoted: msg });
      }
      
      const result = await mumaker.ephoto('https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: result.image },
        caption: `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in snow command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `Error: ${error.message}` 
      }, { quoted: msg });
    }
  }
};

