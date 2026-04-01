/**
 * Kick Command
 * Remove mentioned or replied users from the group
 * Includes robust self-kick prevention for PN/LID IDs
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
  name: 'kick',
  aliases: ['remove', 'bye', 'k', 'exil', 'ᴋɪᴄᴋ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇxᴘᴜʟsᴇ ʟᴇs ᴍᴇᴍʙʀᴇs ᴍᴇɴᴛɪᴏɴɴᴇ́s ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ**',
  usage: `${prefix}kick @user`,
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
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
      }

      const chatId = msg.key.remoteJid;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      // 🔮 Accumulation des cibles (Multi-Kick)
      let usersToKick = [];

      // 1. On ajoute les personnes mentionnées
      if (mentioned && mentioned.length > 0) {
        usersToKick = [...mentioned];
      }
      
      // 2. On ajoute aussi la personne citée en réponse (si elle n'est pas déjà dans la liste)
      if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        if (!usersToKick.includes(ctx.participant)) {
          usersToKick.push(ctx.participant);
        }
      }

      // Nettoyage des doublons éventuels
      usersToKick = [...new Set(usersToKick)];

      if (usersToKick.length === 0) {
        return reply(
          `╭╼━≪• *ʙᴀɴɴɪssᴇᴍᴇɴᴛ_ᴀʀᴄᴀɴɪǫᴜᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ǫᴜᴇ ᴠᴏᴜs sᴏᴜʜᴀɪᴛᴇᴢ ʙᴀɴɴɪʀ.*\n\n` +
          `  ${prefix}kick @user1 @user2\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      // 🛡️ SÉCURITÉ ROBUSTE ANTI AUTO-KICK
      const botId = sock.user?.id || '';
      const botLid = sock.user?.lid || '';
      const botPhoneNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
      const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
      const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
      const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;

      const metadata = await sock.groupMetadata(chatId);
      const participants = metadata.participants || [];

      const isTryingToKickBot = usersToKick.some((userId) => {
        const userPhoneNumber = userId.includes(':') ? userId.split(':')[0] : (userId.includes('@') ? userId.split('@')[0] : userId);
        const userLidNumeric = userId.includes('@lid') ? userId.split('@')[0].split(':')[0] : '';

        const directMatch = (
          userId === botId ||
          userId === botLid ||
          userId === botIdFormatted ||
          userPhoneNumber === botPhoneNumber ||
          (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
        );

        if (directMatch) return true;

        const participantMatch = participants.some((p) => {
          const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
          const pId = p.id ? p.id.split('@')[0] : '';
          const pLid = p.lid ? p.lid.split('@')[0] : '';
          const pFullId = p.id || '';
          const pFullLid = p.lid || '';
          const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;

          const isThisParticipantBot = (
            pFullId === botId ||
            pFullLid === botLid ||
            pLidNumeric === botLidNumeric ||
            pPhoneNumber === botPhoneNumber ||
            pId === botPhoneNumber ||
            p.phoneNumber === botIdFormatted ||
            (botLid && pLid && botLidWithoutSuffix === pLid)
          );

          if (!isThisParticipantBot) return false;

          return (
            userId === pFullId ||
            userId === pFullLid ||
            userPhoneNumber === pPhoneNumber ||
            userPhoneNumber === pId ||
            userId === p.phoneNumber ||
            (pLid && userLidNumeric && userLidNumeric === pLidNumeric) ||
            (userLidNumeric && pLidNumeric && userLidNumeric === pLidNumeric)
          );
        });

        return participantMatch;
      });

      if (isTryingToKickBot) {
        return reply(`*❌ ${toSmallCaps('l arcane ne peut pas s auto bannir du sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      await reply(`*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ᴇxɪʟ ᴅᴇ ${usersToKick.length} ᴀ̂ᴍᴇ(s) ᴇɴ ᴄᴏᴜʀs...*`);

      // On applique le bannissement en masse
      await sock.groupParticipantsUpdate(chatId, usersToKick, 'remove');

      const usernames = usersToKick.map((jid) => `@${jid.split('@')[0]}`);

      await sock.sendMessage(chatId, {
        text: `╭╼━≪• *ʙᴀɴɴɪssᴇᴍᴇɴᴛ_ᴀʀᴄᴀɴɪǫᴜᴇ* •≫━╾╮\n` +
              `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
              `┃ *ᴄɪʙʟᴇs* : ${usernames.join(', ')}\n` +
              `╰━━━━━━━━━━━━━━━╯\n\n` +
              `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴇxᴘᴜʟsᴇ ʟᴇs ᴀᴍᴇs ɪɴᴅᴇsɪʀᴀʙʟᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: usersToKick
      }, { quoted: msg });

    } catch (error) {
      console.error('Kick command error:', error);
      return reply(`*❌ ${toSmallCaps('echec du bannissement assure toi que je sois bien administrateur du groupe')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
