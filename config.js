/**
 * Global Configuration for WhatsApp MD Bot
 */

require('dotenv').config();

module.exports = {
    // Bot Owner Configuration
    ownerNumber: [process.env.PHONE_NUMBER || '22651622652'],
    ownerName: ['ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs'],
    
    // Bot Configuration
    botName: 'ɢʜᴏsᴛɢ-𝐗',
    prefix: process.env.PREFIX || '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363425540434745@newsletter',
    updateZipUrl: 'https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip',
    
    // Sticker Configuration
    packname: 'ɢʜᴏsᴛɢ-𝐗',
    
    // Bot Behavior
    // selfMode: true  = seul l'owner peut utiliser les commandes (groupes + privé + inbox)
    // selfMode: false = tout le monde peut utiliser les commandes
    selfMode: process.env.SELF_MODE === 'true',
    
    // Récupère la variable depuis le .env, ou force 'on' par défaut si elle est absente
    ghostgMode: process.env.GHOSTG_MODE ? process.env.GHOSTG_MODE.toLowerCase() : 'on',
    
    autoRead: false,
    autoTyping: false,
    autoBio: process.env.AUTO_BIO === 'true',
    autoSticker: false,
    autoReact: process.env.AUTOREACT === 'true',
    autoReactMode: 'bot',
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete',
      antitag: false,
      antitagAction: 'delete',
      antiall: false,
      antiviewonce: false,
      antibot: false,
      anticall: process.env.ANTICALL === 'true',
      antigroupmention: false,
      antigroupmentionAction: 'delete',

      welcome: process.env.WELCOME_MSG === 'true',
      welcomeMsg: `╭╼━≪• *ᴇɴᴛɪᴛᴇ́ ᴅᴇ́ᴛᴇᴄᴛᴇ́ᴇ* •≫━╾╮
┃ *ᴀ̂ᴍᴇ* : @\${displayName} 👁️
┃ *ᴇғғᴇᴄᴛɪғ ᴅᴜ ɴᴇ́ᴀɴᴛ* : #\${groupMetadata.participants.length}
┃ *ʜᴇᴜʀᴇ sᴏᴍʙʀᴇ* : \${timeString.toUpperCase()} ⏰
┃ *ᴛᴜ ᴠɪᴇɴs ᴅᴇ ғʀᴀɴᴄʜɪʀ ʟᴇs ᴘᴏʀᴛᴇs 
┃ ᴅᴇ* *\${groupName.toUpperCase()}*... 🚪
┃ 🔮 *ʀᴇsᴘᴇᴄᴛᴇ ʟ'ᴏʀᴅʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ*
┃ *ᴘᴏᴜʀ ɴᴇ ᴘᴀs ᴇ̂ᴛʀᴇ ʙᴀɴɴɪ* ┃ *ᴅᴀɴs ʟᴇs ᴀʙʏssᴇs...* ⛓️‍💥
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,

      goodbye: process.env.GOODBYE_MSG === 'true',
      goodbyeMsg: `╭╼━≪• 🕯️ *ᴀ̂ᴍᴇ ᴇ́ɢᴀʀᴇ́ᴇ* •≫━╾╮
┃ *ᴅᴇ́ᴘᴀʀᴛ* : @\${userNumber} 🚪
┃ *ᴍᴜʀᴍᴜʀᴇ* : ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀs ᴊᴀᴍᴀɪs 🚮
┃ *ᴀ̂ᴍᴇs ʀᴇsᴛᴀɴᴛᴇs* : \${groupMetadata.participants.length} 📊
┃ *ᴄʏᴄʟᴇ* : \${timeString} ⏰
╰━━━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,

      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false
    },
    
    // API Keys
    apiKeys: {
      openai: '',
      deepai: '',
      remove_bg: ''
    },
    
    // Message Configuration
    messages: {
      wait: '⏳ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs... ᴘᴀᴛɪᴇɴᴛᴇ.*',
      success: '✅ *ʟᴇ sᴏʀᴛɪʟᴇ̀ɢᴇ ᴀ ʀᴇ́ᴜssɪ !*',
      error: '❌ *ᴜɴᴇ ᴍᴀʟᴇ́ᴅɪᴄᴛɪᴏɴ (ᴇʀʀᴇᴜʀ) s\'ᴇsᴛ ᴘʀᴏᴅᴜɪᴛᴇ !*',
      ownerOnly: '👑 *sᴇᴜʟ ʟ\'ᴇ́ʟᴜ (ʟᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ) ᴘᴇᴜᴛ ᴍᴀɴɪᴘᴜʟᴇʀ ᴄᴇᴛ ᴀʀᴛᴇғᴀᴄᴛ !*',
      adminOnly: '🛡️ *ᴄᴇᴛᴛᴇ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*',
      groupOnly: '👥 *ᴄᴇᴛ ᴀʀᴛᴇғᴀᴄᴛ ɴᴇ s\'ᴀᴄᴛɪᴠᴇ ǫᴜᴇ ᴅᴀɴs ʟᴇs ᴄᴇʀᴄʟᴇs (ɢʀᴏᴜᴘᴇs) !*',
      privateOnly: '💬 *ᴄᴇᴛᴛᴇ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ɴᴇ sᴇ ғᴀɪᴛ ǫᴜ\'ᴇɴ ᴛᴇ̂ᴛᴇ-ᴀ̀-ᴛᴇ̂ᴛ ᴀᴠᴇᴄ ʟᴇ sᴘᴇᴄᴛʀᴇ !*',
      botAdminNeeded: '🤖 *ʟᴇ ɢᴀʀᴅɪᴇɴ ɢʜᴏsᴛ ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴄᴇᴛ ᴏʀᴅʀᴇ !*',
      invalidCommand: '❓ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ɪɴᴄᴏɴɴᴜᴇ ! ɪɴᴠᴏǫᴜᴇ .ᴍᴇɴᴜ ᴘᴏᴜʀ ᴛ\'ᴏʀɪᴇɴᴛᴇʀ.*'
    },

    // Timezone
    timezone: 'Africa/Ouagadougou',
    
    // Limits
    maxWarnings: 3,
    
    // Social Links
    social: {
      github: 'https://github.com/georges16388/GhostG-X-',
      whatsappChannel: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c',
      whatsappGroup: 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t'
    }
};
