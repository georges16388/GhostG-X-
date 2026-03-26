 const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // --- BOT OWNER CONFIGURATION ---
    // Utilise un seul numéro ou un tableau simple sans symboles
    OWNER_NUMBER: '22651622652', 
    ownerName: 'ɢʜᴏꜱᴛɢ x', // Simplifié en String pour éviter l'erreur .toLowerCase()
    supremeNumber: '22651622652', 

    // --- BOT IDENTITY & SESSIONS ---
    botName: 'ɢʜᴏꜱᴛɢ-x',
    prefix: '.',
    sessionName: 'session',
    sessionID:'',
    
    // --- BOT BEHAVIOR & AUTOMATIONS ---
    selfMode: false, 
    autoRead: true,
    autoTyping: true,
    autoReact: false,
    autoReactMode: 'all', 
    supremeReact: '👑', 
    // ... (le reste de ton code est parfait)

    timezone: 'Africa/Ouagadougou',

    // --- GROUP SETTINGS DEFAULTS (COMPLETE) ---
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete', // 'delete', 'kick', 'warn'
      antitag: false,
      antitagAction: 'delete',
      antiall: false, 
      antiviewonce: false,
      antibot: true,
      anticall: true, 
      antigroupmention: false,
      antigroupmentionAction: 'delete',
      welcome: true,
      welcomeMessage: `╭╼━≪• *ɴᴇᴡ ᴍᴇᴍʙᴇʀ* •≫━╾╮
┃ *ᴡᴇʟᴄᴏᴍᴇ* : @user 👋🏾
┃ *ɴᴏᴜs sᴏᴍᴍᴇs ʜᴇᴜʀᴇᴜx ᴅᴇ ᴛ'ᴀᴠᴏɪʀ ᴘᴀʀᴍɪ ɴᴏᴜs*
┃ *ᴍᴇᴍʙʀᴇs ᴀᴄᴛᴜᴇʟs* : #memberCount
┃ *ᴛɪᴍᴇ* : #time ⏰
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`,
      goodbye: true,
      goodbyeMessage: `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ ᴍᴇᴍʙᴇʀ* •≫━╾╮
┃ *ᴀᴜ ʀᴇᴠᴏɪʀ* : @user 👋
┃ *ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀ ᴊᴀᴍᴀɪs*
┃ *ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs* : #memberCount
┃ *ᴛɪᴍᴇ* : #time ⏰
╰━━━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`,
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false 
    },

    // --- API KEYS ---
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || '',
      deepai: '',
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
      privateOnly: '💬 *ᴄᴏɴᴛᴀᴄᴛᴇᴢ-ᴍᴏɪ ᴇɴ ᴘʀɪᴠᴇ́ ᴘᴏᴜʀ ᴄᴇᴛᴛᴇ ᴄᴏᴍᴍᴀɴᴅᴇ*: https://wa.me/${cleanNumber}',
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
