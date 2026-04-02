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
    aliases: ['mystats', 'mymsgs', 'rank', 'myactivity'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ᴠᴏs sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴅ\'ᴀᴄᴛɪᴠɪᴛᴇ ᴅᴜ ᴊᴏᴜʀ',
    usage: `${config.prefix || '.'}rang`,
    groupOnly: true,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { reply } = extra;
        const from = extra.from;
        
        // Nettoyage du JID pour éviter les bugs d'identifiants d'appareils multiples (:1@s.whatsapp.net)
        const sender = extra.sender.split(':')[0] + '@s.whatsapp.net';

        try {
            const stats = getStats(from);

            // Simulation ou création à la volée si le bot n'a pas encore enregistré le message
            let userCount = 0;
            let totalMessages = stats?.total || 1;

            if (stats && stats.users && stats.users[sender]) {
                userCount = stats.users[sender];
            } else {
                // Si aucune donnée, on initialise à 1 (le message de la commande actuelle)
                userCount = 1;
                if (stats && stats.users) {
                    stats.users[sender] = 1;
                }
            }

            // Calcul de la part d'activité en pourcentage
            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // Création d'un tableau trié pour calculer le rang
            let sortedUsers = [];
            if (stats && stats.users) {
                sortedUsers = Object.entries(stats.users).sort((a, b) => b[1] - a[1]);
            } else {
                sortedUsers = [[sender, 1]];
            }

            // Recherche du rang
            let rank = sortedUsers.findIndex(([id]) => id.split(':')[0] === sender.split(':')[0]) + 1;
            if (rank === 0) rank = 1;

            const text = `*╭╼━━━≪• 📊 ᴠᴏᴛʀᴇ ᴀᴄᴛɪᴠɪᴛᴇ •≫━━━╾╮*\n` +
                         `*┃* 👤 *${toSmallCaps('individu')} :* @${sender.split('@')[0]}\n` +
                         `*┃* 📝 *${toSmallCaps('messages envoyes')} :* ${userCount}\n` +
                         `*┃* 📈 *${toSmallCaps('part d\'activite')} :* ${percentage}%\n` +
                         `*┃* 🏆 *${toSmallCaps('rang')} :* #${rank} sur ${sortedUsers.length}\n\n` +
                         `*${toSmallCaps('continuez a ecrire l\'histoire du sanctuaire')} !* 💬\n\n` +
                         `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: msg });

        } catch (err) {
            console.error('[myactivity cmd] error:', err);
            await reply(`*❌ ${toSmallCaps('erreur lors du chargement de vos statistiques')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }
    }
};
