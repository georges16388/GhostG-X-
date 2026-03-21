/**
 * AntiTag Command - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (status, action) => `╭╼━≪• ᴀɴᴛɪ-ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status === 'ON' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ ᴀᴄᴛɪᴏɴ : ${action.toUpperCase()} ⚡
┃ ɢᴜᴀʀᴅ : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'antitag',
  aliases: ['antimention', 'at'],
  description: 'Configure anti-tag protection (tagall/hidetag)',
  usage: '.antitag <on/off/set/get>',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const settings = database.getGroupSettings(extra.from);
      let status = settings.antitag ? 'ON' : 'OFF';
      let action = settings.antitagAction || 'delete';

      if (!args[0] || args[0].toLowerCase() === 'get') {
        return extra.reply(AGM_DESIGN(status, action));
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        database.updateGroupSettings(extra.from, { antitag: true });
        return extra.reply(AGM_DESIGN('ON', action));
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antitag: false });
        return extra.reply(AGM_DESIGN('OFF', action));
      }

      if (opt === 'set') {
        if (!args[1]) {
          return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ sᴘéᴄɪғɪᴇʀ ᴜɴᴇ ᴀᴄᴛɪᴏɴ : ᴅᴇʟᴇᴛᴇ ᴏᴜ ᴋɪᴄᴋ.*');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('⚠️ *ᴀᴄᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ. ᴄʜᴏɪsɪssᴇᴢ ᴇɴᴛʀᴇ ᴅᴇʟᴇᴛᴇ ᴏᴜ ᴋɪᴄᴋ.*');
        }

        database.updateGroupSettings(extra.from, { 
          antitagAction: setAction,
          antitag: true 
        });
        return extra.reply(AGM_DESIGN('ON', setAction));
      }

      await sock.sendMessage(extra.from, { react: { text: "🛡️", key: msg.key } });

    } catch (error) {
      console.error('Antitag Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
