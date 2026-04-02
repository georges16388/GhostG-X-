/**
 * AntiTag Command
 * Enable/disable anti-tag and set action (delete/kick)
 */

const database = require('../../database');
const config = require ('../../config.js');

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
  name: 'antitag',
  aliases: ['antimention', 'at'],
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴀ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ᴀɴᴛɪ-ᴛᴀɢ (ᴛᴀɢᴀʟʟ/ʜɪᴅᴇᴛᴀɢ)',
  usage: `${prefix}antitag <on/off/set/get>`,
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
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
        const isAdmins = extra.isAdmins || false; 
        if (!isAdmins) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag ? 'ON' : 'OFF';
        const action = (settings.antitagAction || 'delete').toUpperCase();

        return reply(
          `*╭╼━━━≪• sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴛᴀɢs •≫━━━╾╮*\n` +
          `*┃* 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `*┃* ⚖️ *${toSmallCaps('sentence')} :* ${action}\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('cet arcane detecte et purge les tags')}*\n` +
          `*┃* *${toSmallCaps('intempestifs du sanctuaire')}.*\n\n` +
          `  ${prefix}antitag on\n` +
          `  ${prefix}antitag off\n` +
          `  ${prefix}antitag set delete | kick\n` +
          `  ${prefix}antitag get\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antitag) {
          return reply(`*❌ ${toSmallCaps('le bouclier de tags est deja actif')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
        database.updateGroupSettings(extra.from, { antitag: true });
        return reply(`*🛡️ ${toSmallCaps('bouclier de tags a ete eveille')} (ᴏɴ).*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antitag: false });
        return reply(`*🔓 ${toSmallCaps('le bouclier de tags a ete desactive')} (ᴏғғ).*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} :* \`${prefix}antitag set delete | kick\`\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        database.updateGroupSettings(extra.from, { 
          antitagAction: setAction,
          antitag: true // Auto-enable when setting action
        });
        return reply(`*⚖️ ${toSmallCaps('la sentence du bouclier de tags est placee sur')} : ${setAction.toUpperCase()}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag ? 'ON' : 'OFF';
        const action = (settings.antitagAction || 'delete').toUpperCase();

        return reply(
          `*╭╼━━━≪• sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴛᴀɢs •≫━━━╾╮*\n` +
          `*┃* 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `*┃* ⚖️ *${toSmallCaps('sentence')} :* ${action}\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      return reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}antitag\` ${toSmallCaps('pour voir les options')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

    } catch (error) {
      console.error('Anti-tag command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
