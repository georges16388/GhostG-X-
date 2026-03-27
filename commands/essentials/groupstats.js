/**
 * Group Stats Command - GhostG-X MD
 * Style requested by User (Ghost Prestige)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { getStats } = require('../../utils/groupstats');

module.exports = {
    name: 'groupstats',
    aliases: ['stats', 'leaderboard', 'gstats', 'top', 'msgs'],
    category: 'general',
    description: 'Affiche les statistiques d\'activité du groupe (Top 5).',
    usage: '.groupstats',
    groupOnly: true,

    async execute(sock, msg, args, { from, reply, react }) {
        try {
            const stats = getStats(from);

            if (!stats || stats.total === 0) {
                return reply('📊 *Aucune activité enregistrée pour le moment.*');
            }

            await react('📊');

            const { total, users } = stats;

            // Tri des membres par nombre de messages (Top 5)
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // --- CONSTRUCTION DU DESIGN GHOST ---
            let text = `╭╼━≪• *ɢʜᴏsᴛ ɢʀᴏᴜᴘ sᴛᴀᴛs* •≫━╾╮\n`;
            text += `┃ 📌 *ᴛᴏᴛᴀʟ ᴍsɢs :* ${total}\n`;
            text += `┃ 📅 *ᴘᴇʀɪᴏᴅᴇ :* Aujourd'hui\n`;
            text += `┃ 👥 *ᴍᴇᴍʙʀᴇs ᴀᴄᴛɪғs :* ${Object.keys(users).length}\n\n`;

            text += `┃ 🏆 *ᴛᴏᴘ 5 ᴅᴇs ᴅᴏᴍɪɴᴀɴᴛs :*\n`;
            
            sortedUsers.forEach(([id, count], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                text += `┃ ${medal} @${id.split('@')[0]} : *${count}* msgs\n`;
            });

            text += `╰━━━━━━━━━━━━━━━╯\n`;
            text += `> Utilisez *.myactivity* pour vos stats.\n`;
            text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

            // Envoi avec mentions des leaders
            await sock.sendMessage(from, {
                text: text,
                mentions: sortedUsers.map(u => u[0]),
                contextInfo: {
                    externalAdReply: {
                        title: "ɢʜᴏꜱᴛɢ-x ᴀᴄᴛɪᴠɪᴛʏ ᴛʀᴀᴄᴋᴇʀ",
                        body: `Total messages du jour : ${total}`,
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                        sourceUrl: "https://github.com/georges16388/GhostG-X-"
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error('[GROUPSTATS ERROR]:', err);
            reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇs sᴛᴀᴛs.*');
        }
    }
};
