/**
 * Translate Command - Translate text to different languages
 * GhostG-X Edition
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
  name: 'translate',
  aliases: ['tr', 'trans', 'trad'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs', 
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ʟᴀ sᴀɢᴇssᴇ ᴅᴇs ʟᴀɴɢᴜᴇs ᴘᴏᴜʀ ᴛʀᴀᴅᴜɪʀᴇ ᴜɴ ᴍᴜʀᴍᴜʀᴇ**',
  usage: `${config.prefix || '.'}tr [langue] [texte ou en reponse]`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try { 
      const prefix = config.prefix || '.';
      let targetLang = 'fr'; // Langue par défaut
      let text = '';

      // 1. Détection isolée de la cible (Message cité ou Arguments)
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;

      if (quoted) {
        // On récupère le texte du message cité
        text = quoted.conversation || 
               quoted.extendedTextMessage?.text || 
               quoted.imageMessage?.caption || 
               quoted.videoMessage?.caption || 
               '';

        // Si l'utilisateur précise une langue en argument (ex: .tr en)
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

      // 2. Vérification si le texte est vide
      if (!text || text.trim() === '') {
        return reply(
          `*╭╼━━━≪• ${toSmallCaps('echec de linvocation')} •≫━━━╾╮*\n` +
          `*┃* 🔮 *${toSmallCaps('indique la langue et le texte')} !*\n` +
          `*┃* 💡 *${toSmallCaps('exemple')} : ${prefix}tr en bonjour*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      // Message d'attente (maintenant totalement safe !)
      await reply(`*☬ ${toSmallCaps('invocation des arcanes linguistiques')}...*`);

      // 3. Appel à l'API de ton Sanctuaire
      const result = await APIs.translate(text, targetLang);
      
      // Gère le fait que l'API retourne un objet { translation: "..." } ou directement un String
      const translatedText = result.translation || result;

      // 4. Construction du rendu visuel
      const replyText = 
          `*╭╼━━━≪• ${toSmallCaps('reflet symbolique')} •≫━━━╾╮*\n` +
          `*┃* 🗣️ *${toSmallCaps('langue')} :* ${targetLang.toUpperCase()}\n` +
          `*┃* 📝 *${toSmallCaps('murmure')} :* ${text}\n` +
          `*┃* 🔤 *${toSmallCaps('reflet')} :* ${translatedText}\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      await reply(replyText);

    } catch (error) {
      console.error('Translate Error:', error);
      await reply(`*❌ ${toSmallCaps('erreur')} :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
