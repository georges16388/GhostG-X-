/**
 * Promote Command - Make member admin
 * GhostG-X Edition
 */

const { findParticipant } = require('../../utils/jidHelpers');
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

const prefix = config.prefix || '.';

module.exports = {
  name: 'promote',
  aliases: ['makeadmin', 'elever', 'prom'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇʟᴇᴠᴇ ᴜɴ ᴍᴇᴍʙʀᴇ ᴀᴜ ʀᴀɴɢ ᴅᴇ ɢᴀʀᴅɪᴇɴ (ᴀᴅᴍɪɴ)',
  usage: `${prefix}promote @user`, // 💡 Dynamique avec ton préfixe actuel
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

      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant) { // Gère la réponse à un message
        target = ctx.participant;
      } else {
        return reply(`*❌ ${toSmallCaps('veuillez mentionner ou repondre a l individu a promouvoir')} !*\n\n*ᴇxᴇᴍᴘʟᴇ :* \`${prefix}promote @user\`\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);

      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);

      if (!foundParticipant) {
        return reply(`*❌ ${toSmallCaps('cet individu ne fait pas partie du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Check if already admin using fresh data
      if (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin') {
        return reply(`*❌ ${toSmallCaps('cet individu est deja un gardien (administrateur)')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');

      // Notification d'élévation stylisée
      await sock.sendMessage(extra.from, {
        text: `📈 *@${target.split('@')[0]} ${toSmallCaps('a ete eleve au rang de gardien du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('Promote Command Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
