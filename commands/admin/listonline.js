/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Admin Command (ListOnline)
 * Mode: Group Only - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

module.exports = {
    name: 'listonline',
    aliases: ['online', 'here'],
    category: 'admin',
    desc: 'Liste les membres en ligne avec noms cliquables.',
    adminOnly: true,
    groupOnly: true,

    async execute(sock, msg, args, { from, reply, groupMetadata, toSmallCaps }) {
        try {
            const participants = groupMetadata.participants;
            let onlineUsers = [];

            await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            for (let participant of participants) {
                const jid = participant.id;
                const presence = global.store.presences[jid];
                if (presence) {
                    const status = Object.values(presence)[0]?.lastKnownPresence;
                    if (status === 'available' || status === 'composing') {
                        onlineUsers.push(jid);
                    }
                }
            }

            if (onlineUsers.length === 0) {
                return reply(`*╭──────────────╮*\n*┃* ⚠️ *${toSmallCaps('ᴀᴜᴄᴜɴ ᴍᴇᴍʙʀᴇ ᴇɴ ʟɪɢɴᴇ')}*\n*╰──────────────╯*`);
            }

            // Design Compact, High-End & Full SmallCaps Bold
            let caption = `*╭╼━≪• ${toSmallCaps('ꜱᴛᴀᴛᴜᴛ ᴘʀᴇꜱᴇɴᴄᴇ')} •≫━╾╮*\n`;
            caption += `*┃* ⚡ *${toSmallCaps('ɢʀᴏᴜᴘᴇ')}* : *${toSmallCaps(groupMetadata.subject)}*\n`;
            caption += `*┃* 💠 *${toSmallCaps('ᴇɴ ʟɪɢɴᴇ')}* : *[ ${toSmallCaps(onlineUsers.length.toString().padStart(2, '0'))} ]*\n`;
            caption += `*┣━━━━━━━━━━━━━━━╼*\n`;

            onlineUsers.forEach((user, index) => {
                const num = (index + 1).toString().padStart(2, '0');
                
                // Récupération du Pushname depuis le store ou contact
                const contact = global.store.contacts[user] || {};
                const name = contact.notify || contact.name || user.split('@')[0];
                
                // Le @ est suivi du nom en SmallCaps, mais lié au JID pour le clic
                caption += `*┃* *${toSmallCaps(num)}* ➽ *@${toSmallCaps(name)}*\n`;
            });

            caption += `*╰━━━━━━━━━━━━━━━╼*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await sock.sendMessage(from, { 
                text: caption, 
                mentions: onlineUsers 
            }, { quoted: msg });

        } catch (err) {
            console.error('ListOnline Error:', err);
            reply(`❌ *${toSmallCaps("ᴇʀʀᴇᴜʀ ᴅᴇ ʀᴇᴄᴜᴘᴇʀᴀᴛɪᴏɴ.")}*`);
        }
    }
};
