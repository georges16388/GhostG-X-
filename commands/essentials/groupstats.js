/**
 * Group Stats Command - Monitor Daily Activity
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const { getStats } = require('../../utils/groupstats');

const STATS_DESIGN = (total, topText) => `╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮
┃ 📊 sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴅᴜ ᴊᴏᴜʀ
┃ 📌 ᴛᴏᴛᴀʟ ᴍᴇssᴀɢᴇs : ${total}
┃ 👥 ᴛᴏᴘ ᴍᴇᴍʙʀᴇs ᴀᴄᴛɪғs :
${topText}
┃ 💡 ᴛᴀᴘᴇ .ᴍʏᴀᴄᴛɪᴠɪᴛʏ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
    name: 'groupstats',
    aliases: ['stats', 'leaderboard', 'gstats', 'topmembers', 'msgs'],
    category: 'essentials',
    description: 'Affiche les statistiques d\'activité du groupe aujourd\'hui.',
    usage: '.groupstats',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        // Sécurité : on récupère le JID directement depuis le message
        const from = msg.key.remoteJid;

        try {
            // Réaction d'analyse
            await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

            // On récupère les stats via l'utilitaire
            const stats = getStats(from);

            // Vérification stricte des données reçues
            if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
                return sock.sendMessage(from, { 
                    text: '╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮\n┃ ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ\n┃ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ. 🌌\n╰━━━━━━━━━━━━━━━╯' 
                }, { quoted: msg });
            }

            const total = stats.total || 0;
            const users = stats.users;

            // Tri des membres par messages (Top 5)
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Formatage avec médailles
            const medals = ['🥇', '🥈', '🥉', '👤', '👤'];
            let topText = sortedUsers.map(([id, count], i) => {
                return `┃ ${medals[i]} @${id.split('@')[0]} : *${count}* ᴍsɢs`;
            }).join('\n');

            // Envoi du classement avec mentions
            await sock.sendMessage(from, {
                text: STATS_DESIGN(total, topText),
                mentions: sortedUsers.map(u => u[0])
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        } catch (err) {
            console.error('[groupstats cmd] error:', err);
            // Fallback si extra.reply n'existe pas
            await sock.sendMessage(from, { text: '❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ* : Impossible de charger les stats.' }, { quoted: msg });
        }
    }
};
