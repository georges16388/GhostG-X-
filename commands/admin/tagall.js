/**
 * Tag All Command - Mention all group members
 */

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone'],
    category: 'admin',
    description: 'Tag all group members',
    usage: '.tagall <message>',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        const message = args.join(' ') || 'Attention everyone!';
        const participants = extra.groupMetadata.participants.map(p => p.id);
        
        // Design d'en-tête pour l'annonce
        let text = `╭╼━≪• ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ •≫━╾╮\n`;
        text += `┃ ᴍsɢ : ${message}\n`;
        text += `┃ ᴛᴀɢ : ᴀʟʟ ᴍᴇᴍʙᴇʀs 👥\n`;
        text += `╰━━━━━━━━━━━━━━━╯\n\n`;
        
        text += `📢 *List of Members:*\n`;
        
        participants.forEach((participant, index) => {
          text += `  ${index + 1}. @${participant.split('@')[0]}\n`;
        });
        
        text += `\n> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: participants
        }, { quoted: msg });
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
