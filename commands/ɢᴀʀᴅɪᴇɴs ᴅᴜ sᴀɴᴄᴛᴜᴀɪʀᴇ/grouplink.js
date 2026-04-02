/**
 * Link Command - Get group invite link
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

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
  name: 'grouplink',
  aliases: ['link', 'invite', 'portail'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɢᴇɴᴇʀᴇ ʟᴇ ʟɪᴇɴ ᴅ\'ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: `${prefix}grouplink`, // 💡 Dynamique avec ton préfixe actuel
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

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const code = await sock.groupInviteCode(extra.from);
      const link = `https://chat.whatsapp.com/${code}`;

      const subject = extra.groupMetadata.subject || 'sᴀɴᴄᴛᴜᴀɪʀᴇ';

      const text = `*╭╼━━━≪• ʟɪᴇɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ •≫━━━╾╮*\n` +
                   `*┃* 👥 *${toSmallCaps('groupe')} :* ${subject}\n` +
                   `*┃* 🔗 *${toSmallCaps('lien')} :* ${link}\n\n` +
                   `*┃* ⚠️ *${toSmallCaps('ne partage pas ce lien publiquement')} !*\n\n` +
                   `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await reply(text);

    } catch (error) {
      console.error('GroupLink Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
