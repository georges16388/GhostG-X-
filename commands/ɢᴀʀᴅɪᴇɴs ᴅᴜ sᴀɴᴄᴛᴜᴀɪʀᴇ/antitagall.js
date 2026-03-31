/**
 * Anti-Group Mention Command - Toggle antigroupmention protection with delete/kick options
 */

const database = require('../../database');
const config = require ('../../config.js');

module.exports = {
  name: 'antigroupmention',
  aliases: ['agm', 'antitagall'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Configure antigroupmention protection (delete/kick)',
  usage: '.antigroupmention <on/off/set/get>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) { 
    const prefix = config.prefix || '.';
    try { 
      if (!args[0]) {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = (settings.antigroupmentionAction || 'delete').toUpperCase();
        
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `┃ *sᴇɴᴛᴇɴᴄᴇ* : ${action}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴅᴇ́ᴛᴇᴄᴛᴇ ᴇᴛ ᴘᴜʀɢᴇ ʟᴇs ᴍᴇɴᴛɪᴏɴs ɢʟᴏʙᴀʟᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n` +
          `  ${prefix}antigroupmention on\n` +
          `  ${prefix}antigroupmention off\n` +
          `  ${prefix}antigroupmention set delete | kick\n` +
          `  ${prefix}antigroupmention get\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const opt = args[0].toLowerCase();
      
      if (opt === 'on') {
        if (database.getGroupSettings(extra.from).antigroupmention) {
          return extra.reply('*Le bouclier_mentions est déjà actif.*');
        }
        database.updateGroupSettings(extra.from, { antigroupmention: true });
        return extra.reply(`*ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs ᴀ ᴇ́ᴛᴇ́ ᴇ́ᴠᴇɪʟʟᴇ́ (ᴏɴ).*`);
      }
      
      if (opt === 'off') {
        database.updateGroupSettings(extra.from, { antigroupmention: false });
        return extra.reply('*ʟᴇ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs ᴀ ᴇ́ᴛᴇ́ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́ (ᴏғғ).*');
      }
      
      if (opt === 'set') {
        if (args.length < 2) {
          return extra.reply(`*❓ Veuillez spécifier une sentence : \`${prefix}antigroupmention set delete | kick\`*`);
        }
        
        const setAction = args[1].toLowerCase();
        if (!['delete', 'kick'].includes(setAction)) {
          return extra.reply('*❓ Sentence invalide. Choisissez entre `delete` ou `kick`.*');
        }
        
        database.updateGroupSettings(extra.from, { 
          antigroupmentionAction: setAction,
          antigroupmention: true // Auto-enable when setting action
        });
        return extra.reply(`*ʟᴀ sᴇɴᴛᴇɴᴄᴇ ᴅᴜ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs ᴇsᴛ ᴘʟᴀᴄᴇ́ᴇ sᴜʀ : ${setAction.toUpperCase()}*`);
      }
      
      if (opt === 'get') {
        const settings = database.getGroupSettings(extra.from);
        const status = settings.antigroupmention ? 'ON' : 'OFF';
        const action = (settings.antigroupmentionAction || 'delete').toUpperCase();
        
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ʙᴏᴜᴄʟɪᴇʀ_ᴍᴇɴᴛɪᴏɴs* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `┃ *sᴇɴᴛᴇɴᴄᴇ* : ${action}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      return extra.reply(`*Utilise \`${prefix}antigroupmention\` pour voir les options.*`);
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
