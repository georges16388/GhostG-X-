/**
 * Welcome - Enable/disable welcome messages
 */

const db = require('../../database');

// Design pour l'affichage du statut Welcome
const WELCOME_STATUS_DESIGN = (status) => `╭╼━≪• *ᴡᴇʟᴄᴏᴍᴇ sʏsᴛᴇᴍ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : ${status === 'on' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ *ᴛᴀʀɢᴇᴛ* : ɴᴇᴡ ᴍᴇᴍʙᴇʀs 👥
┃ *ᴀᴄᴛɪᴏɴ* : ᴀᴜᴛᴏ-ɢʀᴇᴇᴛ 👋
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff'],
  category: 'admin',
  desc: 'Enable/disable welcome messages',
  usage: 'welcome on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      
      if (!action || !['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const statusStr = groupSettings.welcome ? 'on' : 'off';
        
        return await sock.sendMessage(groupId, {
          text: `${WELCOME_STATUS_DESIGN(statusStr)}\n\n` +
                `📝 *Current Message:*\n${groupSettings.welcomeMessage}\n\n` +
                `💡 *Usage:*\n` +
                `  > .welcome on\n` +
                `  > .welcome off\n` +
                `  > .setwelcome <text>`
        }, { quoted: msg });
      }
      
      const enable = action === 'on';
      db.updateGroupSettings(groupId, { welcome: enable });
      
      await sock.sendMessage(groupId, {
        text: WELCOME_STATUS_DESIGN(action) + `\n\n✅ Welcome messages have been ${enable ? 'enabled' : 'disabled'}!`
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};
