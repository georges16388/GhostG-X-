/**
 * SSWeb - Screenshot Website Command
 * GhostG-X Edition
 */

const axios = require('axios');
const APIs = require('../../utils/api');
const config = require('../../config.js');

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
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss', 'capture'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴘʀᴇɴᴅ ᴜɴᴇ ᴄᴀᴘᴛᴜʀᴇ ᴅ\'ᴇᴄʀᴀɴ ᴅ\'ᴜɴ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴡᴇʙ**',
  usage: `${config.prefix || '.'}ssweb [lien du site]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = extra.from;

    try {
      if (args.length === 0) {
        return reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('indique ladresse dun sanctuaire web')} !*\n` +
          `┃ 💡 *${toSmallCaps('exemple')} :* .ssweb google.com\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      let url = args.join(' ');

      // Auto-fix : Ajoute https:// si l'utilisateur l'oublie
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      // Petite réaction d'attente
      await sock.sendMessage(chatId, {
        react: { text: '📸', key: msg.key }
      });

      // Appel à l'API
      const screenshotResult = await APIs.screenshotWebsite(url);

      let screenshotBuffer;
      
      // Sécurité si l'API renvoie un lien au lieu d'un Buffer directement
      if (typeof screenshotResult === 'string' && screenshotResult.startsWith('http')) {
        const response = await axios.get(screenshotResult, { responseType: 'arraybuffer' });
        screenshotBuffer = Buffer.from(response.data);
      } else {
        screenshotBuffer = screenshotResult;
      }

      const captionText = 
          `╭╼━≪• *🖼️ ᴠɪsɪᴏɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🌐 *${toSmallCaps('source')} :* ${url}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      // Envoi de l'image de capture
      await sock.sendMessage(chatId, {
        image: screenshotBuffer,
        caption: captionText
      }, { quoted: msg });

    } catch (error) {
      console.error('SSWeb command error:', error);
      await reply(`*❌ ${toSmallCaps('erreur')} :* ${toSmallCaps('impossible de capturer ce sanctuaire')} (${error.message})\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
