/**
 * Clean Command - Delete messages in group
 */

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
  name: 'clean',
  aliases: ['purge', 'clear', 'ᴄʟᴇᴀɴ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴜ ɢʀᴏᴜᴘᴇ (ᴛᴏᴜs ᴏᴜ ᴘᴀʀ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ)**',
  usage: `${prefix}clean <nombre>`,
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

      // 🚨 ADAPTATION : Si ce n'est pas TOI, on vérifie s'il est admin
      if (!isMe) {
        const isAdmin = extra.isAdmin || false; 
        if (!isAdmin) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      const count = parseInt(args[0]);
      if (!count || count < 1 || count > 100) {
        return reply(`*❓ ${toSmallCaps('veuillez entrer un nombre valide entre 1 et 100')}.*\n\n${toSmallCaps('exemple')} : \`${prefix}clean 20\`\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const chatId = msg.key.remoteJid;
      const { store } = require('../../index');

      // Vérification si le message est une réponse
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const msgs = store.messages[chatId];
      if (!msgs) {
        return reply(`*❌ ${toSmallCaps('aucun message trouve dans la memoire du bot pour ce groupe')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      let messagesToDelete = [];

      if (quotedMsg && quotedParticipant) {
        // Mode : Supprimer les messages d'un utilisateur spécifique
        messagesToDelete = Object.values(msgs)
          .filter(m => {
            const sender = m.key.participant || m.key.remoteJid;
            return sender === quotedParticipant;
          })
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      } else {
        // Mode : Supprimer les N derniers messages du groupe
        messagesToDelete = Object.values(msgs)
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      }

      if (messagesToDelete.length === 0) {
        return reply(`*❌ ${toSmallCaps('aucun message correspondant n a pu etre trouve pour la suppression')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      await reply(`*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ᴘᴜʀɢᴇ ᴅᴇ ${messagesToDelete.length} ᴍᴇssᴀɢᴇ(s) ᴇɴ ᴄᴏᴜʀs...*`);

      let deleted = 0;
      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(chatId, { delete: m.key });
          deleted++;
          // Petit délai pour éviter les limites de débit WhatsApp
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error('[clean] delete error:', err.message);
        }
      }

      return reply(
        `╭╼━≪• *ᴘᴜʀɢᴇ_ᴅᴜ_sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
        `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
        `┃ *ᴄɪʙʟᴇs* : ${deleted} ᴍᴇssᴀɢᴇ(s)\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴇʟɪᴍɪɴᴇ ʟᴇs ᴛʀᴀᴄᴇs sᴘᴇᴄɪғɪᴇᴇs ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );

    } catch (error) {
      console.error('[clean cmd] error:', error);
      return reply(`❌ *${toSmallCaps('erreur')} :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
