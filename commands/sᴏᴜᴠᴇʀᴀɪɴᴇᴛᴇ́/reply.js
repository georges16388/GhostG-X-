/**
 * Auto-Response Sovereignty Command
 * GhostG-X Edition
 * SÉCURITÉ : Supreme Owner Master Access & Config Owner Only
 */

const database = require('../../database');
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
  name: 'reponseauto',
  aliases: ['autoanswer', 'trigger', 'setreply'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴇ́ғɪɴɪᴛ ᴜɴᴇ ʀᴇ́ᴘᴏɴsᴇ ᴀᴜᴛᴏᴍᴀᴛɪϙᴜᴇ sᴜʀ ᴍᴇɴᴛɪᴏɴ',
  usage: `${prefix}reponseauto <temps_en_secondes> (en répondant au média/texte désiré)`,
  groupOnly: true,
  adminOnly: false, // Géré manuellement ci-dessous pour exclure les admins normaux
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);

      // 🛡️ AUTHENTIFICATION OWNER CONFIG
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isMaster;

      if (!isMe) {
        // Le bot reste muet pour ne pas indiquer l'existence de la commande
        return; 
      }

      // 1. On vérifie si tu as cité un message pour servir de réponse
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      if (!hasQuoted) {
        return reply(`*⚠️ ${toSmallCaps('veuillez citer le message')} (${toSmallCaps('texte')} / ${toSmallCaps('sticker')} / ${toSmallCaps('image')} / ${toSmallCaps('video')} / ${toSmallCaps('audio')}) ${toSmallCaps('qui servira de replique')} !*`);
      }

      // 2. On extrait le délai (temps de réponse)
      const delayInSeconds = parseInt(args[0], 10);
      if (isNaN(delayInSeconds) || delayInSeconds < 0) {
        return reply(`*⚠️ ${toSmallCaps('defini un temps de reponse valide en secondes')} !*`);
      }

      const quotedMessageContent = ctxInfo.quotedMessage;

      // 3. Enregistrement en base de données
      database.updateGroupSettings(chatId, {
        autoReply: {
          active: true,
          delay: delayInSeconds * 1000, 
          replyContent: quotedMessageContent
        }
      });

      // On supprime la commande pour ne pas laisser de traces dans le groupe
      try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}

      // Confirmation discrète en DM
      const cleanMasterJid = `${senderNumber}@s.whatsapp.net`;
      return await sock.sendMessage(cleanMasterJid, { 
        text: `*🎯 L'arcane de réponse auto est armé sur ce groupe !*\n*Temps d'attente :* ${delayInSeconds} seconde(s).` 
      });

    } catch (error) {
      console.error('AutoReply command error:', error);
    }
  }
};
