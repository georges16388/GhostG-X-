/**
 * Goodbye - Enable/disable goodbye messages
 */

const db = require('../../database');
const config = require('../../config.js');

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff', 'byeon', 'byeoff'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  desc: 'Enable/disable goodbye messages',
  usage: 'goodbye on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    try {
      const groupId = extra.from;
      const action = args[0]?.toLowerCase();
      
      const groupSettings = db.getGroupSettings(groupId);
      
      if (!action || !['on', 'off'].includes(action)) {
        const status = groupSettings.goodbye ? 'ON' : 'OFF';
        const message = groupSettings.goodbyeMessage || 'Non défini';
        
        return extra.reply(
          `╭╼━≪• *sᴛᴀᴛᴜᴛ ᴀʀᴄᴀɴᴇ_ɢᴏᴏᴅʙʏᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ${status}\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `*ᴄᴇᴛ ᴀʀᴄᴀɴᴇ ᴀғғɪᴄʜᴇ ʟ'ᴀᴅɪᴇᴜ ᴇᴛ ʟᴀ sᴛᴇʟᴇ ᴅᴇs ᴍᴇᴍʙʀᴇs ǫᴜɪᴛᴛᴀɴᴛ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n` +
          `  ${prefix}goodbye on\n` +
          `  ${prefix}goodbye off\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const enable = action === 'on';
      
      if (enable && groupSettings.goodbye) {
        return extra.reply('*L\'arcane_goodbye est déjà actif.*');
      }
      
      if (!enable && !groupSettings.goodbye) {
        return extra.reply('*L\'arcane_goodbye est déjà endormi.*');
      }
      
      db.updateGroupSettings(groupId, { goodbye: enable });
      
      if (enable) {
        return extra.reply('*L\'arcane_goodbye a été éveillé avec succès ✅\n\nLes âmes quittant le groupe recevront leur stèle funéraire.\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      } else {
        return extra.reply('*🚨 L\'arcane_goodbye a été désactivé !\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      }
      
    } catch (error) {
      console.error('Goodbye Error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
