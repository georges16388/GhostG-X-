/**
 * Group Link Command - Get group invite link
 */

module.exports = {
    name: 'grouplink',
    aliases: ['link', 'invite'],
    category: 'admin',
    description: 'Get group invite link',
    usage: '.grouplink',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    
    async execute(sock, msg, args, extra) {
      try {
        const code = await sock.groupInviteCode(extra.from);
        const link = `https://chat.whatsapp.com/${code}`;
        const groupName = extra.groupMetadata.subject;
        
        // Design du lien d'invitation
        let text = `╭╼━≪• ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ •≫━╾╮\n`;
        text += `┃ ɢʀᴏᴜᴘ : ${groupName}\n`;
        text += `┃ ʟɪɴᴋ : ${link}\n`;
        text += `┃ ᴛʏᴘᴇ : ᴏғғɪᴄɪᴀʟ ✅\n`;
        text += `╰━━━━━━━━━━━━━━━╯\n\n`;
        text += `⚠️ *Note:* Don't share this link publicly to avoid unwanted members!`;
        
        await extra.reply(text);
        
      } catch (error) {
        await extra.reply(`❌ Error: ${error.message}`);
      }
    }
  };
