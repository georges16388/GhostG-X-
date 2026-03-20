/**
 * MyActivity Command - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { getStats } = require('../../utils/groupstats');

module.exports = {
    name: 'myactivity',
    aliases: ['mystats', 'mymsgs', 'rank'],
    category: 'essentials',
    description: 'Check your activity stats for today',
    usage: '.myactivity',
    groupOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const sender = extra.sender;
            const stats = getStats(from);

            if (!stats || !stats.users || !stats.users[sender]) {
                return extra.reply('📊 ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛé ᴇɴʀᴇɢɪsᴛʀéᴇ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ.');
            }

            const userCount = stats.users[sender];
            const totalMessages = stats.total;
            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // Calculate rank
            const sortedUsers = Object.entries(stats.users)
                .sort((a, b) => b[1] - a[1]);
            
            const rank = sortedUsers.findIndex(([id]) => id === sender) + 1;

            // --- APPLICATION DU DESIGN AGM ---
            const text = `╭╼━≪• ᴀᴄᴛɪᴠɪᴛʏ ʀᴇᴘᴏʀᴛ •≫━╾╮
┃ ᴜsᴇʀ : @${sender.split('@')[0]}
┃ ᴍsɢs : ${userCount} 📝
┃ sʜᴀʀᴇ : ${percentage}% 📈
┃ ʀᴀɴᴋ : #${rank} / ${sortedUsers.length} 🏆
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`.trim();

            await sock.sendMessage(from, {
                text,
                mentions: [sender]
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

        } catch (err) {
            console.error('[myactivity cmd] error:', err);
            extra.reply('❌ ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇs sᴛᴀᴛs.');
        }
    }
};
