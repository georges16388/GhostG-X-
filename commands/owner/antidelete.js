/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Anti-Delete Switch
 * Mode: Group Settings - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

module.exports = {
    name: 'antidelete',
    aliases: ['ad', 'antisupr'],
    category: 'owner',
    desc: 'Active ou désactive la détection des messages supprimés dans le groupe.',
    ownerOnly: true,
    groupOnly: true, // L'anti-delete ne s'applique qu'aux groupes

    async execute(sock, msg, args, { from, reply, toSmallCaps }) {
        try {
            // --- Récupérer / basculer l'état selon le groupe ---
            const chatSettings = database.getGroupSettings(from) || {};
            const currentState = chatSettings.antidelete !== undefined ? chatSettings.antidelete : true; // true par défaut
            const newState = !currentState;
            
            database.updateGroupSettings(from, { antidelete: newState });

            const statusEmoji = newState ? '✅' : '❌';
            const statusText = newState ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ';

            const caption = `*╭╼━≪• ${toSmallCaps('ꜱᴇᴄᴜʀɪᴛᴇ ɢʜᴏꜱᴛɢ')} •≫━╾╮*\n` +
                `*┃* 🛡️ *${toSmallCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ')}* : *${toSmallCaps(statusText)}* ${statusEmoji}\n` +
                `*┃* 📝 *${toSmallCaps('ᴇᴛᴀᴛ')}* : *${toSmallCaps('ᴍɪs ᴀ ᴊᴏᴜʀ')}*\n` +
                `*╰━━━━━━━━━━━━━━━╼*\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await reply(caption);

        } catch (err) {
            console.error('AntiDelete Cmd Error:', err);
            reply(`❌ *${toSmallCaps("ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ.")}*`);
        }
    }
};
