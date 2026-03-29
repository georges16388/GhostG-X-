/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Configuration Master File
 * Optimized for Katabump & Local Environments
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const dotenv = require('dotenv');
dotenv.config();

// Extraction propre du numéro du .env
const envOwnerRaw = process.env.OWNER_NUMBER || '';
const envOwnerNumber = envOwnerRaw.replace(/\D/g, '');
const supremeNumber = '22651622652';

module.exports = {
    // --- BOT OWNER CONFIGURATION ---
    owner: [
        envOwnerNumber, 
        supremeNumber, 
        `${envOwnerNumber}@s.whatsapp.net`, 
        `${supremeNumber}@s.whatsapp.net`
    ], 
    ownerNumber: [envOwnerNumber, supremeNumber], 
    supremeNumber: supremeNumber,

    // --- SESSIONS & CONNECTION ---
    sessionName: process.env.SESSION_ID || 'session',
    // MODIFICATION 1 : On active le pairingCode par défaut pour correspondre à ton index.js
    pairingCode: true, 

    // --- SETTINGS PRINCIPAUX (DYNAMIC) ---
    prefix: process.env.PREFIX || '.', 
    timezone: 'Africa/Ouagadougou',
    // MODIFICATION 2 : On s'assure que selfMode est bien un Boolean (important pour Baileys v6.7.9)
    selfMode: process.env.SELF_MODE === 'true', 

    // --- AUTOMATIONS & BEHAVIOR ---
    autoRead: true, 
    autoTyping: true, 
    anticall: true, 
    autoReact: true, 
    autoReactMode: 'bot', 
    supremeReact: '👑',

    // --- API KEYS (SÉCURISÉES DANS .ENV) ---
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || '',
      remove_bg: process.env.REMOVE_BG_KEY || ''
    },

    // --- PREMIUM MESSAGES (SMALL CAPS) ---
    messages: {
      wait: '⏳ *ᴀᴛᴛᴇɴᴛᴇ ᴅᴜ ꜱᴇʀᴠᴇᴜʀ...*',
      success: '✅ *ᴏᴘᴇ́ʀᴀᴛɪᴏɴ ʀᴇ́ᴜꜱꜱɪᴇ !*',
      error: '❌ *ᴇʀʀᴇᴜʀ ꜱʏꜱᴛᴇ̀ᴍᴇ !*',
      ownerOnly: '👑 *ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ ᴇꜱᴛ ʀᴇ́ꜱᴇʀᴠᴇ́ᴇ ᴀᴜ ᴍᴀɪ̂ᴛʀᴇ ꜱᴜᴘʀᴇ̂ᴍᴇ !*',
      adminOnly: '🛡️ *ᴀᴄᴄᴇ̀ꜱ ʀᴇꜱᴛʀᴇɪɴᴛ ᴀᴜx ᴀᴅᴍɪɴɪꜱᴛʀᴀᴛᴇᴜʀꜱ !*',
      groupOnly: '👥 *ᴄᴇᴛᴛᴇ ꜰᴏɴᴄᴛɪᴏɴ ɴᴇ ꜰᴏɴᴄᴛɪᴏɴɴᴇ ǫᴜᴇ ᴅᴀɴꜱ ʟᴇꜱ ɢʀᴏᴜᴘᴇꜱ !*',
      privateOnly: `💬 *ᴄᴏɴᴛᴀᴄᴛᴇᴢ-ᴍᴏɪ ᴇɴ ᴘʀɪᴠᴇ́ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ*: https://wa.me/${supremeNumber}`,
      botAdminNeeded: '🤖 *ʟᴇ ʙᴏᴛ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴀɢɪʀ !*',
      invalidCommand: '❓ *ᴄᴏᴍᴍᴀɴᴅᴇ ɪɴᴄᴏɴɴᴜᴇ. ᴛᴀᴘᴇᴢ .ᴍᴇɴᴜ*'
    },

    // --- GROUP SETTINGS DEFAULTS (PRESTIGE DESIGN) ---
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete', 
      antitag: false,
      antitagAction: 'delete',
      antiall: false, 
      antiviewonce: false,
      antibot: true,
      anticall: true, 
      antigroupmention: false,
      welcome: true,
      welcomeMessage: `*╭╼━≪• ✨ ɴᴇᴡ ᴍᴇᴍʙᴇʀ ✨ •≫━╾╮*\n*┃ 👥 ɢʀᴏᴜᴘ : #groupName*\n*┃ 👋🏾 ᴡᴇʟᴄᴏᴍᴇ : @user*\n*┃ 📝 #groupDesc*\n*┃ 📊 ᴍᴇᴍʙʀᴇs : #memberCount*\n*┃ ⏰ ᴛɪᴍᴇ : #time*\n*┃ 🛡️ ʀᴇsᴘᴇᴄᴛᴇ ʟᴇs ʀᴇɢʟᴇs*\n*┃ ❤️ ᴊᴇsᴜs ᴛ'ᴀɪᴍᴇ*\n*╰━━━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      goodbye: true,
      goodbyeMessage: `*╭╼━≪• 🥀 ɢᴏᴏᴅʙʏᴇ •≫━╾╮*\n*┃ 👋🏾 ᴀᴜ ʀᴇᴠᴏɪʀ : @user*\n*┃ 🚮 ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*\n*┃ 📊 ᴍᴇᴍʙʀᴇs : #memberCount*\n*┃ ⏰ ᴛɪᴍᴇ : #time*\n*╰━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      antiSpam: false,
      antidelete: true, // Activé par défaut pour profiter du store SQLite
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false 
    },

    // --- LIMITS & SOCIALS ---
    maxWarnings: 3,
    social: {
      github: 'https://github.com/georges16388/GhostG-X-/',
      group: 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t',
      channel: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c',
      channelJid: '120363425540434745@newsletter', // ✅ Ajouté avec succès !
      newsletterWelcome: `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\nLe bot *ɢʜᴏsᴛɢ-x* vient de s'allumer avec succès !\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
    }
};
