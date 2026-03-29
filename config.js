'use strict';

/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Configuration Master File
 * Optimized for Katabump & Local Environments
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const dotenv = require('dotenv');
dotenv.config();

// ============================================================
// NUMÉROS PROPRIÉTAIRES
// ============================================================

// FIX 1 : si OWNER_NUMBER est vide, on évite d'avoir '' dans les tableaux
// ce qui faisait que normalizeJid('') === '' et matchait n'importe quoi
const envOwnerRaw    = (process.env.OWNER_NUMBER || '').replace(/\D/g, '');
const supremeNumber  = '22651622652';

// Liste propre sans doublons ni valeurs vides
const ownerNumbers = [...new Set(
    [envOwnerRaw, supremeNumber].filter(n => n && n.length >= 7)
)];

// ============================================================
// SESSION ID (Katabump / Render / Railway)
// ============================================================

// FIX 2 : SESSION_ID peut être dans l'env sous ce nom-là,
// mais index.js lit config.sessionID (pas sessionName).
// On expose les deux pour être compatible avec les deux lectures.
const sessionID   = process.env.SESSION_ID   || '';
const sessionName = process.env.SESSION_NAME || 'session';

// ============================================================
// EXPORT
// ============================================================
module.exports = {

    // --- BOT OWNER CONFIGURATION ---
    // FIX 3 : owner[] ne doit PAS contenir les JIDs complets (@s.whatsapp.net)
    // car isOwner() et isSupreme() dans index.js et handler.js travaillent
    // uniquement avec les numéros bruts (normalizeJid strip le @...).
    // Avoir les JIDs ici créait des faux-positifs de matching.
    owner:         ownerNumbers,
    ownerNumber:   ownerNumbers,
    supremeNumber: supremeNumber,

    // --- SESSIONS & CONNECTION ---
    sessionName,                         // lu par useMultiFileAuthState dans index.js
    sessionID,                           // lu par le bloc d'injection zlib dans index.js
    pairingCode: true,

    // --- SETTINGS PRINCIPAUX ---
    prefix:   process.env.PREFIX     || '.',
    timezone: 'Africa/Ouagadougou',

    // FIX 4 : selfMode est déjà un Boolean grâce à === 'true'.
    // On ajoute un fallback à false explicite pour éviter undefined.
    selfMode: process.env.SELF_MODE === 'true' || false,

    // --- AUTOMATIONS & BEHAVIOR ---
    autoRead:      true,
    autoTyping:    true,
    anticall:      true,
    autoReact:     true,
    autoReactMode: 'bot',
    supremeReact:  '👑',

    // --- API KEYS (sécurisées dans .env) ---
    apiKeys: {
        openai:    process.env.OPENAI_API_KEY || '',
        remove_bg: process.env.REMOVE_BG_KEY  || ''
    },

    // --- MESSAGES SYSTÈME (small caps) ---
    messages: {
        wait:           '⏳ *ᴀᴛᴛᴇɴᴛᴇ ᴅᴜ ꜱᴇʀᴠᴇᴜʀ...*',
        success:        '✅ *ᴏᴘᴇ́ʀᴀᴛɪᴏɴ ʀᴇ́ᴜꜱꜱɪᴇ !*',
        error:          '❌ *ᴇʀʀᴇᴜʀ ꜱʏꜱᴛᴇ̀ᴍᴇ !*',
        ownerOnly:      '👑 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇꜱᴛ ʀᴇ́ꜱᴇʀᴠᴇ́ᴇ ᴀᴜ ᴍᴀɪ̂ᴛʀᴇ ꜱᴜᴘʀᴇ̂ᴍᴇ !*',
        adminOnly:      '🛡️ *ᴀᴄᴄᴇ̀ꜱ ʀᴇꜱᴛʀᴇɪɴᴛ ᴀᴜx ᴀᴅᴍɪɴɪꜱᴛʀᴀᴛᴇᴜʀꜱ !*',
        groupOnly:      '👥 *ᴄᴇᴛᴛᴇ ꜰᴏɴᴄᴛɪᴏɴ ɴᴇ ꜰᴏɴᴄᴛɪᴏɴɴᴇ ǫᴜᴇ ᴅᴀɴꜱ ʟᴇꜱ ɢʀᴏᴜᴘᴇꜱ !*',
        privateOnly:    `💬 *ᴄᴏɴᴛᴀᴄᴛᴇᴢ-ᴍᴏɪ ᴇɴ ᴘʀɪᴠᴇ́ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ*: https://wa.me/${supremeNumber}`,
        botAdminNeeded: '🤖 *ʟᴇ ʙᴏᴛ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴀɢɪʀ !*',
        invalidCommand: '❓ *ᴄᴏᴍᴍᴀɴᴅᴇ ɪɴᴄᴏɴɴᴜᴇ. ᴛᴀᴘᴇᴢ .ᴍᴇɴᴜ*'
    },

    // --- GROUP SETTINGS DEFAULTS ---
    defaultGroupSettings: {
        antilink:          false,
        antilinkAction:    'delete',
        antitag:           false,
        antitagAction:     'delete',
        antiall:           false,
        antiviewonce:      false,
        antibot:           true,
        anticall:          true,
        antigroupmention:  false,
        welcome:           true,
        welcomeMessage:
            `*╭╼━≪• ✨ ɴᴇᴡ ᴍᴇᴍʙᴇʀ ✨ •≫━╾╮*\n` +
            `*┃ 👥 ɢʀᴏᴜᴘ : #groupName*\n` +
            `*┃ 👋🏾 ᴡᴇʟᴄᴏᴍᴇ : @user*\n` +
            `*┃ 📝 #groupDesc*\n` +
            `*┃ 📊 ᴍᴇᴍʙʀᴇs : #memberCount*\n` +
            `*┃ ⏰ ᴛɪᴍᴇ : #time*\n` +
            `*┃ 🛡️ ʀᴇsᴘᴇᴄᴛᴇ ʟᴇs ʀᴇɢʟᴇs*\n` +
            `*┃ ❤️ ᴊᴇsᴜs ᴛ'ᴀɪᴍᴇ*\n` +
            `*╰━━━━━━━━━━━━━━━━━╯*\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        goodbye:           true,
        goodbyeMessage:
            `*╭╼━≪• 🥀 ɢᴏᴏᴅʙʏᴇ •≫━╾╮*\n` +
            `*┃ 👋🏾 ᴀᴜ ʀᴇᴠᴏɪʀ : @user*\n` +
            `*┃ 🚮 ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*\n` +
            `*┃ 📊 ᴍᴇᴍʙʀᴇs : #memberCount*\n` +
            `*┃ ⏰ ᴛɪᴍᴇ : #time*\n` +
            `*╰━━━━━━━━━━━━━━━━━╯*\n` +
            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        antiSpam:          false,
        antidelete:        true,
        nsfw:              false,
        detect:            false,
        chatbot:           false,
        autosticker:       false
    },

    // --- LIMITS & SOCIALS ---
    maxWarnings: 3,

    social: {
        github:           'https://github.com/georges16388/GhostG-X-/',
        // FIX 5 : URL du groupe avec le paramètre mode mal formé (?mode=gi_t).
        // Les liens WhatsApp ne reconnaissent pas ce paramètre — supprimé.
        group:            'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf',
        channel:          'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c',
        channelJid:       '120363425540434745@newsletter',
        channelName:      'ɢʜᴏsᴛɢ-x',
       
    }
};
