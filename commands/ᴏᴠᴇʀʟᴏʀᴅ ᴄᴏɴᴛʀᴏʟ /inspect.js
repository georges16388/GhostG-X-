/**
 * Inspect Command - Extract full user database profile (Prefix included)
 * GhostG-X Edition
 * SÉCURITÉ ABSOLUE : Seuls les hashes maîtres peuvent l'évoquer.
 * AMÉLIORATION : Classement dynamique par utilisation & Multisorties (PV/Numéro)
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

module.exports = {
  name: 'inspecter',
  aliases: ['inspect', 'whois', 'scan', 'ins'],
  category: '♕ ᴏᴠᴇʀʟᴏʀᴅ ᴄᴏɴᴛʀᴏʟ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇxᴛʀᴀɪᴛ ʟᴇs ɪɴғᴏʀᴍᴀᴛɪᴏɴs sᴇᴄʀᴇᴛᴇs ᴅ\'ᴜɴᴇ ᴀᴍᴇ',
  usage: '.inspecter <@mention / repondre / numero>',
  groupOnly: false, 
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      // 🛡️ AUTHENTIFICATION MAÎTRE UNIQUEMENT
      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);
      if (!isMaster) return; 

      let targetJid;
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      
      // 1. Détection par réponse à un message
      if (ctxInfo?.quotedMessage) {
        targetJid = ctxInfo.participant;
      } 
      // 2. Détection par mention (@)
      else if (ctxInfo?.mentionedJid && ctxInfo.mentionedJid.length > 0) {
        targetJid = ctxInfo.mentionedJid[0];
      } 
      // 3. Détection par numéro brut fourni en argument
      else if (args[0]) {
        const cleanNumber = args[0].replace(/\D/g, '');
        if (cleanNumber.length >= 8) {
          targetJid = `${cleanNumber}@s.whatsapp.net`;
        }
      }

      if (!targetJid) {
        return reply(`*⚠️ ${toSmallCaps('veuillez mentionner une cible, repondre a un message ou fournir un numero')} !*`);
      }

      const targetNumber = targetJid.replace(/\D/g, '');
      const targetHash = crypto.createHash('sha256').update(targetNumber).digest('hex');

      // Extraction des données de la cible
      const userSettings = database.getUserSettings ? database.getUserSettings(targetJid) : {};
      const targetCount = userSettings.commandCount || 0;

      // 📊 CALCUL DU RANG ET CLASSEMENT PAR UTILISATION
      // On récupère TOUS les utilisateurs enregistrés dans la DB pour faire le classement
      const allUsers = database.getAllUsers ? database.getAllUsers() : []; 
      
      // On les trie du plus grand utilisateur au plus petit
      const sortedUsers = allUsers.sort((a, b) => (b.commandCount || 0) - (a.commandCount || 0));
      
      // On trouve la position de notre cible
      const rankPosition = sortedUsers.findIndex(u => u.jid === targetJid) + 1;
      const totalUsers = sortedUsers.length;

      // Détermination du titre honorifique basé sur l'activité pure
      let activityRank = '🔮 ᴍᴇᴍʙʀᴇ ɴᴇ́ᴏᴘʜʏᴛᴇ';
      
      const isTargetMaster = config.supremeHashes && config.supremeHashes.includes(targetHash);
      
      if (isTargetMaster) {
        activityRank = '👑 sᴜᴘʀᴇᴍᴇ ᴏᴡɴᴇʀ';
      } else if (targetCount > 500 || rankPosition === 1) {
        activityRank = '💎 ᴀʀᴄʜɪᴍᴀɢᴇ sᴜᴘʀᴇ̂ᴍᴇ';
      } else if (targetCount > 200 || (rankPosition / totalUsers) <= 0.1) {
        activityRank = '🪖 ᴇ́ʟɪᴛᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ';
      } else if (targetCount > 50 || (rankPosition / totalUsers) <= 0.3) {
        activityRank = '🗡️ ɢᴜᴇʀʀɪᴇʀ ᴀᴄᴛɪғ';
      }

      const status = userSettings.isBanned ? '❌ *ʙᴀɴɴɪ*' : '✅ *ᴀᴜᴛᴏʀɪsᴇ́*';
      const lastPrefix = userSettings.lastPrefixUsed || 'Aucun (ou inconnu)';

      // On supprime la commande pour ne pas laisser de traces (seulement si on est dans un groupe)
      if (isGroup) {
        try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
      }

      // On t'envoie le rapport d'espionnage directement en DM
      const cleanMasterJid = `${senderNumber}@s.whatsapp.net`;
      
      const rapport = 
        `*╭╼━━━≪• ʀᴀᴘᴘᴏʀᴛ ᴅ'ɪɴsᴘᴇᴄᴛɪᴏɴ •≫━━━╾╮*\n` +
        `*┃* 👤 *Cible :* @${targetNumber}\n` +
        `*┃* 🆔 *Numéro :* ${targetNumber}\n` +
        `*┃* 🏆 *Position :* #${rankPosition} / ${totalUsers} utilisateurs\n` +
        `*┃* 🔮 *Titre :* ${activityRank}\n` +
        `*┃* 📊 *État Global :* ${status}\n` +
        `*┃* ⌨️ *Dernier Préfixe :* \` ${lastPrefix} \`\n` +
        `*┃* 📅 *Commandes exécutées :* ${targetCount}\n` +
        `*╰╼━━━━━━━━━━━━━━━━━━━━━━╾╯*`;

      await sock.sendMessage(cleanMasterJid, { 
        text: rapport,
        mentions: [targetJid]
      });

    } catch (error) {
      console.error('Inspect command error:', error);
    }
  }
};
