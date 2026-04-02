/**
 * Erreur Command - GhostG-X Edition
 * Supprime un de tes propres messages auquel tu as répondu
 */

const config = require('../../config.js');
const crypto = require('crypto');

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
  name: 'erreur',
  aliases: ['er', 'e','error'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ᴜɴ ᴅᴇ ᴛᴇs ᴘʀᴏᴘʀᴇs ᴍᴇssᴀɢᴇs ᴇɴ ʏ ʀᴇᴘᴏɴᴅᴀɴᴛ',
  usage: `${prefix}erreur`,

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      // Routines d'authentification réseau
      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isMaster;

      if (!isMe) {
        return reply(`*❌ ${toSmallCaps('acces refuse. seul le maitre peut manier la gomme du spatio-temporel')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.stanzaId) {
        return reply(
          `╭╼━≪• *💥 ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ɪᴍᴍᴇᴅɪᴀᴛᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*${toSmallCaps('reponds a ton propre message que tu souhaites effacer')}.*\n\n` +
          `  ${prefix}erreur\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const quotedParticipant = ctx.participant || ctx.remoteJid;

      const isFromMe = quotedParticipant.includes(botJid) || msg.key.fromMe;

      if (!isFromMe) {
        return reply(`*⚠️ ${toSmallCaps('ce message ne t\'appartient pas. utilise la commande')} \`${prefix}delete\` ${toSmallCaps('pour les messages des autres')}.*`);
      }

      const deleteTargetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        fromMe: true 
      };

      if (from.endsWith('@g.us')) {
        deleteTargetKey.participant = quotedParticipant;
      }

      const deleteCommandKey = {
        remoteJid: from,
        id: msg.key.id,
        fromMe: true
      };

      await react('🪄'); 

      await sock.sendMessage(from, { delete: deleteTargetKey });
      await sock.sendMessage(from, { delete: deleteCommandKey });

    } catch (error) {
      // Échec silencieux des protocoles
      await reply(`*❌ ${toSmallCaps('impossible de faire disparaitre ce message')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
