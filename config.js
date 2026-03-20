/**
 * Global Configuration for WhatsApp MD Bot
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['226XXXXXXXX','226XXXXXXX'], // Add your number without + or spaces (e.g., 22651622652)
    ownerName: ['','ᴘʜᴀɴᴛᴏᴍ-x'], // Owner names corresponding to ownerNumber array
    
    // Bot Configuration
    botName: '-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363425540434745@newsletter', // Newsletter JID for menu forwarding
    updateZipUrl: 'https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip', // URL to latest code zip for .update command
    
    // Sticker Configuration
    packname: '-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ',
    
    // Bot Behavior
    selfMode: false, // Private mode - only owner can use commands
    autoRead: true,
    autoTyping: true,
    autoBio: true,
    autoSticker: false,
    autoReact: true,
    autoReactMode: 'all', // set bot or all via cmd
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete', // 'delete', 'kick', 'warn'
      antitag: false,
      antitagAction: 'delete',
      antiall: false, // Owner only - blocks all messages from non-admins
      antiviewonce: false,
      antibot: true,
      anticall: false, // Anti-call feature
      antigroupmention: false, // Anti-group mention feature
      antigroupmentionAction: 'delete', // 'delete', 'kick'
      welcome: false,
      welcomeMessage:`╭╼━≪• 𝙽𝙴𝚆 ᴍᴇᴍʙᴇʀ •≫━╾╮
┃ ᴡᴇʟᴄᴏᴍᴇ : @user 👋
┃ ᴍᴇᴍʙᴇʀ ᴄᴏᴜɴᴛ : #memberCount
┃ ᴛɪᴍᴇ : time ⏰
╰━━━━━━━━━━━━━━━╯

*╭━〔 👋 ᴡᴇʟᴄᴏᴍᴇ 〕━⬣*
┃ Hey @user,
┃ bienvenue dans *@group*! 🎉
┃ Lis les règles et sois actif 💪
*╰━━━━━━━━━━━━━━━⬣*

┏▣ ◈ *ɢʀᴏᴜᴘ ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ* ◈
┃ groupDesc || "No description set."
┗▣

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.botName}*`,
      goodbye: false,
      goodbyeMessage: 'Goodbye @user 👋 Tu ne nous manquera jamais !',
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false // Auto-convert images/videos to stickers
    },
    
    // API Keys (add your own)
    apiKeys: {
      // Add API keys here if needed
      openai: '',
      deepai: '',
      remove_bg: ''
    },
    
    // Message Configuration
    messages: {
      wait: '⏳ Please wait...',
      success: '✅ Success!',
      error: '❌ Error occurred!',
      ownerOnly: '👑 This command is only for bot owner!',
      adminOnly: '🛡️ This command is only for group admins!',
      groupOnly: '👥 This command can only be used in groups!',
      privateOnly: '💬 This command can only be used in private chat!',
      botAdminNeeded: '🤖 Bot needs to be admin to execute this command!',
      invalidCommand: '❓ Invalid command! Type .menu for help'
    },
    
    // Timezone
    timezone: 'Asia/Kolkata',
    
    // Limits
    maxWarnings: 3,
    
    // Social Links (optional)
    social: {
      github: 'https://github.com/georges16388/GhostG-X-/',
      WhatsApp group:
''
    }
};
  
