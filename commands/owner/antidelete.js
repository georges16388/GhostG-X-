/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Anti-Delete Private Logger (Groups & Private)
 * Mode: Private Alert - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

module.exports = {
    name: 'antidelete',
    aliases: ['ad', 'antisupr'],
    category: 'owner',
    desc: 'Active ou désactive la récupération des messages supprimés et envoie un rapport en privé.',
    ownerOnly: true,

    async execute(sock, msg, args, { from, reply, toSmallCaps, sender, pushName, getMessage, mediaType }) {
        try {
            // --- Récupérer / basculer l'état selon le chat ---
            const chatSettings = database.getGroupSettings(from) || {};
            const currentState = chatSettings.antidelete || false;
            const newState = !currentState;
            database.updateGroupSettings(from, { antidelete: newState });

            const statusEmoji = newState ? '✅' : '❌';
            const statusText = newState ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ';

            const caption = `*╭╼━≪• ${toSmallCaps('ꜱᴇᴄᴜʀɪᴛᴇ ɢʜᴏꜱᴛɢ')} •≫━╾╮*\n` +
                `*┃* 🛡️ *${toSmallCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ')}* : *${toSmallCaps(statusText)}* ${statusEmoji}\n` +
                `*┃* 📝 *${toSmallCaps('ᴇᴛᴀᴛ')}* : *${toSmallCaps('ᴍɪs ᴀ ᴊᴏᴜʀ')}*\n` +
                `*╰━━━━━━━━━━━━━━━╼*`;

            await reply(caption);

            // --- Préparer le rapport privé ---
            const deletedMsg = getMessage(msg.key.id) || {};
            const chatType = from.endsWith('@g.us') ? 'Groupe' : 'Privé';
            const deleter = msg.key.participant || sender || 'ᴜɴᴋɴᴏᴡɴ';
            const mediaContent = mediaType ? `[${mediaType.toUpperCase()} ATTACHED]` : deletedMsg.text || '—';

            const privateReport = `*╭╼━≪• ${toSmallCaps('🚨 ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ 🚨')} •≫━╾╮*\n` +
                `*┃* 𝙲𝙷𝙰𝚃 : *${toSmallCaps(from)}* (${chatType})\n` +
                `*┃* 𝚂𝙴𝙽𝚃 𝙱𝚈 : *@${sender.split('@')[0]}*\n` +
                `*┃* 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈 : *@${deleter.split('@')[0]}*\n` +
                `*┃* 𝚃𝙸𝙼𝙴 𝚂𝙴𝙽𝚃 : *${toSmallCaps(new Date(msg.messageTimestamp * 1000).toLocaleTimeString())}*\n` +
                `*┃* 𝙳𝙰𝚃𝙴 𝚂𝙴𝙽𝚃 : *${toSmallCaps(new Date(msg.messageTimestamp * 1000).toLocaleDateString())}*\n` +
                `*┃* 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 : ${toSmallCaps(mediaContent)}\n` +
                `*╰━━━━━━━━━━━━━━━╼*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            // --- Envoi en privé au propriétaire ---
            const ownerJid = 'TON_JID@c.us'; // Remplace par ton JID
            await sock.sendMessage(ownerJid, { text: privateReport, mentions: [sender, deleter].filter(Boolean) });

            // --- Copier le média si présent ---
            if (deletedMsg.message?.imageMessage || deletedMsg.message?.videoMessage || deletedMsg.message?.stickerMessage || deletedMsg.message?.audioMessage) {
                await sock.copyNForward(ownerJid, deletedMsg, true);
            }

        } catch (err) {
            console.error('AntiDelete Cmd Error:', err);
            reply(`❌ *${toSmallCaps("ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ.")}*`);
        }
    }
};