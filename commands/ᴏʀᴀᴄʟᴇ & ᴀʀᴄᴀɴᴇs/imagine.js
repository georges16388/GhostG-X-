/**
 * Magic Studio AI Art Generation Command
 * Generate AI-powered art from text prompts
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const config = require('../../config.js');

const BASE = 'https://api.siputzx.my.id/api/ai/magicstudio';

module.exports = {
  name: 'forger', // Le name en minuscules pour la cohérence du système de commande
  aliases: ['magic', 'magicai', 'aiimage', 'generate', 'imagine', 'forger', 'ғᴏʀɢᴇʀ'],
  category: '‎⍟ ᴏʀᴀᴄʟᴇ & ᴀʀᴄᴀɴᴇs',
  description: 'Generate AI art from text prompt',
  usage: '.forger <prompt>',
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    
    try {
      const prompt = args.join(' ').trim();

      if (!prompt) {
        return await extra.reply(
          `╭╼━≪• *ᴍᴀɢɪᴄ_sᴛᴜᴅɪᴏ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴀᴛᴛᴇɴᴛᴇ ⏳\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*ᴄᴇᴛ ᴀʀᴛᴇ́ғᴀᴄᴛ ᴍᴀᴛᴇ́ʀɪᴀʟɪsᴇ ᴠᴏs ᴠɪsɪᴏɴs ᴇɴ ɪʟʟᴜsɪᴏɴs ᴠɪsᴜᴇʟʟᴇs.*\n\n` +
          `  ${prefix}forger <murmure>\n\n` +
          `📜 *ᴇxᴇᴍᴘʟᴇ :*\n` +
          `  ${prefix}forger une cité cyberpunk\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      await extra.reply(`⏳ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs... ʟᴇs ᴏᴍʙʀᴇs s'ᴀᴄᴛɪᴠᴇɴᴛ ᴘᴏᴜʀ ғᴏʀɢᴇʀ ᴛᴀ ᴠɪsɪᴏɴ.*`);

      // 1. Appel de l'API pour obtenir le JSON
      const url = `${BASE}?prompt=${encodeURIComponent(prompt)}`;
      const apiResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        timeout: 120000 // 2 minutes
      });

      // 2. Extraction de l'URL de l'image (selon la structure de siputzx)
      const imageUrl = apiResponse.data?.result || apiResponse.data?.data?.url || apiResponse.data?.url;

      if (!imageUrl) {
        throw new Error('Impossible de récupérer le lien de l\'image depuis l\'Oracle.');
      }

      // 3. Téléchargement de l'image réelle en ArrayBuffer
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const imageBuffer = Buffer.from(imageResponse.data);

      // Vérification de la taille
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (imageBuffer.length > maxImageSize) {
        throw new Error(`Image trop lourde : ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB (max 5MB)`);
      }

      // 4. Envoi de l'image forgée
      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: `✨ *ᴠᴏɪᴄɪ ʟ'ɪʟʟᴜsɪᴏɴ ᴍᴀᴛᴇ́ʀɪᴀʟɪsᴇ́ᴇ :*\n\n> "${prompt}"\n\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });

    } catch (error) {
      console.error('Error in magicstudio command:', error);

      if (error.response?.status === 429) {
        await extra.reply('❌ *ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ sᴀᴛᴜʀᴇ́. ʀᴇ́ᴇssᴀʏᴇ ᴅᴀɴs ǫᴜᴇʟǫᴜᴇs ɪɴsᴛᴀɴᴛs.*');
      } else if (error.response?.status === 400 || error.response?.status === 404) {
        await extra.reply('❌ *ᴍᴜʀᴍᴜʀᴇ ɪɴᴠᴀʟɪᴅᴇ. ʟ'ᴀᴘɪ ɴ'ᴀ ᴘᴀs ᴘᴜ ᴄᴏᴍᴘʀᴇɴᴅʀᴇ ᴛᴀ ᴅᴇᴍᴀɴᴅᴇ.*');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        await extra.reply('❌ *ʟᴇ sᴘᴇᴄᴛʀᴇ ᴀ ᴍɪs ᴛʀᴏᴘ ᴅᴇ ᴛᴇᴍᴘs ᴀ̀ ʀᴇ́ᴘᴏɴᴅʀᴇ. ʟᴇ sᴏʀᴛ ᴀ ᴇ́ᴄʜᴏᴜᴇ́.*');
      } else {
        await extra.reply(`❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ ғᴏʀɢᴇ :* ${error.message}`);
      }
    }
  }
};
