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
        const from = msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

            const stats = getStats(from);

            // Vérification stricte de l'existence des données
            if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
                const emptyMsg = `╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮\n┃ ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ\n┃ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ. 🌌\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;
                return sock.sendMessage(from, { text: emptyMsg }, { quoted: msg });
            }

            // Tri des utilisateurs par nombre de messages
            const sortedUsers = Object.entries(stats.users)
                .filter(([_, count]) => typeof count === 'number' && count > 0) 
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Calcul du total réel (au cas où stats.total est désynchronisé)
            const total = Object.values(stats.users).reduce((a, b) => a + b, 0);

            const medals = ['🥇', '🥈', '🥉', '👤', '👤'];

            // Construction du texte du classement
            let topText = sortedUsers.length > 0 
                ? sortedUsers.map(([id, count], i) => {
                    const medal = medals[i] || '👤';
                    return `┃ ${medal} @${id.split('@')[0]} : *${count}* ᴍsɢs`;
                }).join('\n')
                : "┃ ᴀᴜᴄᴜɴ ᴍᴇᴍʙʀᴇ ᴀᴄᴛɪғ";

            // Envoi final avec les mentions pour le lien bleu
            await sock.sendMessage(from, {
                text: STATS_DESIGN(total, topText),
                mentions: sortedUsers.map(u => u[0]), 
                contextInfo: {
                    externalAdReply: {
                        title: "ɢʜᴏsᴛ ᴀᴄᴛɪᴠɪᴛʏ ᴍᴏɴɪᴛᴏʀ",
                        body: "Analyse des messages en temps réel",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                        renderLargerThumbnail: false,
                        sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c"
                    }
                }
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        } catch (err) {
            console.error('[groupstats error]:', err);
            await sock.sendMessage(from, { text: '❌ *ᴇʀʀᴇᴜʀ ɪɴᴛᴇʀɴᴇ* : Impossible de générer le rapport.' }, { quoted: msg });
        }
    }
};
