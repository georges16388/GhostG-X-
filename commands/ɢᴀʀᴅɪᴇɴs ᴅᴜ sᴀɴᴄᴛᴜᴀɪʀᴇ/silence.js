/**
 * Mute Command - Close group (only admins can send)
 */

// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
    name: 'sɪʟᴇɴᴄᴇ',
    // Ajout de 'mute' et 'silence' en texte brut pour assurer la réactivité !
    aliases: ['close', 'closegroup', 'mute', 'silence'],
    category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    description: 'Close group (only admins can send messages)',
    usage: '.sɪʟᴇɴᴄᴇ',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      // On récupère le préfixe depuis ton fichier config.js
      const prefix = config.prefix || '^';

      try {
        await sock.groupSettingUpdate(extra.from, 'announcement');
        
        const text = `🔒 *ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴀ ᴇ́ᴛᴇ́ sᴄᴇʟʟᴇ́ !*\n\n` +
                     `*🔮 sᴇᴜʟs ʟᴇs ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴘᴇᴜᴠᴇɴᴛ ᴅᴇsᴏʀᴍᴀɪs s'ᴇxᴘʀɪᴍᴇʀ.* \n\n` +
                     `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                     
        await extra.reply(text);
        
      } catch (error) {
        await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    }
};
