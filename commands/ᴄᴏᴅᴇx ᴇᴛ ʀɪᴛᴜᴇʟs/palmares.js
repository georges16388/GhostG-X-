const { getStats } = require('../../utils/groupstats');
// On importe ton fichier de config à la racine pour le préfixe
const config = require('../../config.js'); 

module.exports = {
    name: 'ᴘᴀʟᴍᴀʀᴇ̀s',
    // Ajout de 'groupstats', 'stats', 'leaderboard', 'gstats', 'msgs' et 'palmares' en texte brut !
    aliases: ['stats', 'leaderboard', 'gstats', 'topmembers', 'msgs', 'messagestats', 'groupstats', 'palmarès', 'palmares'],
    category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '**ᴀꜰꜰɪᴄʜᴇ ʟᴇꜱ ꜱᴛᴀᴛɪꜱᴛɪQᴜᴇꜱ ᴅᴇ ᴅɪꜱᴄᴜꜱꜱɪᴏɴ ᴅᴜ ɢʀᴏᴜᴘᴇ ᴘᴏᴜʀ ʟᴀ ᴊᴏᴜʀɴᴇ́ᴇ**',
    usage: 'ᴘᴀʟᴍᴀʀᴇ̀s',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        // On récupère le préfixe depuis ton fichier config.js
        const prefix = config.prefix || '.';

        try {
            const from = extra.from;
            const stats = getStats(from);

            // Vérification si des statistiques existent et s'il y a des utilisateurs enregistrés
            if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
                return extra.reply(`📊 *ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ́ ɴ'ᴀ ᴇ́ᴛᴇ́ ᴇɴʀᴇɢɪsᴛʀᴇ́ᴇ ᴀᴜᴊᴏᴜʀᴅ'ʜᴜɪ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }

            const { total, users } = stats;

            // Top 5 des membres les plus actifs
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Correction de la condition pour vérifier si le tableau n'est pas vide
            let topText = sortedUsers.length > 0
                ? sortedUsers.map(([id, count], i) => `  ${i + 1}. @${id.split('@')[0]} — *${count} msgs*`).join('\n')
                : '  ᴀᴜᴄᴜɴ ɪɴᴅɪᴠɪᴅᴜ ᴀᴄᴛɪғ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ.';

            const text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                         `┃     📊 *ᴘᴀʟᴍᴀʀᴇ̀s ᴅᴜ ᴊᴏᴜʀ* ┃\n` +
                         `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                         `📌 *ᴛᴏᴛᴀʟ ᴅᴇs ᴍᴇssᴀɢᴇs :* ${total}\n\n` +
                         `👥 *ʟᴇs sᴄʀɪʙᴇs ʟᴇs ᴘʟᴜs ᴀᴄᴛɪғs :*\n` +
                         `${topText}\n\n` +
                         `*💡 ᴛᴀᴘᴇ \`${prefix}rang\` ᴘᴏᴜʀ ᴠᴏɪʀ ᴠᴏs sᴛᴀᴛɪsᴛɪǫᴜᴇs ᴘᴇʀsᴏɴɴᴇʟʟᴇs.*\n\n` +
                         `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await sock.sendMessage(from, {
                text,
                mentions: sortedUsers.map(u => u[0])
            }, { quoted: msg });

        } catch (err) {
            console.error('[groupstats cmd] error:', err);
            extra.reply(`❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇs sᴛᴀᴛɪsᴛɪǫᴜᴇs.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
    }
};