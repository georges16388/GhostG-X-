/**
 * ApproveAll Command - Approve all pending join requests
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
  name: 'approveall',
  aliases: ['acceptall', 'approuvertout', 'ᴀᴘᴘʀᴏᴠᴇᴀʟʟ'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴘᴘʀᴏᴜᴠᴇ ᴛᴏᴜᴛᴇs ʟᴇs ᴅᴇᴍᴀɴᴅᴇs ᴅ\'ᴀᴅʜᴇ́sɪᴏɴ ᴇɴ ᴀᴛᴛᴇɴᴛᴇ**',
  usage: `${prefix}approveall`,
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
        const isAdmins = extra.isAdmins || false; 
        if (!isAdmins) {
          return reply(`*❌ ${toSmallCaps('cette commande est reservee aux administrateurs du sanctuaire')} !*`);
        }
      }

      const chatId = msg.key.remoteJid;

      await reply('*☬ ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ʀᴇᴄʜᴇʀᴄʜᴇ ᴅᴇs ᴀ̂ᴍᴇs ᴇɴ ᴀᴛᴛᴇɴᴛᴇ...*');

      // Récupération des requêtes en attente
      const pendingList = await sock.groupRequestParticipantsList(chatId);

      if (!pendingList || pendingList.length === 0) {
        return reply(`❌ *${toSmallCaps('aucune demande d adhesion en attente dans le sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const totalRequests = pendingList.length;

      // On extrait tous les JID de la liste d'attente
      const jidsToApprove = pendingList.map(request => request.jid);

      // Approbation en masse d'un seul coup
      await sock.groupRequestParticipantsUpdate(chatId, jidsToApprove, 'approve');

      // Succès
      await sock.sendMessage(chatId, {
        text: `📈 *${totalRequests} ᴀ̂ᴍᴇs ᴏɴᴛ ᴇ́ᴛᴇ́ ᴀᴘᴘʀᴏᴜᴠᴇ́ᴇs ᴇᴛ ɪɴᴛᴇ́ɢʀᴇ́ᴇs ᴀᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      }, { quoted: msg });

    } catch (error) {
      await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
