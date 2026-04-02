/**
 * ResetWarn Command - Reset warnings for a user
 * GhostG-X Edition
 */

const database = require('../../database');
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
  name: 'resetwarn',
  aliases: ['resetwarning', 'clearwarn', 'unwarn', 'pardonner', 'absoudre'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇғғᴀᴄᴇ ᴛᴏᴜs ʟᴇs ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛs ᴅ\'ᴜɴ ᴍᴇᴍʙʀᴇ',
  usage: `${prefix}resetwarn @user`, // 💡 Dynamique avec ton préfixe actuel
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ SÉCURITÉ : Vérification via le config.js uniquement
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner;

      // Si l'utilisateur n'est pas admin et n'est pas listé comme Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return reply(`*❌ ${toSmallCaps('veuillez mentionner ou repondre a l individu a absoudre')} !*\n\n*ᴇxᴇᴍᴘʟᴇ :* \`${prefix}promote @user\`\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Get current warnings before clearing
      const currentWarnings = database.getWarnings(extra.from, target);

      if (currentWarnings.count === 0) {
        return reply(`*✅ @${target.split('@')[0]} ${toSmallCaps('na aucun avertissement a effacer')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`, { mentions: [target] });
      }

      // Clear all warnings
      database.clearWarnings(extra.from, target);

      const text = `*╭╼━━━≪• ᴀʙsᴏʟᴜᴛɪᴏɴ •≫━━━╾╮*\n` +
                   `*┃* 👤 *${toSmallCaps('individu')} :* @${target.split('@')[0]}\n` +
                   `*┃* ⚠️ *${toSmallCaps('avertissements effaces')} :* ${currentWarnings.count}\n\n` +
                   `*┃* *${toSmallCaps('toutes les sentences ont ete levees pour cet individu')}.*\n\n` +
                   `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await sock.sendMessage(extra.from, {
        text,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('ResetWarn command error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
