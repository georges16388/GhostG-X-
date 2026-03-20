/**
 * Anti-Group Mention Command - Toggle antigroupmention protection with delete/kick options
 */

const database = require('../../database');

// Design pour l'affichage du statut AGM
const AGM_DESIGN = (status, action) => `╭╼━≪• ᴀɴᴛɪ-ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status === 'ON' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ ᴀᴄᴛɪᴏɴ : ${action.toUpperCase()} ⚡
┃ ɢᴜᴀʀᴅ : 🛡️ ᴀᴄᴛɪᴠᴇ
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'antigroupmention',
  aliases: ['agm'],
  category: 'admin',
  description: 'Configure antigroupmention protection (delete/kick)',
  usage: '.antigroupmention <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    try {
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = settings.antigroupmentionAction || 'delete';
        
        return extra.reply(
          `${AGM_DESIGN(status, action)}\n\n` +
          `💡 *Usage:*\n` +
          `  > .agm on\n` +
          `  > .agm off\n` +
          `  > .agm set delete | kick\n` +
          `  > .agm get`
        );
      }

      const opt = args[0].toLowerCase();

      if (opt === 'on') {
        const settings = database.getGroupSettings(extra.from);
        if (settings.antigroupmention) {
          return extra.reply('*Antigroupmention is already ON*');
        }
        database.updateGroupSettings(extra.from, { antigroupmention: true });
        return extra.reply(`✅ *Antigroupmention has been turned ON*\nAction: ${settings.antigroupmentionAction || 'delete'}`);
      }

      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antigroupmention: false });
        return extra.reply('*Antigroupmention has been turned OFF*');
      }

      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply('*Please specify an action: .agm set delete | kick*');
        }

        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*Invalid action. Choose delete or kick.*');
        }

        database.updateGroupSettings(extra.from, { 
          antigroupmentionAction: setAction,
          antigroupmention: true // Auto-enable when setting action
        });
        
        return extra.reply(`${AGM_DESIGN('ON', setAction)}\n\n✅ *Action updated successfully!*`);
      }

      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = settings.antigroupmentionAction || 'delete';
        return extra.reply(AGM_DESIGN(status, action));
      }

      return extra.reply('*Use .antigroupmention for usage.*');

    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
