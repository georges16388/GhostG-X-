/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Anti-Delete Switch
 * Mode: Group Settings - Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

const toStyledCaps = (text) => {
    if (!text) return '';
    const fonts = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
        'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
        'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
        'y':'ʏ','z':'ᴢ'
    };
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
    name:      'antidelete',
    aliases:   ['ad', 'antisupr'],
    category:  'owner',
    desc:      'Active ou désactive la détection des messages supprimés dans le groupe.',
    ownerOnly: true,
    groupOnly: true,

    async execute(sock, msg, args, { from, reply }) {
        try {
            const chatSettings = database.getGroupSettings(from) || {};

            // ✅ Cohérent avec le handler :
            // handler fait  → if (groupSettings.antidelete === false) continue;
            // donc true = actif (par défaut si non défini)
            const currentState = chatSettings.antidelete !== false;
            const newState     = !currentState;

            // ✅ Même clé exacte que le handler lit : { antidelete: bool }
            database.updateGroupSettings(from, { antidelete: newState });

            const statusEmoji = newState ? '✅' : '❌';
            const statusText  = newState ? 'ᴀᴄᴛɪᴠᴇ' : 'ᴅᴇsᴀᴄᴛɪᴠᴇ';
            const modeText    = newState
                ? 'ᴍᴇssᴀɢᴇs sᴜᴘᴘʀɪᴍᴇs sᴇʀᴏɴᴛ ʀᴇᴠᴇʟᴇs'
                : 'sᴜʀᴠᴇɪʟʟᴀɴᴄᴇ ᴅᴇsᴀᴄᴛɪᴠᴇᴇ';

            const caption =
                `*╭╼━≪• ${toStyledCaps('sᴇᴄᴜʀɪᴛᴇ ɢʜᴏsᴛɢ')} •≫━╾╮*\n` +
                `*┃*\n` +
                `*┃* 🛡️ *${toStyledCaps('ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ')}* : *${toStyledCaps(statusText)}* ${statusEmoji}\n` +
                `*┃* 📝 *${toStyledCaps('ᴍᴏᴅᴇ')}*        : _${toStyledCaps(modeText)}_\n` +
                `*┃* 🏠 *${toStyledCaps('ɢʀᴏᴜᴘᴇ')}*      : _${toStyledCaps('ᴍɪs ᴀ ᴊᴏᴜʀ')}_ ✔️\n` +
                `*┃*\n` +
                `*╰━━━━━━━━━━━━━━━╯*\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

            await reply(caption);

        } catch (err) {
            console.error('[ANTIDELETE CMD ERROR]:', err);
            await reply(
                `❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ᴅᴇ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ')}*\n` +
                `> ${toStyledCaps('ʀᴇᴇssᴀɪᴇ ᴏᴜ ᴄᴏɴᴛᴀᴄᴛᴇ ʟ\'ᴀᴅᴍɪɴ.')}`
            );
        }
    }
};