/**
 * Magic Studio AI Art Generation Command
 * Generate AI-powered art from text prompts
 */

const axios = require('axios');

const BASE = 'https://api.siputzx.my.id/api/ai/magicstudio';

// Design pour le résultat de la génération d'image
const IMAGINE_DESIGN = (prompt) => `╭╼━≪• ɢʜᴏsᴛ ᴀɪ ᴀʀᴛ •≫━╾╮
┃ ᴘʀᴏᴍᴘᴛ : ${prompt}
┃ sᴛᴀᴛᴜs : ɢᴇɴᴇʀᴀᴛᴇᴅ ✨
┃ sᴛʏʟᴇ : ᴍᴀɢɪᴄ sᴛᴜᴅɪᴏ
┃
╰━━━━━━━━━━━━━━━╯
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'imagine',
  aliases: ['magic', 'magicai', 'aiimage', 'generate', 'magicstudio'],
  category: 'ai',
  desc: 'Generate AI art from text prompt',
  usage: 'imagine <prompt>',
  execute: async (sock, msg, args, extra) => {
    try {
      const prompt = args.join(' ').trim();
      const prefix = extra.prefix || '.';
      
      if (!prompt) {
        return await extra.reply(
          `╭╼━≪• ᴀɪ ɢᴇɴᴇʀᴀᴛᴏʀ •≫━╾╮\n` +
          `┃ ᴜsᴀɢᴇ : ${prefix}ɪᴍᴀɢɪɴᴇ <ᴘʀᴏᴍᴘᴛ>\n` +
          `┃ ᴇx : ${prefix}ɪᴍᴀɢɪɴᴇ ᴀ ᴄʏʙᴇʀᴘᴜɴᴋ ᴄɪᴛʏ\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }
      
      // Petit message d'attente
      await extra.reply('⏳ *Ghost AI is creating your art...*');
      
      // Fetch image from API
      const url = `${BASE}?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        },
        timeout: 120000 
      });
      
      const imageBuffer = Buffer.from(response.data);
      
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Empty response from API');
      }
      
      // Check file size (WhatsApp image limit is 5MB)
      const maxImageSize = 5 * 1024 * 1024;
      if (imageBuffer.length > maxImageSize) {
        throw new Error(`Image too large: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // Send the generated image with the design as caption
      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: IMAGINE_DESIGN(prompt)
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Imagine error:', error);
      
      if (error.response?.status === 429) {
        await extra.reply('❌ Rate limit exceeded. Please try again later.');
      } else {
        await extra.reply(`❌ Failed to generate image: ${error.message}`);
      }
    }
  }
};
