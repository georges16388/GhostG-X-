/**
 * Anti-Status Mention Command - Toggle antistatusmention protection with delete/kick options
 */

const database = require('../../database');
const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

// Fonction pour le style Small Caps
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
  name: 'antistatusmention',
  aliases: ['asm', 'antigroupstatus', 'antistatus'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴀ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ᴄᴏɴᴛʀᴇ ʟᴇs ᴍᴇɴᴛɪᴏɴs ɪɴᴠɪsɪʙʟᴇs ᴅᴇ sᴛᴀᴛᴜᴛ (ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ)',
  usage: `${prefix}antistatusmention <on/off/set/get>`,
  groupOnly: true,
  adminOnly: true, // Géré nativement par ton handler pour les admins
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) { 
    const { reply, isOwner } = extra;
    try { 

      // 🛡️ ÉVALUATION DES DROITS
      // On autorise si c'est le maître supreme (via le handler) ou un admin du groupe
      const isAdmins = extra.isAdmins || false; 

      if (!isOwner && !isAdmins) {
        return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antistatusmention ? 'ON' : 'OFF';
        const action = (settings.antistatusmentionAction || 'delete').toUpperCase();

        return reply(
          `*╭╼━━━≪• sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_sᴛᴀᴛᴜᴛs •≫━━━╾╮*\n` +
          `*┃* 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `*┃* ⚖️ *${toSmallCaps('sentence')} :* ${action}\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('cet arcane detecte et purge les mentions')}*\n` +
          `*┃* *${toSmallCaps('cachees de statut dans le sanctuaire')}.*\n\n` +
          `  ${prefix}antistatusmention on\n` +
          `  ${prefix}antistatusmention off\n` +
          `  ${prefix}antistatusmention set delete | kick\n` +
          `  ${prefix}antistatusmention get\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antistatusmention) {
          return reply(`*❌ ${toSmallCaps('le bouclier de statut est deja actif')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
        database.updateGroupSettings(extra.from, { antistatusmention: true });
        return reply(`*🛡️ ${toSmallCaps('bouclier de statut a ete eveille')} (ᴏɴ).*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antistatusmention: false });
        return reply(`*🔓 ${toSmallCaps('le bouclier de statut a ete desactive')} (ᴏғғ).*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} :* \`${prefix}antistatusmention set delete | kick\`\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        database.updateGroupSettings(extra.from, { 
          antistatusmentionAction: setAction,
          antistatusmention: true // Auto-active lors de la configuration de l'action
        });
        return reply(`*⚖️ ${toSmallCaps('la sentence du bouclier de statut est placee sur')} : ${setAction.toUpperCase()}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antistatusmention ? 'ON' : 'OFF';
        const action = (settings.antistatusmentionAction || 'delete').toUpperCase();

        return reply(
          `*╭╼━━━≪• sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_sᴛᴀᴛᴜᴛs •≫━━━╾╮*\n` +
          `*┃* 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `*┃* ⚖️ *${toSmallCaps('sentence')} :* ${action}\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      return reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}antistatusmention\` ${toSmallCaps('pour voir les options')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

    } catch (error) {
      console.error('Anti-status mention command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
