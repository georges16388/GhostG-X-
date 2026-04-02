/**
 * Delete Command
 * Delete a replied message and the command itself
 */

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
  name: 'delete',
  aliases: ['del', 'dlt', 'd', 'sup', 'supprime', 'ᴅᴇʟᴇᴛᴇ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴇᴛ ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ',
  usage: `${prefix}delete`,
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

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.stanzaId || !ctx?.participant) {
        return reply(
          `*╭╼━━━≪• ᴇʟɪᴍɪɴᴀᴛɪᴏɴ_ᴄɪʙʟᴇᴇ •≫━━━╾╮*\n` +
          `*┃* *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('reponds au message que tu souhaites')}*\n` +
          `*┃* *${toSmallCaps('faire disparaitre')}.*\n\n` +
          `  ${prefix}delete\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const chatId = msg.key.remoteJid;

      // 1. Clé pour supprimer le message auquel on répond
      const deleteTargetKey = { 
        remoteJid: chatId, 
        id: ctx.stanzaId, 
        participant: ctx.participant 
      };

      // 2. Clé pour supprimer le message de commande actuel (.delete)
      const deleteCommandKey = {
        remoteJid: chatId,
        id: msg.key.id,
        participant: msg.key.participant || msg.key.remoteJid
      };

      // On exécute les deux suppressions
      await sock.sendMessage(chatId, { delete: deleteTargetKey });
      await sock.sendMessage(chatId, { delete: deleteCommandKey });

    } catch (error) {
      console.error('Delete command error:', error);
      return reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
