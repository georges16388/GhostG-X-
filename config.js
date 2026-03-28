const dotenv = require('dotenv');
dotenv.config();

// Extraction propre du numéro depuis le .env ou valeur par défaut
const ownerRaw = process.env.OWNER_NUMBER || '22651622652';
const cleanNumber = ownerRaw.replace(/\D/g, '');

module.exports = {
    // --- BOT OWNER CONFIGURATION (FUSION .ENV) ---
    ownerNumber: [cleanNumber], // Utilisé par le Handler (format tableau)
    OWNER_NUMBER: [cleanNumber], // Doublon de sécurité
    ownerName: 'ɢʜᴏꜱᴛɢ x', 
    supremeNumber: cleanNumber,
    sessionName: process.env.SESSION_ID || 'session', // Nom du dossier session
    pairingCode: process.env.PAIRING_CODE === 'true', // Active le code de jumelage

    // --- SETTINGS PRINCIPAUX ---
    prefix: process.env.PREFIX || '.',
    timezone: 'Africa/Ouagadougou',
    selfMode: process.env.SELF_MODE === 'true' || false, 

    // --- AUTOMATIONS & BEHAVIOR ---
    autoRead: true,
    autoTyping: true,
    anticall: true, 
    autoReact: true, // Activé par défaut
    autoReactMode: 'bot', // 'bot' (réagit aux cmds) ou 'all' (réagit à tout)
    supremeReact: '👑', 

    // --- GROUP SETTINGS DEFAULTS ---
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
      welcomeMessage: `╭╼━≪• *ɴᴇᴡ ᴍᴇᴍʙᴇʀ* •≫━╾╮\n┃ *ᴡᴇʟᴄᴏᴍᴇ* : @user 👋🏾\n┃ *ɴᴏᴜs sᴏᴍᴍᴇs ʜᴇᴜʀᴇᴜx ᴅᴇ ᴛ'ᴀᴠᴏɪʀ ᴘᴀʀᴍɪ ɴᴏᴜs*\n┃ *ᴍᴇᴍʙʀᴇs ᴀᴄᴛᴜᴇʟs* : #memberCount\n┃ *ᴛɪᴍᴇ* : #time ⏰\n╰━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`,
      goodbye: true,
      goodbyeMessage: `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ ᴍᴇᴍʙᴇʀ* •≫━╾╮\n┃ *ᴀᴜ ʀᴇᴠᴏɪʀ* : @user 👋\n┃ *ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*\n┃ *ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs* : #memberCount\n┃ *ᴛɪᴍᴇ* : #time ⏰\n╰━━━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`,
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false 
    },

    // --- API KEYS (DEPUIS .ENV) ---
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
      privateOnly: `💬 *ᴄᴏɴᴛᴀᴄᴛᴇᴢ-ᴍᴏɪ ᴇɴ ᴘʀɪᴠᴇ́ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ*: https://wa.me/${cleanNumber}`,
      botAdminNeeded: '🤖 *ʟᴇ ʙᴏᴛ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴀɢɪʀ !*',
      invalidCommand: '❓ *ᴄᴏᴍᴍᴀɴᴅᴇ ɪɴᴄᴏɴɴᴜᴇ. ᴛᴀᴘᴇᴢ .ᴍᴇɴᴜ*'
    },

    // --- LIMITS & SOCIALS ---
    maxWarnings: 3,
    social: {
      github: 'https://github.com/georges16388/GhostG-X-/',
      group: 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t',
      channel: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'
    }
};
