/**
 * Group Stats Command - GhostG-X MD
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const groupStats = require('../../utils/groupstats'); // Correction du require pour matcher votre handler

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ' 
    // Retrait des chiffres en indices pour une meilleure lisibilité des stats
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
            let stats;
            try {
                // Utilisation de la méthode appropriée selon votre export
                stats = groupStats.getStats ? groupStats.getStats(from) : groupStats(from);
            } catch (e) {
                console.error("Stats File Error:", e);
                return sock.sendMessage(from, { 
                    text: `*╭╼━≪• ${toStyledCaps('sʏsᴛᴇᴍ ᴇʀʀᴏʀ')} •≫━╾╮*\n*┃*\n*┃* ❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ')} :* *${toStyledCaps('ʙᴀsᴇ ᴅᴇ ᴅᴏɴɴᴇᴇs ɪɴᴛᴇɢʀᴇᴇ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ')}*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*` 
                });
            }

            // Sécurité si les stats n'existent pas ou si le total est à 0
            if (!stats || !stats.users || Object.keys(stats.users).length === 0) {
                return sock.sendMessage(from, { text: `📊 *${toStyledCaps("ᴀᴜᴄᴜɴᴇ ᴀᴄᴛɪᴠɪᴛᴇ ᴇɴʀᴇɢɪsᴛʀᴇᴇ ᴘᴏᴜʀ ʟᴇ ᴍᴏᴍᴇɴᴛ")}*` });
            }

            await react('📊');

            const total = stats.total || 0;
            const users = stats.users;
            
            const sortedUsers = Object.entries(users)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // --- CONSTRUCTION DU DESIGN AGM PRESTIGE ---
            let text = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ɢʀᴏᴜᴘ sᴛᴀᴛs')} •≫━╾╮*\n`;
            text += `*┃*\n`;
            text += `*┃* 📌 *${toStyledCaps('ᴛᴏᴛᴀʟ ᴍsɢs')} :* *${total}*\n`;
            text += `*┃* 📅 *${toStyledCaps('ᴘᴇʀɪᴏᴅᴇ')} :* *${toStyledCaps('ᴀᴜᴊᴏᴜʀᴅʜᴜɪ')}*\n`;
            text += `*┃* 👥 *${toStyledCaps('ᴍᴇᴍʙʀᴇs ᴀᴄᴛɪғs')} :* *${Object.keys(users).length}*\n`;
            text += `*┃*\n`;
            text += `*┃* 🏆 *${toStyledCaps('ᴛᴏᴘ 5 ᴅᴇs ᴅᴏᴍɪɴᴀɴᴛs')} :*\n`; // Chiffre normal pour la lisibilité

            sortedUsers.forEach(([id, count], index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                
                // Sécurité anti division par zéro
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                
                text += `*┃* ${medal} @${id.split('@')[0]} : *${count}* ${toStyledCaps('ᴍsɢs')} *(${percentage}%)*\n`;
            });

            text += `*┃*\n`;
            text += `*╰━━━━━━━━━━━━━━━╯*\n\n`;
            text += `> *${toStyledCaps('ᴜᴛɪʟɪsᴇᴢ')} .ᴍʏᴀᴄᴛɪᴠɪᴛʏ ${toStyledCaps('ᴘᴏᴜʀ ᴠᴏs sᴛᴀᴛs')}*\n`;
            text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

            await sock.sendMessage(from, {
                text: text,
                mentions: sortedUsers.map(u => u[0]),
                contextInfo: {
                    externalAdReply: {
                        title: toStyledCaps("ɢʜᴏꜱᴛɢ-x ᴀᴄᴛɪᴠɪᴛʏ ᴛʀᴀᴄᴋᴇʀ"),
                        body: `${toStyledCaps("ᴀɴᴀʟʏsᴇ ᴅᴇ ʟ'ɪɴғʟᴜᴇɴᴄᴇ ᴅᴜ ɢʀᴏᴜᴘᴇ")}`,
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
