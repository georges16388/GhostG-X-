/**
 * Set Welcome - Customize welcome message
 */

const db = require('../../database');

// Design pour la confirmation de mise à jour du Welcome
const SETWELCOME_DESIGN = (preview) => `╭╼━≪• ᴡᴇʟᴄᴏᴍᴇ sᴇᴛᴛɪɴɢ •≫━╾╮
┃ sᴛᴀᴛᴜs : ᴜᴘᴅᴀᴛᴇᴅ ✅
┃ ᴛʏᴘᴇ : ᴄᴜsᴛᴏᴍ ᴛᴇxᴛ 📝
┃ ᴘʀᴇᴠɪᴇᴡ : ${preview}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setwelcome',
  aliases: ['welcometext'],
  category: 'admin',
  desc: 'Set custom welcome message',
  usage: 'setwelcome <message> (use @user for member mention)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const participant = msg.key.participant || msg.participant;
      
      if (!args.length) {
        const groupSettings = db.getGroupSettings(groupId);
        return await sock.sendMessage(groupId, {
          text: `📝 *Current Welcome Message*\n\n${groupSettings.welcomeMessage}\n\n*Usage:* .setwelcome <message>\n\n*Tip:* Use @user to mention the new member`
        }, { quoted: msg });
      }
      
      const welcomeMessage = args.join(' ');
      
      if (welcomeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: '❌ Welcome message is too long! Maximum 500 characters.'
        }, { quoted: msg });
      }
      
      // Mise à jour de la base de données
      db.updateGroupSettings(groupId, { welcomeMessage });
      
      // Préparation de l'aperçu dynamique
      const previewText = welcomeMessage.replace('@user', '@' + participant.split('@')[0]);
      
      await sock.sendMessage(groupId, {
        text: SETWELCOME_DESIGN(previewText),
        mentions: [participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
