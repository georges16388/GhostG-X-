/**
 * AutoSticker Command - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (status) => `╭╼━≪• ᴀᴜᴛᴏ-sᴛɪᴄᴋᴇʀ sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status === 'ON' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ ᴍᴏᴅᴇ : ᴀᴜᴛᴏ-ᴄᴏɴᴠᴇʀᴛ ⚡
┃ ᴛʏᴘᴇ : ɪᴍɢ & ᴠɪᴅ 🎬
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'autosticker',
  aliases: ['autos', 'asticker'],
  category: 'admin',
  description: 'Enable or disable auto-sticker conversion',
  usage: '.autosticker <on/off>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    try {
      const settings = database.getGroupSettings(extra.from);
      let status = settings.autosticker ? 'ON' : 'OFF';

      if (!args[0]) {
        return extra.reply(AGM_DESIGN(status));
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        database.updateGroupSettings(extra.from, { autosticker: true });
        return extra.reply(AGM_DESIGN('ON'));
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { autosticker: false });
        return extra.reply(AGM_DESIGN('OFF'));
      }

      await sock.sendMessage(extra.from, { react: { text: "🎨", key: msg.key } });

    } catch (error) {
      console.error('[AutoSticker Error]:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
