

const { getStats } = require('../../utils/groupstats');

module.exports = {
    name: 'ʀᴀɴɢ',
    // Ajout de 'myactivity', 'mystats', 'mymsgs', 'rank' et 'rang' en texte brut !
    aliases: ['mystats', 'mymsgs', 'rank', 'myactivity', 'rang'],
    category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: '**ᴀꜰꜰɪᴄʜᴇ ᴠᴏꜱ ꜱᴛᴀᴛɪꜱᴛɪQᴜᴇꜱ ᴅ\'ᴀᴄᴛɪᴠɪᴛᴇ́ ᴅᴜ ᴊᴏᴜʀ**',
    usage: '.ʀᴀɴɢ',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const sender = extra.sender;
            const stats = getStats(from);

            if (!stats || !stats.users || !stats.users[sender]) {
                return extra.reply(`📊 *ᴠᴏᴜs ɴ'ᴀᴠᴇᴢ ᴇɴᴄᴏʀᴇ ᴇɴᴠᴏʏᴇ́ ᴀᴜᴄᴜɴ ᴍᴇssᴀɢᴇ ᴀᴜᴊᴏᴜʀᴅ'ʜᴜɪ !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
            }

            const userCount = stats.users[sender];
            const totalMessages = stats.total;
            // Utilisation directe du calcul de pourcentage sans LaTeX car l'expression est simple
            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // Calculate rank
            const sortedUsers = Object.entries(stats.users)
                .sort((a, b) => b[1] - a[1]);

            const rank = sortedUsers.findIndex(([id]) => id === sender) + 1;

            const text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                         `┃      📊 *ᴠᴏᴛʀᴇ ᴀᴄᴛɪᴠɪᴛᴇ́* ┃\n` +
                         `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                         `👤 *ɪɴᴅɪᴠɪᴅᴜ :* @${sender.split('@')[0]}\n` +
                         `📝 *ᴍᴇssᴀɢᴇs ᴇɴᴠᴏʏᴇ́s :* ${userCount}\n` +
                         `📈 *ᴘᴀʀᴛ ᴅ'ᴀᴄᴛɪᴠɪᴛᴇ́ :* ${percentage}%\n` +
                         `🏆 *ʀᴀɴɢ :* #${rank} sur ${sortedUsers.length}\n\n` +
                         `*ᴄᴏɴᴛɪɴᴜᴇᴢ ᴀ̀ ᴇ́ᴄʀɪʀᴇ ʟ'ʜɪsᴛᴏɪʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !* 💬\n\n` +
                         `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: msg });

        } catch (err) {
            console.error('[myactivity cmd] error:', err);
            extra.reply(`❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇ ᴠᴏs sᴛᴀᴛɪsᴛɪǫᴜᴇs.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
    }
};
