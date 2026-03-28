/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Anti-Delete Private Logger
 * Mode: Private Alert - Group Settings - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

module.exports = {
    name: 'antidelete',
    aliases: ['ad', 'antisupr'],
    category: 'owner',
    desc: 'Active ou désactive la récupération des messages supprimés et envoie un rapport en privé.',
    ownerOnly: true,
    groupOnly: true,

    async execute(sock, msg, args, { from, reply, toSmallCaps, sender, pushName, getMessage, mediaType }) {
        try {
            const groupSettings = database.getGroupSettings(from) || {};
            const currentState = groupSettings.antidelete || false;
            
            // Toggle l'état
            const newState = !currentState;
            database.updateGroupSettings(from, { antidelete: newState });

            const statusEmoji = newState ? '✅' : '❌';
            const statusText = newState ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ';

            const caption = `*╭╼━≪• ${toSmallCaps('ꜱᴇᴄᴜʀɪᴛᴇ ɢʜᴏꜱᴛɢ')} •≫━╾╮*\n` +
                `*┃* 🛡️ *${toSmallCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ')}* : *${toSmallCaps(statusText)}* ${statusEmoji}\n` +
                `*┃* 📝 *${toSmallCaps('ᴇᴛᴀᴛ')}* : *${toSmallCaps('ᴍɪs ᴀ ᴊᴏᴜʀ')}*\n` +
                `*╰━━━━━━━━━━━━━━━╼*`;

            await reply(caption);

            // Préparer le rapport privé
            const deletedMsg = getMessage(msg.key.id) || {};
            const mediaContent = mediaType ? `[${mediaType.toUpperCase()} ATTACHED]` : deletedMsg.text || '—';

            const privateReport = `*╭╼━≪• ${toSmallCaps('🚨 ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ 🚨')} •≫━╾╮*\n` +
                `*┃* 𝙲𝙷𝙰𝚃 : *${toSmallCaps(from)}*\n` +
                `*┃* 𝚂𝙴𝙽𝚃 𝙱𝚈 : *@${sender.split('@')[0]}*\n` +
                `*┃* 𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃 : *${toSmallCaps(new Date(msg.messageTimestamp * 1000).toLocaleTimeString())}*\n` +
                `*┃* 𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃 : *${toSmallCaps(new Date(msg.messageTimestamp * 1000).toLocaleDateString())}*\n` +
                `*┃* 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈 : *@${msg.key.participant?.split('@')[0] || 'ᴜɴᴋɴᴏᴡɴ'}*\n` +
                `*┃* 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 : ${toSmallCaps(mediaContent)}\n` +
                `*╰━━━━━━━━━━━━━━━╼*\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            // Envoi en privé au propriétaire (ton JID)
            const ownerJid = 'TON_JID@c.us'; // Remplace par ton JID
            await sock.sendMessage(ownerJid, { text: privateReport, mentions: [sender, msg.key.participant].filter(Boolean) });

        } catch (err) {
            console.error('AntiDelete Cmd Error:', err);
            reply(`❌ *${toSmallCaps("ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ.")}*`);
        }
    }
};