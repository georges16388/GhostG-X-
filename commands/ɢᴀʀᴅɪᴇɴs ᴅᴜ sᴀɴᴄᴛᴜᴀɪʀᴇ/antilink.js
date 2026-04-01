/**
 * Antilink Command - Toggle antilink protection with delete/kick options
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
  name: 'antilink',
  aliases: ['antilinkgc', 'antilien'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴀ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ᴀɴᴛɪʟɪɴᴋ (ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ)**',
  usage: `${prefix}antilink <on/off/set/get>`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antilink ? 'ON' : 'OFF';
        const action = (settings.antilinkAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ʟɪᴇɴs* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `┃ ⚖️ *${toSmallCaps('sentence')} :* ${action}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*${toSmallCaps('cet arcane detecte et purge les liens')}*\n` +
          `*${toSmallCaps('intrus du sanctuaire')}.*\n\n` +
          `  ${prefix}antilink on\n` +
          `  ${prefix}antilink off\n` +
          `  ${prefix}antilink set delete | kick\n` +
          `  ${prefix}antilink get\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antilink) {
          return reply(`*❌ ${toSmallCaps('le bouclier de liens est deja actif')} !*`);
        }
        database.updateGroupSettings(extra.from, { antilink: true });
        return reply(`*🛡️ ${toSmallCaps('bouclier de liens a ete eveille')} (ᴏɴ).*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antilink: false });
        return reply(`*🔓 ${toSmallCaps('le bouclier de liens a ete desactive')} (ᴏғғ).*`);
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} :* \`${prefix}antilink set delete | kick\``);
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')}.*`);
        }

        database.updateGroupSettings(extra.from, { 
          antilinkAction: setAction,
          antilink: true 
        });
        return reply(`*⚖️ ${toSmallCaps('la sentence du bouclier de liens est placee sur')} : ${setAction.toUpperCase()}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antilink ? 'ON' : 'OFF';
        const action = (settings.antilinkAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ʟɪᴇɴs* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🛡️ *${toSmallCaps('etat')} :* ${status}\n` +
          `┃ ⚖️ *${toSmallCaps('sentence')} :* ${action}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      return reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}antilink\` ${toSmallCaps('pour voir les options')}.*`);

    } catch (error) {
      console.error('Antilink command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
