/**
 * Group Stats Command - GhostG-X MD
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { getStats } = require('../../utils/groupstats');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
    name: 'groupstats',
    aliases: ['stats', 'leaderboard', 'gstats', 'top', 'msgs'],
    category: 'general',
    description: 'Affiche les statistiques d\'activité du groupe.',
    usage: '.groupstats',
    groupOnly: true,

    async execute(sock, msg, args, { from, react }) {
        try {
            // Vérification de l'existence de la fonction stats
            let stats;
            try {
                stats = getStats(from);
            } catch (e) {
                console.error("Stats File Error:", e);
                return sock.sendMessage(from, { 
                    text: `*╭╼━≪• ${toStyledCaps('sʏsᴛᴇᴍ ᴇʀʀᴏʀ')} •≫━╾╮*\n*┃*\n*┃* ❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ')} :* *${toStyledCaps('ʙᴀsᴇ ᴅᴇ ᴅᴏɴɴᴇᴇs ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ')}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*` 
                });
            }

            if (!stats || stats.total === 0) {
                return sock.sendMessage(from, { text: `📊 *${toStyledCaps("ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ")}*` });
            }

            await react('📊');

            const { total, users } = stats;
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // --- CONSTRUCTION DU DESIGN AGM ---
            let text = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ɢʀᴏᴜᴘ sᴛᴀᴛs')} •≫━╾╮*\n`;
            text += `*┃*\n`;
            text += `*┃* 📌 *${toStyledCaps('ᴛᴏᴛᴀʟ ᴍsɢs')} :* *${total}*\n`;
            text += `*┃* 📅 *${toStyledCaps('ᴘᴇʀɪᴏᴅᴇ')} :* *${toStyledCaps('ᴀᴜᴊᴏᴜʀᴅʜᴜɪ')}*\n`;
            text += `*┃* 👥 *${toStyledCaps('ᴍᴇᴍʙʀᴇs ᴀᴄᴛɪғs')} :* *${Object.keys(users).length}*\n`;
            text += `*┃*\n`;
            text += `*┃* 🏆 *${toStyledCaps('ᴛᴏᴘ 𝟓 ᴅᴇs ᴅᴏᴍɪɴᴀɴᴛs')} :*\n`;

            sortedUsers.forEach(([id, count], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                text += `*┃* ${medal} @${id.split('@')[0]} : *${count}* ${toStyledCaps('ᴍsɢs')}\n`;
            });

            text += `*┃*\n`;
            text += `*╰━━━━━━━━━━━━━━━╯*\n`;
            text += `> *${toStyledCaps('ᴜᴛɪʟɪsᴇᴢ')} .ᴍʏᴀᴄᴛɪᴠɪᴛʏ ${toStyledCaps('ᴘᴏᴜʀ ᴠᴏs sᴛᴀᴛs')}*\n`;
            text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

            await sock.sendMessage(from, {
                text: text,
                mentions: sortedUsers.map(u => u[0]),
                contextInfo: {
                    externalAdReply: {
                        title: toStyledCaps("ɢʜᴏꜱᴛɢ-x ᴀᴄᴛɪᴠɪᴛʏ ᴛʀᴀᴄᴋᴇʀ"),
                        body: `${toStyledCaps("ᴛᴏᴛᴀʟ ᴍᴇssᴀɢᴇs")} : ${total}`,
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                        showAdAttribution: false
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error('[GROUPSTATS GLOBAL ERROR]:', err);
        }
    }
};
