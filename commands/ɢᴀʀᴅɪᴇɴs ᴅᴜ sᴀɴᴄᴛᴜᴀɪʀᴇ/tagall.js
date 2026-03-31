/**
 * Tag All Command - Mention all group members
 */

const config = require('../../config.js');

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone', 'all'],
    category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
    description: 'Tag all group members',
    usage: '.tagall <message>',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      const prefix = config.prefix || '.';
      try {
        const message = args.join(' ') || 'Appel aux membres !';
        const participants = extra.groupMetadata.participants.map(p => p.id);
        
        // Fonction pour ajouter un zéro devant les chiffres < 10
        const padZero = (num) => (num < 10 ? `0${num}` : num);

        let text = `╭╼━━━━━━━━━━━━━━━╾╮\n`;
        text += `┃     🔮 *ᴀɴɴᴏɴᴄᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ* ┃\n`;
        text += `╰╼━━━━━━━━━━━━━━━╾╯\n\n`;
        
        text += `📢 *ᴍᴇssᴀɢᴇ :*\n`;
        text += `> ${message}\n\n`;
        
        text += `👥 *ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴍᴇᴍʙʀᴇs :*\n`;
        text += `╭───────────────────╮\n`;
        
        participants.forEach((participant, index) => {
          text += `┃ [${padZero(index + 1)}] ➻ @${participant.split('@')[0]}\n`;
        });
        
        text += `╰───────────────────╯\n\n`;
        text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: participants
        }, { quoted: msg });
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
  