/**
 * Goodbye - Enable/disable goodbye messages
 */

const db = require('../../database');

// Intégration de ton design avec "REMAINING MEMBERS"
const DEFAULT_DESIGN = `╭╼━≪• 𝙻𝙴𝙰𝚅𝙴 ᴍᴇᴍʙᴇʀ •≫━╾╮
┃ ɢᴏᴏᴅʙʏᴇ : @user 👋
┃ ʀᴇᴍᴀɪɴɪɴɢ ᴍᴇᴍʙᴇʀs : #memberCount
┃ ᴛɪᴍᴇ : time ⏰
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff'],
  category: 'admin',
  desc: 'Enable/disable goodbye messages',
  usage: 'goodbye on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      
      if (!action || !['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const status = groupSettings.goodbye ? '✅ Enabled' : '❌ Disabled';
        // Utilise le nouveau design si aucun message n'est configuré en DB
        const msgPreview = groupSettings.goodbyeMessage || DEFAULT_DESIGN;

        return await sock.sendMessage(groupId, {
          text: `👋 *Goodbye Messages*\n\nStatus: ${status}\nMessage:\n${msgPreview}\n\nUsage: .goodbye on/off\n\nTo customize: .setgoodbye <message>`
        }, { quoted: msg });
      }
      
      const enable = action === 'on';
      db.updateGroupSettings(groupId, { goodbye: enable });
      
      await sock.sendMessage(groupId, {
        text: `✅ Goodbye messages ${enable ? 'enabled' : 'disabled'}!${enable ? '\n\nLeaving members will now receive your design.' : ''}`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
