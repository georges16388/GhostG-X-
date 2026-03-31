/**
 * Group Info Command - Display group information
 */

// On importe ton fichier de config à la racine pour le botName si besoin
const config = require('../../config.js'); 

module.exports = {
    name: 'sᴀɴᴄᴛᴜᴀɪʀᴇ',
    // Ajout de 'groupinfo', 'info', 'ginfo' et 'sanctuaire' en texte brut pour assurer la réactivité !
    aliases: ['info', 'ginfo', 'groupinfo', 'sanctuaire'],
    category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
    description: 'Show group information including the creator',
    usage: '.sᴀɴᴄᴛᴜᴀɪʀᴇ',
    groupOnly: true,
    
    async execute(sock, msg, args, extra) {
      try {
        const metadata = extra.groupMetadata;
        
        const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const members = metadata.participants.filter(p => !p.admin);
        
        // Récupération de l'ID du créateur
        const creatorId = metadata.owner || metadata.id.split('-')[0] + '@s.whatsapp.net';
        const creatorTag = `@${creatorId.split('@')[0]}`;
        
        let text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                   `┃    🔮 *ɪɴғᴏs sᴀɴᴄᴛᴜᴀɪʀᴇ* ┃\n` +
                   `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                   `🏷️ *ɴᴏᴍ :* ${metadata.subject}\n` +
                   `🆔 *ɪᴅ :* ${metadata.id}\n` +
                   `👤 *ᴘʀᴏᴘʀɪᴇ́ᴛᴀɪʀᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ :* ${creatorTag}\n` +
                   `👥 *ɪɴᴅɪᴠɪᴅᴜs :* ${metadata.participants.length}\n` +
                   `👑 *ɢᴀʀᴅɪᴇɴs :* ${admins.length}\n` +
                   `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ :* ${metadata.desc || 'ᴀᴜᴄᴜɴᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ'}\n` +
                   `🔒 *ʀᴇsᴛʀɪᴇɴᴛ :* ${metadata.restrict ? 'ᴏᴜɪ' : 'ɴᴏɴ'}\n` +
                   `📢 *ᴀɴɴᴏɴᴄᴇs sᴇᴜʟᴇs :* ${metadata.announce ? 'ᴏᴜɪ' : 'ɴᴏɴ'}\n` +
                   `📅 *ᴄʀᴇ́ᴀᴛɪᴏɴ :* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n\n` +
                   `👑 *ʟɪsᴛᴇ ᴅᴇs ɢᴀʀᴅɪᴇɴs :*\n`;
        
        admins.forEach((admin, index) => {
          text += `  ${index + 1}. @${admin.id.split('@')[0]}\n`;
        });
        
        text += `\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        // On fusionne les admins et le créateur dans le tableau des mentions pour s'assurer que tout le monde est bien tagué
        const allMentions = admins.map(a => a.id);
        if (!allMentions.includes(creatorId)) {
            allMentions.push(creatorId);
        }
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: allMentions
        }, { quoted: msg });
        
      } catch (error) {
        await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
    }
};
