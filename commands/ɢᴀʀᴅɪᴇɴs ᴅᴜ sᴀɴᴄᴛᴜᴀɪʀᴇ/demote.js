/**
 * Commande demote - dissoudre un admin
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { findParticipant } = require('../../handler.js');
const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

// Fonction pour le style Small Caps (Garde la cohérence visuelle)
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
  name: 'demote',
  aliases: ['removeadmin', 'dem', 'destituer', 'rabaisser', 'ᴅᴇᴍᴏᴛᴇ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇᴛɪʀᴇ ʟᴇs ᴘʀɪᴠɪʟᴇ̀ɢᴇs ᴀᴅᴍɪɴ ᴅ\'ᴜɴ ᴍᴇᴍʙʀᴇ',
  usage: `${prefix}demote @user | réponse`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner;

      // 🚨 ADAPTATION : Si ce n'est pas TOI, on vérifie s'il est admin
      if (!isMe) {
        const isAdmin = extra.isAdmin || false; 
        if (!isAdmin) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
      }

      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // 1. On cherche d'abord la mention @user
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } 
      // 2. Si pas de mention, on regarde si l'utilisateur RÉPOND à un message
      else if (ctx?.participant || ctx?.remoteJid) {
        target = ctx.participant || ctx.remoteJid;
      } 

      // Si aucune cible n'est trouvée, on envoie l'aide
      if (!target) {
        return reply(
          `*╭╼━━━≪• ᴅᴇsᴛɪᴛᴜᴛɪᴏɴ •≫━━━╾╮*\n` +
          `*┃* *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('veuillez mentionner ou repondre a')}*\n` +
          `*┃* *${toSmallCaps('l individu a destituer')}.*\n\n` +
          `  ${prefix}demote @user\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const chatId = msg.key.remoteJid;

      // Recherche de l'utilisateur dans le sanctuaire
      const freshMetadata = await sock.groupMetadata(chatId);
      const foundParticipant = findParticipant(freshMetadata.participants, target);

      if (!foundParticipant) {
        return reply(`❌ *${toSmallCaps('cet individu ne fait pas partie du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Vérification des droits actuels
      if (foundParticipant.admin !== 'admin' && foundParticipant.admin !== 'superadmin') {
        return reply(`❌ *${toSmallCaps('cet individu n est pas un gardien (administrateur)')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // On applique la destitution
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');

      // Notification de succès
      await sock.sendMessage(chatId, {
        text: `📉 *@${target.split('@')[0]} ${toSmallCaps('a ete destitue du rang de gardien du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      return reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
