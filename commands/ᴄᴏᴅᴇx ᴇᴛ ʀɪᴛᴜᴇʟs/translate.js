/**
 * Translate Command - Translate text to different languages
 */

const APIs = require('../../utils/api');
const config = require('../../config.js');

// Fonction pour le style Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'ᴛʀᴀɴsʟᴀᴛᴇ',
  aliases: ['tr', 'trans', 'trad', 'translate'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs', 
  description: '**ɪɴᴠᴏQᴜᴇ ʟᴀ ꜱᴀɢᴇꜱꜱᴇ ᴅᴇꜱ ʟᴀɴɢᴜᴇꜱ ᴘᴏᴜʀ ᴛʀᴀᴅᴜɪʀᴇ ᴜɴ ᴍᴜʀᴍᴜʀᴇ**',
  usage: 'ᴛʀᴀɴsʟᴀᴛᴇ',

  async execute(sock, msg, args, extra) {
    try { 
      const prefix = config.prefix || '.';
      let targetLang = 'fr'; // Langue par défaut
      let text = '';

      // 1. Détection du texte (Message cité ou Arguments)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted) {
        // On récupère le texte du message cité
        text = quoted.conversation || 
               quoted.extendedTextMessage?.text || 
               quoted.imageMessage?.caption || 
               quoted.videoMessage?.caption || 
               '';

        // Si l'utilisateur précise une langue (ex: .tr en)
        if (args[0] && args[0].length <= 5) {
          targetLang = args[0].toLowerCase();
        }
      } else {
        // Pas de reply, on prend tout dans les arguments
        if (args.length >= 2 && args[0].length <= 3) {
          // Si le premier argument ressemble à un code de langue (ex: en, es, ar)
          targetLang = args[0].toLowerCase();
          text = args.slice(1).join(' ');
        } else if (args.length >= 1) {
          // Si pas de code de langue détecté, on traduit vers le français par défaut
          targetLang = 'fr';
          text = args.join(' ');
        }
      }

      // 2. Vérification si vide
      if (!text || text.trim() === '') {
        return extra.reply(
          `*╭╼━━━≪• ${toSmallCaps('echec de linvocation')} •≫━━━╾╮*\n` +
          `*┃* 🔮 *${toSmallCaps('indique la langue et le texte')} !*\n` +
          `*┃* 💡 *${toSmallCaps('exemple')} : ${prefix}tr en bonjour*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`
        );
      }

      await extra.reply(`*☬ ${toSmallCaps('invocation des arcanes linguistiques')}...*`);

      // 3. Appel à l'API
      const result = await APIs.translate(text, targetLang);
      const translatedText = result.translation || result;

      // 4. Construction du rendu
      const replyText = 
          `*╭╼━━━≪• ${toSmallCaps('reflet symbolique')} •≫━━━╾╮*\n` +
          `*┃* 🗣️ *${toSmallCaps('langue')} :* ${targetLang.toUpperCase()}\n` +
          `*┃* 📝 *${toSmallCaps('murmure')} :* ${text}\n` +
          `*┃* 🔤 *${toSmallCaps('reflet')} :* ${translatedText}\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      await extra.reply(replyText);

    } catch (error) {
      await extra.reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`);
    }
  }
};
