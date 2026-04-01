/**
 * Magic Studio AI Art Generation Command
 * Generate AI-powered art from text prompts
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const config = require('../../config.js');

const BASE = 'https://api.siputzx.my.id/api/ai/magicstudio';

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'forger',
  aliases: ['magic', 'magicai', 'aiimage', 'generate', 'imagine', 'ғᴏʀɢᴇʀ'],
  category: '⍟ ᴏʀᴀᴄʟᴇ & ᴀʀᴄᴀɴᴇs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ɢᴇɴᴇʀᴀᴛᴇ ᴀɪ ᴀʀᴛ ғʀᴏᴍ ᴛᴇxᴛ ᴘʀᴏᴍᴘᴛ**',
  usage: `${config.prefix || '.'}forger [prompt]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const { reply } = extra;

    try {
      const prompt = args.join(' ').trim();

      if (!prompt) {
        return reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃ 🔮 *${toSmallCaps('indique une description')}*\n` +
          `┃ *${toSmallCaps('pour forger lillusion')} !*\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      // Réaction avec l'orbe de forgeage
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
      });

      // 1. Appel de l'API pour obtenir le JSON
      const url = `${BASE}?prompt=${encodeURIComponent(prompt)}`;
      const apiResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        timeout: 120000 // 2 minutes
      });

      // 2. Extraction de l'URL de l'image
      const imageUrl = apiResponse.data?.result || apiResponse.data?.data?.url || apiResponse.data?.url;

      if (!imageUrl) {
        throw new Error('impossible de recuperer le lien de limage depuis loracle');
      }

      // 3. Téléchargement de l'image réelle en ArrayBuffer
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const imageBuffer = Buffer.from(imageResponse.data);

      // Vérification de la taille (5MB)
      const maxImageSize = 5 * 1024 * 1024;
      if (imageBuffer.length > maxImageSize) {
        throw new Error(`image trop lourde pour le sanctuaire`);
      }

      const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');

      // 4. Envoi de l'image forgée avec une légende compacte
      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                 `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                 `┃ 🔗 *${toSmallCaps('source')} :* ᴍᴀɢɪᴄsᴛᴜᴅɪᴏ\n` +
                 `┃ 🔖 *${toSmallCaps('prompt')} :* ${toSmallCaps(prompt)}\n` +
                 `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });

    } catch (error) {
      console.error('Error in magicstudio command:', error);

      let errorMessage = `*❌ ${toSmallCaps('le sort a echoue')} : ${toSmallCaps(error.message || 'erreur inconnue')} !*`;
      
      if (error.response?.status === 429) {
        errorMessage = `*❌ ${toSmallCaps('loracle est sature. reessaie dans quelques instants')} !*`;
      } else if (error.response?.status === 400 || error.response?.status === 404) {
        errorMessage = `*❌ ${toSmallCaps('murmure invalide. lapi na pas pu comprendre ta demande')} !*`;
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = `*❌ ${toSmallCaps('le spectre a mis trop de temps a repondre')} !*`;
      }

      await reply(`${errorMessage}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
