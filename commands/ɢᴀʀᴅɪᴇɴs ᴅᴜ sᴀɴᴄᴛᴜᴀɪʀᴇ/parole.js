/**
 * Unmute Command - Open group (all members can send)
 */

// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
    name: 'ᴘᴀʀᴏʟᴇ',
    // Ajout de 'unmute' et 'parole' en texte brut pour assurer la réactivité !
    aliases: ['open', 'opengroup', 'unmute', 'parole'],
    category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    description: 'Open group (all members can send messages)',
    usage: '.ᴘᴀʀᴏʟᴇ',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      // On récupère le préfixe depuis ton fichier config.js
      const prefix = config.prefix || '^';

      try {
        await sock.groupSettingUpdate(extra.from, 'not_announcement');
        
        const text = `🔓 *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀ ᴇ́ᴛᴇ́ ᴏᴜᴠᴇʀᴛ !*\n\n` +
                     `*ᴛᴏᴜs ʟᴇs ᴍᴇᴍʙʀᴇs ᴘᴇᴜᴠᴇɴᴛ ᴅᴇsᴏʀᴍᴀɪs s'ᴇxᴘʀɪᴍᴇʀ.* \n\n` +
                     `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                     
        await extra.reply(text);
        
      } catch (error) {
        await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    }
};
