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
    // On crée une liste qui contient les deux numéros (env et supreme)
    // On ajoute aussi le format avec @s.whatsapp.net pour certains handlers
    owner: [
        envOwnerNumber, 
        supremeNumber, 
        `${envOwnerNumber}@s.whatsapp.net`, 
        `${supremeNumber}@s.whatsapp.net`
    ], 
    ownerNumber: [envOwnerNumber, supremeNumber], 
    supremeNumber: supremeNumber,
    // ... reste de votre config



    // --- SESSIONS & CONNECTION ---
    sessionName: process.env.SESSION_ID || 'session',
    pairingCode: process.env.PAIRING_CODE === 'true', 

    // --- SETTINGS PRINCIPAUX (DYNAMIC) ---
    prefix: process.env.PREFIX || '.', 
    timezone: 'Africa/Ouagadougou',
    selfMode: process.env.SELF_MODE === 'true' || false, 

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
      welcomeMessage: `*╭╼━≪• ✨ ɴᴇᴡ ᴍᴇᴍʙᴇʀ ✨ •≫━╾╮*\n*┃*\n*┃* 👥 *ɢʀᴏᴜᴘ* : *#groupName*\n*┃* 👋🏾 *ᴡᴇʟᴄᴏᴍᴇ* : *@user*\n*┃*\n*┃* 📝 *#groupDesc*\n*┃*\n*┃* 📊 *ᴍᴇᴍʙʀᴇs* : *#memberCount*\n*┃* ⏰ *ᴛɪᴍᴇ* : *#time*\n*┃*\n*┃* 🛡️ *ʀᴇsᴘᴇᴄᴛᴇ ʟᴇs ʀᴇɢʟᴇs ᴘᴏᴜʀ*\n*┃* *ɴᴇ ᴘᴀs ᴇᴛʀᴇ ʀᴇᴛɪʀᴇ...*\n*┃*\n*┃* ❤️ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      goodbye: true,
      goodbyeMessage: `*╭╼━≪• 🥀 ɢᴏᴏᴅʙʏᴇ ᴍᴇᴍʙᴇʀ •≫━╾╮*\n*┃*\n*┃* 👋🏾 *ᴀᴜ ʀᴇᴠᴏɪʀ* : *@user*\n*┃*\n*┃* 🚪 *ᴍᴀʟʜᴇᴜʀᴇᴜsᴇᴍᴇɴᴛ ᴛᴜ ɴ'ᴀs*\n*┃* *ᴘᴀs ʀᴇsᴘᴇᴄᴛᴇ ʟᴇs ʀᴇɢʟᴇs...* 🙂‍↔️\n*┃*\n*┃* 📊 *ᴍᴇᴍʙʀᴇs* : *#memberCount*\n*┃* ⏰ *ᴛɪᴍᴇ* : *#time*\n*┃*\n*╰━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
      antiSpam: false,
      antidelete: false,
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
      channel: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'
    }
};
