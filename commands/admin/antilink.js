/**
 * Antilink Command - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const database = require('../../database');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (status, action) => `╭╼━≪• *ᴀɴᴛɪ-ʟɪɴᴋ sʏsᴛᴇᴍ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : ${status === 'ON' ? '🟢*ᴀᴄᴛɪᴠᴀᴛᴇᴅ* : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ *ᴀᴄᴛɪᴏɴ* : ${action.toUpperCase()} ⚡
┃ *ɢᴜᴀʀᴅ* : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'antilink',
  aliases: ['anti-link'],
  category: 'admin',
  description: 'Configure antilink protection (delete/kick)',
  usage: '.antilink <on/off/set>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      const settings = database.getGroupSettings(extra.from);
      let status = settings.antilink ? 'ON' : 'OFF';
      let action = settings.antilinkAction || 'delete';

      if (!args[0] || args[0].toLowerCase() === 'get') {
        return extra.reply(AGM_DESIGN(status, action));
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        database.updateGroupSettings(extra.from, { antilink: true });
        return extra.reply(AGM_DESIGN('ON', action));
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antilink: false });
        return extra.reply(AGM_DESIGN('OFF', action));
      }

      if (opt === 'set') {
        if (!args[1]) {
          return extra.reply('⚠️ *Veuillez spécifier une action : delete ou kick.*');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('⚠️ *Action invalide. Choisissez entre delete ou kick.*');
        }

        database.updateGroupSettings(extra.from, { 
          antilinkAction: setAction,
          antilink: true 
        });
        return extra.reply(AGM_DESIGN('ON', setAction));
      }

      await sock.sendMessage(extra.from, { react: { text: "🛡️", key: msg.key } });

    } catch (error) {
      console.error('Antilink Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
