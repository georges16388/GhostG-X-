/**
 * Group Info Command - Display group information
 * GhostG-X Edition
 */

// On importe ton fichier de config à la racine pour le botName si besoin
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
    name: 'sanctuaire',
    // Ajout de 'groupinfo', 'info', 'ginfo' et 'sanctuaire' en texte brut pour assurer la réactivité !
    aliases: ['info', 'ginfo', 'groupinfo'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ʟᴇs ɪɴғᴏʀᴍᴀᴛɪᴏɴs ᴅᴜ ɢʀᴏᴜᴘᴇ ᴇᴛ ᴅᴇ sᴏɴ ᴄʀᴇᴀᴛᴇᴜʀ**',
    usage: `${config.prefix || '.'}sanctuaire`,
    groupOnly: true,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
      const { reply } = extra;

      try {
        const metadata = extra.groupMetadata;

        const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

        // Récupération de l'ID du créateur (Fallback robuste)
        const creatorId = metadata.owner || metadata.id.split('-')[0] + '@s.whatsapp.net';
        const creatorTag = `@${creatorId.split('@')[0]}`;

        let text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                   `┃    🔮 *ɪɴғᴏs sᴀɴᴄᴛᴜᴀɪʀᴇ* ┃\n` +
                   `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                   `🏷️ *ɴᴏᴍ :* ${metadata.subject}\n` +
                   `🆔 *ɪᴅ :* ${metadata.id}\n` +
                   `👤 *ᴘʀᴏᴘʀɪᴇᴛᴀɪʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ :* ${creatorTag}\n` +
                   `👥 *ɪɴᴅɪᴠɪᴅᴜs :* ${metadata.participants.length}\n` +
                   `👑 *ɢᴀʀᴅɪᴇɴs :* ${admins.length}\n` +
                   `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :* ${metadata.desc || toSmallCaps('aucune description')}\n` +
                   `🔒 *ʀᴇsᴛʀɪᴇɴᴛ :* ${metadata.restrict ? 'ᴏᴜɪ' : 'ɴᴏɴ'}\n` +
                   `📢 *ᴀɴɴᴏɴᴄᴇs sᴇᴜʟᴇs :* ${metadata.announce ? 'ᴏᴜɪ' : 'ɴᴏɴ'}\n` +
                   `📅 *ᴄʀᴇᴀᴛɪᴏɴ :* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n\n` +
                   `👑 *ʟɪsᴛᴇ ᴅᴇs ɢᴀʀᴅɪᴇɴs :*\n`;

        admins.forEach((admin, index) => {
          text += `  ${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        text += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

        // Fusion des admins et du créateur dans le tableau des mentions
        const allMentions = admins.map(a => a.id);
        if (!allMentions.includes(creatorId)) {
            allMentions.push(creatorId);
        }

        await sock.sendMessage(extra.from, {
          text,
          mentions: allMentions
        }, { quoted: msg });

      } catch (error) {
        console.error('Sanctuaire command error:', error);
        await reply(`*❌ ${toSmallCaps('erreur')} :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
      }
    }
};
