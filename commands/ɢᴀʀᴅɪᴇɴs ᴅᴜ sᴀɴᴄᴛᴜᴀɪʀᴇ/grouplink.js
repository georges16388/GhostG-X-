/**
 *  Link 
 */

// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
    name: 'grouplink',
    // Ajout de 'portail' et 'grouplink' en texte brut pour assurer la réactivité !
    aliases: ['link', 'invite', 'portail'],
    category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    description: 'Get group invite link',
    usage: '.grouplink',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      // On récupère le préfixe depuis ton fichier config.js
      const prefix = config.prefix || '^';

      try {
        const code = await sock.groupInviteCode(extra.from);
        const link = `https://chat.whatsapp.com/${code}`;
        
        const subject = extra.groupMetadata.subject || 'sᴀɴᴄᴛᴜᴀɪʀᴇ';
        
        const text = `╭╼━≪• *ʟɪᴇɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
                     `┃👥 *ɢʀᴏᴜᴘᴇ* : ${subject}\n` +
                     `┃ 🔗*ʟɪᴇɴ* : ${link}\n` +
                     `╰━━━━━━━━━━━━━━━╯\n\n` +
                     `⚠️ *ɴᴇ ᴘᴀʀᴛᴀɢᴇ ᴘᴀs ᴄᴇ ʟɪᴇɴ ᴘᴜʙʟɪǫᴜᴇᴍᴇɴᴛ !* \n\n` +
                     `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await extra.reply(text);
        
      } catch (error) {
        await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    }
};
