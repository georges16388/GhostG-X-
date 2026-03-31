/**
 * Leaves Text Effect
 */

const mumaker = require('mumaker');
const config = require('../../config');

module.exports = {
  name: 'leaves',
  aliases: [],
  category: '‎✎ ғᴏʀɢᴇ ᴅᴇ ᴛᴇxᴛᴇ',
  description: 'Create leaves text effect',
  usage: '.leaves <text>',
  
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
      
      const result = await mumaker.ephoto('https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html', text);
      
      if (!result || !result.image) {
        throw new Error('No image URL received from the API');
      }
      
      await sock.sendMessage(chatId, {
        image: { url: result.image },
        caption: `>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Error in leaves command:', error);
      await sock.sendMessage(msg.key.remoteJid, { 
        text: `Error: ${error.message}` 
      }, { quoted: msg });
    }
  }
};

