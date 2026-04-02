/**
 * Ping Command - Check bot response time
 * Nom d'invocation : vitesse
 * GhostG-X Edition
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

module.exports = {
    name: 'vitesse',
    aliases: ['ping', 'p', 'flux', 'latence'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴍᴇsᴜʀᴇ ʟᴀ ᴠɪᴛᴇsssᴇ ᴅᴇ ʀᴇᴀᴄᴛɪᴏɴ ᴅᴇ ʟ\'ᴇɴᴛɪᴛᴇ',
    usage: `${config.prefix || '.'}vitesse`,
    groupOnly: false,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
      const { reply } = extra;
      const chatId = extra.from;

      try {
        const start = Date.now();
        // 1. Incantation du message initial
        const sent = await reply(`*☬ ${toSmallCaps('invocation du flux')}...*`);
        const end = Date.now();

        const responseTime = end - start;
        const timeStr = toSmallCaps(`${responseTime} ms`);

        // 2. Conception visuelle cyber-gothique
        const textDesign = 
            `╭╼━━━≪• *⚡ ᴍᴇsᴜʀᴇ ᴅᴜ ғʟᴜx* •≫━━━╾╮\n` +
            `*┃*\n` +
            `*┃* 📡 *${toSmallCaps('statut')} :* 🟢 ᴏɴʟɪɴᴇ\n` +
            `*┃* ⏳ *${toSmallCaps('latence')} :* ${timeStr}\n` +
            `*┃* 🧩 *${toSmallCaps('flux')} :* ᴀᴄᴛɪғ ᴇᴛ sᴛᴀʙʟᴇ\n` +
            `*┃*\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
            `*_ᴊᴇsᴜs ᴇsᴛ ᴍᴀɪᴛʀᴇ sᴜᴘʀᴇᴍᴇ ♛_*\n` +
            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        // Sécurité pour récupérer proprement la clé du message envoyé pour l'édition
        const messageKey = sent?.key || sent;

        if (messageKey && typeof messageKey === 'object') {
          // 3. Altération et mise à jour du message
          await sock.sendMessage(chatId, {
            text: textDesign,
            edit: messageKey
          });
        } else {
          // Fallback au cas où l'édition plante sur certaines versions de Baileys
          await reply(textDesign);
        }

      } catch (error) {
        console.error('[vitesse cmd] ERROR:', error);
        await reply(`*❌ ${toSmallCaps('l\'analyse du flux a echoue')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    }
};
