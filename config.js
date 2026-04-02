/**
 * Global Configuration for WhatsApp MD - GhostG-X Edition
 * * Toutes les variables booléennes (true/false) sont lues depuis le fichier .env
 * pour une synchronisation totale.
 */

require('dotenv').config();

module.exports = {
    supremeOwner: '22651622652', 

    // Configuration des gérants secondaires
    ownerNumber: [process.env.PHONE_NUMBER || '22651622652'],
    ownerName: ['ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs'],

    // Configuration de **ʟ'ᴏʀᴀᴄʟᴇ**
    botName: 'ɢʜᴏsᴛɢ-𝐗',
    
    // Le préfixe lu directement depuis le .env
    prefix: process.env.PREFIX || '.',
    
    newsletterJid: '120363425540434745@newsletter',
    updateZipUrl: 'https://github.com/georges16388/GhostG-X-/archive/refs/heads/main.zip',

    // Configuration des Sceaux (Stickers)
    packname: 'ɢʜᴏsᴛɢ-𝐗',

    // 🔐 GESTION DES ACCÈS (RÈGLES D'OR GHOSTG-X)

    // public: true  = Le bot répond à tout le monde (DM et Groupes)
    // public: false = Le bot ignore les commandes des autres (DM et Groupes)
    public: process.env.PUBLIC_MODE === 'true',

    // selfMode: true  = Seul l'Owner peut utiliser les commandes partout
    // selfMode: false = Tout le monde peut utiliser les commandes (si public est sur true)
    selfMode: process.env.SELF_MODE === 'true',

    // Récupère la variable depuis le .env, ou force 'on' par défaut si elle est absente
    ghostgMode: process.env.GHOSTG_MODE ? process.env.GHOSTG_MODE.toLowerCase() : 'on',

    // Comportement de **ʟ'ᴏʀᴀᴄʟᴇ**
    autoRead: false,
    autoTyping: false,
    autoBio: process.env.AUTO_BIO === 'true',
    autoSticker: false,
    autoReact: process.env.AUTOREACT === 'true',
    autoReactMode: 'bot', // 'bot' pour ta réaction standard ou 'random'
    autoDownload: false,

    // Paramètres par défaut des Cercles (Groupes)
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
      welcomeMsg: `╭╼━≪• *ᴇɴᴛɪᴛᴇ́ ᴅᴇ́ᴛᴇᴄᴛᴇ́ᴇ* •≫━╾╮\n┃ *ᴀ̂ᴍᴇ* : @\${displayName} 👁️\n┃ *ᴇғғᴇᴄᴛɪғ ᴅᴜ ɴᴇ́ᴀɴᴛ* : *#\${groupMetadata.participants.length}*\n┃ *ʜᴇᴜʀᴇ sᴏᴍʙʀᴇ* : \${timeString.toUpperCase()} ⏰\n┃ *ᴛᴜ ᴠɪᴇɴs ᴅᴇ ғʀᴀɴᴄʜɪʀ ʟᴇs ᴘᴏʀᴛᴇs \n┃ ᴅᴇ* *\${groupName.toUpperCase()}*... 🚪\n┃ 🔮 *ʀᴇsᴘᴇᴄᴛᴇ ʟ'ᴏʀᴅʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ*\n┃ *ᴘᴏᴜʀ ɴᴇ ᴘᴀs ᴇ̂ᴛʀᴇ ʙᴀɴɴɪ* ┃ *ᴅᴀɴs ʟᴇs ᴀʙʏssᴇs...* ⛓️‍💥\n╰━━━━━━━━━━━━━━━╯\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,

      goodbye: process.env.GOODBYE_MSG === 'true',
      goodbyeMsg: `╭╼━≪• 🕯️ *ᴀ̂ᴍᴇ ᴇ́ɢᴀʀᴇ́ᴇ* •≫━╾╮\n┃ *ᴅᴇ́ᴘᴀʀᴛ* : @\${userNumber} 🚪\n┃ *ᴍᴜʀᴍᴜʀᴇ* : ᴛᴜ ɴᴇ ɴᴏᴜs ᴍᴀɴǫᴜᴇʀᴀs ᴊᴀᴍᴀɪs 🚮\n┃ *ᴀ̂ᴍᴇs ʀᴇsᴛᴀɴᴛᴇs* : \${groupMetadata.participants.length} 📊\n┃ *ᴄʏᴄʟᴇ* : \${timeString} ⏰\n╰━━━━━━━━━━━━━━━━━╯\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`,

      antiSpam: false,
      antidelete: false, // 🛑 Désactivé car le Store mémoire a été retiré
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false
    },

    // Clés d'API (Invocations tierces)
    apiKeys: {
      openai: '',
      deepai: '',
      remove_bg: ''
    },

    // Ordonnances et Messages de **ʟ'ᴏʀᴀᴄʟᴇ**
    messages: {
      wait: '⏳ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ᴇɴ ᴄᴏᴜʀs... ᴘᴀᴛɪᴇɴᴛᴇ.*',
      success: '✅ *ʟᴇ sᴏʀᴛɪʟᴇ̀ɢᴇ ᴀ ʀᴇ́ᴜssɪ !*',
      error: '❌ *ᴜɴᴇ ᴍᴀʟᴇ́ᴅɪᴄᴛɪᴏɴ s\'ᴇsᴛ ᴘʀᴏᴅᴜɪᴛᴇ !*',
      ownerOnly: '👑 *sᴇᴜʟ ʟ\'ᴇ́ʟᴜ (ʟᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ) ᴘᴇᴜᴛ ᴍᴀɴɪᴘᴜʟᴇʀ ᴄᴇᴛ ᴀʀᴛᴇғᴀᴄᴛ !*',
      adminOnly: '🛡️ *ᴄᴇᴛᴛᴇ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ᴇsᴛ ʀᴇ́sᴇʀᴠᴇ́ᴇ ᴀᴜx ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*',
      groupOnly: '👥 *ᴄᴇᴛ ᴀʀᴛᴇғᴀᴄᴛ ɴᴇ s\'ᴀᴄᴛɪᴠᴇ ǫᴜᴇ ᴅᴀɴs ʟᴇs ᴄᴇʀᴄʟᴇs (ɢʀᴏᴜᴘᴇs) !*',
      privateOnly: '💬 *ᴄᴇᴛᴛᴇ ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ɴᴇ sᴇ ғᴀɪᴛ ǫᴜ\'ᴇɴ ᴛᴇ̂ᴛᴇ-ᴀ̀-ᴛᴇ̂ᴛ ᴀᴠᴇᴄ ʟᴇ sᴘᴇᴄᴛʀᴇ !*',
      botAdminNeeded: '🤖 ***ʟ\'ᴏʀᴀᴄʟᴇ*** ᴅᴏɪᴛ ᴇ̂ᴛʀᴇ ᴀᴅᴍɪɴ ᴘᴏᴜʀ ᴇxᴇ́ᴄᴜᴛᴇʀ ᴄᴇᴛ ᴏʀᴅʀᴇ !*',
      invalidCommand: '❓ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ ɪɴᴄᴏɴɴᴜᴇ ! ɪɴᴠᴏǫᴜᴇ .ɢʀɪᴍᴏɪʀᴇ ᴘᴏᴜʀ ᴛ\'ᴏʀɪᴇɴᴛᴇʀ.*'
    },

    timezone: 'Africa/Ouagadougou',
    maxWarnings: 3,

    social: {
      github: 'https://github.com/georges16388/GhostG-X-',
      whatsappChannel: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c',
      whatsappGroup: 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t'
    }
};
