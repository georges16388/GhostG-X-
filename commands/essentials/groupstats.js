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

    // ... (tes imports et STATS_DESIGN restent identiques)

    async execute(sock, msg, args, extra) {
        const from = msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

            const stats = getStats(from);

            // Vérification si stats existe et contient des utilisateurs
            if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
                const emptyMsg = `╭╼━≪• ɢʜᴏsᴛ sᴛᴀᴛs •≫━╾╮\n┃ ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ\n┃ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ. 🌌\n╰━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;
                return sock.sendMessage(from, { text: emptyMsg }, { quoted: msg });
            }

            const total = stats.total || 0;
            
            // Tri sécurisé : on s'assure que la valeur est un nombre
            const sortedUsers = Object.entries(stats.users)
                .filter(([_, count]) => typeof count === 'number') 
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            const medals = ['🥇', '🥈', '🥉', '👤', '👤'];
            
            // Construction du texte du classement
            let topText = sortedUsers.map(([id, count], i) => {
                const medal = medals[i] || '👤';
                return `┃ ${medal} @${id.split('@')[0]} : *${count}* ᴍsɢs`;
            }).join('\n');

            // Envoi final
            await sock.sendMessage(from, {
                text: STATS_DESIGN(total, topText),
                mentions: sortedUsers.map(u => u[0]), // Important pour le lien bleu
                contextInfo: {
                    externalAdReply: {
                        title: "GHOST ACTIVITY MONITOR",
                        body: "Analyse des messages en temps réel",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg", // Optionnel : ton logo
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        } catch (err) {
            console.error('[groupstats error]:', err);
            await sock.sendMessage(from, { text: '❌ *ᴇʀʀᴇᴜʀ ɪɴᴛᴇʀɴᴇ* : Impossible de générer le rapport.' }, { quoted: msg });
        }
    }

