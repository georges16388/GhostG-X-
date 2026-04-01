/**
 * Unmute ( tous les membres peuvent s'exprimer)
 * GhostG-X Edition
 * 
 */

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
  name: 'ᴘᴀʀᴏʟᴇ',
  aliases: ['open', 'opengroup', 'unmute', 'parole'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴏᴜᴠʀᴇ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ (ᴛᴏᴜs ʟᴇs ᴍᴇᴍʙʀᴇs ᴘᴇᴜᴠᴇɴᴛ ᴘᴀʀʟᴇʀ)**',
  usage: `${prefix}ᴘᴀʀᴏʟᴇ`, // 💡 Dynamique avec ton préfixe actuel
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

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }

      // Baileys commande pour ouvrir le groupe
      await sock.groupSettingUpdate(extra.from, 'not_announcement');

      const text = `🔓 *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀ ᴇ́ᴛᴇ́ ᴏᴜᴠᴇʀᴛ !*\n\n` +
                   `*${toSmallCaps('tous les membres peuvent desormais s\'exprimer')}* \n\n` +
                   `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      await reply(text);

    } catch (error) {
      console.error('Unmute Command Error:', error);
      await reply(`*❌ ${toSmallCaps('l invocation a echoue')} : ${error.message}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
