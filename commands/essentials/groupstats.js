/**
 * Group Stats Command - Monitor Daily Activity
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const { getStats } = require('../../utils/groupstats');

const STATS_DESIGN = (total, topText) => `╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮
┃ 
┃ 📊 sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴅᴜ ᴊᴏᴜʀ
┃ 📌 ᴛᴏᴛᴀʟ ᴍᴇssᴀɢᴇs : ${total}
┃ 
┃ 👥 ᴛᴏᴘ ᴍᴇᴍʙʀᴇs ᴀᴄᴛɪғs :
${topText}
┃ 
┃ 💡 ᴛᴀᴘᴇ .ᴍʏᴀᴄᴛɪᴠɪᴛʏ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
    name: 'groupstats',
    aliases: ['stats', 'leaderboard', 'gstats', 'topmembers', 'msgs'],
    category: 'essentials', // Catégorie Essentials comme demandé
    description: 'Affiche les statistiques d\'activité du groupe aujourd\'hui.',
    usage: '.groupstats',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const stats = getStats(from);

            // Réaction d'analyse
            await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

            if (!stats || stats.total === 0) {
                return extra.reply('╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮\n┃ ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ\n┃ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ. 🌌\n╰━━━━━━━━━━━━━━━╯');
            }

            const { total, users } = stats;

            // Tri des membres par messages (Top 5)
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Formatage avec médailles
            const medals = ['🥇', '🥈', '🥉', '👤', '👤'];
            let topText = sortedUsers.length
                ? sortedUsers.map(([id, count], i) => `┃ ${medals[i]} @${id.split('@')[0]} : *${count}* ᴍsɢs`).join('\n')
                : '┃ ᴀᴜᴄᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴀᴄᴛɪғ.';

            await sock.sendMessage(from, {
                text: STATS_DESIGN(total, topText),
                mentions: sortedUsers.map(u => u[0])
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        } catch (err) {
            console.error('[groupstats cmd] error:', err);
            extra.reply('❌ Erreur lors du chargement des statistiques.');
        }
    }
};
