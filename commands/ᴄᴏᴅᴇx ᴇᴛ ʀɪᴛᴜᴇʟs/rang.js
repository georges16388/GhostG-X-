/**
 * Rang Command - Display user activity statistics
 * GhostG-X Edition
 */

const { getStats } = require('../../utils/groupstats');
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
    name: 'rang',
    // Ajout de 'myactivity', 'mystats', 'mymsgs', 'rank' en texte brut pour assurer la réactivité !
    aliases: ['mystats', 'mymsgs', 'rank', 'myactivity'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ᴠᴏs sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴅ\'ᴀᴄᴛɪᴠɪᴛᴇ ᴅᴜ ᴊᴏᴜʀ**',
    usage: `${config.prefix || '.'}rang`,
    groupOnly: true,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { reply } = extra;
        const from = extra.from;
        const sender = extra.sender;

        try {
            const stats = getStats(from);

            // Si aucune donnée ou aucun message aujourd'hui pour cet utilisateur
            if (!stats || !stats.users || !stats.users[sender]) {
                return reply(`📊 *${toSmallCaps('vous n\'avez encore envoye aucun message aujourd\'hui')} !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
            }

            const userCount = stats.users[sender];
            const totalMessages = stats.total;
            
            // Calcul de la part d'activité en pourcentage
            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // Calcul du rang de l'utilisateur
            const sortedUsers = Object.entries(stats.users)
                .sort((a, b) => b[1] - a[1]);

            const rank = sortedUsers.findIndex(([id]) => id === sender) + 1;

            const text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                         `┃      📊 *ᴠᴏᴛʀᴇ ᴀᴄᴛɪᴠɪᴛᴇ́* ┃\n` +
                         `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                         `👤 *ɪɴᴅɪᴠɪᴅᴜ :* @${sender.split('@')[0]}\n` +
                         `📝 *ᴍᴇssᴀɢᴇs ᴇɴᴠᴏʏᴇ́s :* ${userCount}\n` +
                         `📈 *ᴘᴀʀᴛ ᴅ\'ᴀᴄᴛɪᴠɪᴛᴇ́ :* ${percentage}%\n` +
                         `🏆 *ʀᴀɴɢ :* #${rank} sur ${sortedUsers.length}\n\n` +
                         `*ᴄᴏɴᴛɪɴᴜᴇᴢ ᴀ̀ ᴇ́ᴄʀɪʀᴇ ʟ\'ʜɪsᴛᴏɪʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !* 💬\n\n` +
                         `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: msg });

        } catch (err) {
            console.error('[myactivity cmd] error:', err);
            await reply(`*❌ ${toSmallCaps('erreur lors du chargement de vos statistiques')}.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
        }
    }
};
