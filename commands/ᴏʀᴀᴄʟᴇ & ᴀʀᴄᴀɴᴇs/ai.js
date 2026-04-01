/**
 * AI Chat Command - ChatGPT-style responses
 */

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
  name: 'oracle',
  aliases: ['gpt', 'chatgpt', 'ask', 'ai', 'ᴏʀᴀᴄʟᴇ'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄʜᴀᴛ ᴡɪᴛʜ ᴀɪ (ᴄʜᴀᴛɢᴘᴛ-sᴛʏʟᴇ)**',
  usage: `${config.prefix || '.'}oracle [question]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const { reply } = extra;

    try {
      const prefix = config.prefix || '.';

      if (args.length === 0) {
        return reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃ 🔮 *${toSmallCaps('indique une question')}*\n` +
          `┃ *${toSmallCaps('pour obtenir une reponse')} !*\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const question = args.join(' ');

      // Réaction avec l'orbe de réflexion
      await sock.sendMessage(chatId, {
        react: { text: '🤔', key: msg.key }
      });

      const response = await APIs.chatAI(question);

      // Récupération de la réponse brute sans fioritures comme demandé
      const answer = response.response || response.msg || response.data?.msg || response;
      
      await reply(answer);

    } catch (error) {
      console.error('AI Command Error:', error);
      await reply(`*❌ ${toSmallCaps('loracle a echoue')} : ${toSmallCaps(error.message || 'erreur inconnue')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
