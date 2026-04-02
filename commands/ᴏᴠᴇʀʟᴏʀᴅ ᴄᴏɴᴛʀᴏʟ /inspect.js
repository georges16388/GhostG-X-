/**
 * Inspect Command - Extract full user database profile (Prefix included)
 * GhostG-X Edition
 * SÉCURITÉ ABSOLUE : Seuls les hashes maîtres peuvent l'évoquer.
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
  aliases: ['inspect', 'whois', 'scan','ins'],
  category: '👑 ᴏᴠᴇʀʟᴏʀᴅ ᴄᴏɴᴛʀᴏʟ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇxᴛʀᴀɪᴛ ʟᴇs ɪɴғᴏʀᴍᴀᴛɪᴏɴs sᴇᴄʀᴇᴛᴇs ᴅ\'ᴜɴᴇ ᴀᴍᴇ',
  usage: '.inspecter <@mention/repondre>',
  groupOnly: true,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      // 🛡️ AUTHENTIFICATION MAÎTRE UNIQUEMENT
      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);
      
      if (!isMaster) return; // On ignore l'appelant pour rester discret

      // Récupération de la cible (soit par mention, soit en répondant à un message)
      let targetJid;
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      
      if (ctxInfo?.quotedMessage) {
        targetJid = ctxInfo.participant;
      } else if (ctxInfo?.mentionedJid && ctxInfo.mentionedJid.length > 0) {
        targetJid = ctxInfo.mentionedJid[0];
      }

      if (!targetJid) {
        return reply(`*⚠️ ${toSmallCaps('veuillez mentionner une cible ou repondre a son message')} !*`);
      }

      const targetNumber = targetJid.replace(/\D/g, '');
      const targetHash = crypto.createHash('sha256').update(targetNumber).digest('hex');

      // On pioche dans ta base de données
      const userSettings = database.getUserSettings ? database.getUserSettings(targetJid) : {};
      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      
      // Détermination du rang
      const isAdmin = groupMetadata.participants.find(p => p.id === targetJid)?.admin !== null;
      const isTargetMaster = config.supremeHashes && config.supremeHashes.includes(targetHash);
      
      let rank = '🔮 ᴍᴇᴍʙʀᴇ';
      if (isTargetMaster) rank = '👑 sᴜᴘʀᴇᴍᴇ ᴏᴡɴᴇʀ';
      else if (isAdmin) rank = '🛡️ ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴇᴜʀ';

      const status = userSettings.isBanned ? '❌ *ʙᴀɴɴɪ*' : '✅ *ᴀᴜᴛᴏʀɪsᴇ́*';
      
      // Récupération du préfixe utilisé par cet utilisateur
      const lastPrefix = userSettings.lastPrefixUsed || 'Aucun (ou inconnu)';

      // On supprime la commande pour ne pas laisser de traces dans le groupe
      try { await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }); } catch {}

      // On envoie le rapport directement en DM à TOI (le Master)
      const cleanMasterJid = `${senderNumber}@s.whatsapp.net`;
      
      const rapport = 
        `*╭╼━━━≪• ʀᴀᴘᴘᴏʀᴛ ᴅ'ɪɴsᴘᴇᴄᴛɪᴏɴ •≫━━━╾╮*\n` +
        `*┃* 👤 *Cible :* @${targetNumber}\n` +
        `*┃* 🆔 *Numéro :* ${targetNumber}\n` +
        `*┃* 🔮 *Rang :* ${rank}\n` +
        `*┃* 📊 *État Global :* ${status}\n` +
        `*┃* ⌨️ *Dernier Préfixe :* \` ${lastPrefix} \`\n` +
        `*┃* 📅 *Commandes exécutées :* ${userSettings.commandCount || 0}\n` +
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
