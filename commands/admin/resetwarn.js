/**
 * ResetWarn Command - Reset warnings for a user
 */

const database = require('../../database');

// Design pour la réinitialisation des avertissements
const RESETWARN_DESIGN = (user, prevCount) => `╭╼━≪• ᴡᴀʀɴɪɴɢs ʀᴇsᴇᴛ •≫━╾╮
┃ ᴜsᴇʀ : @${user.split('@')[0]} 👤
┃ ᴘʀᴇᴠɪᴏᴜs : ${prevCount} ⚠️
┃ sᴛᴀᴛᴜs : ᴄʟᴇᴀʀᴇᴅ ✨
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'resetwarn',
  aliases: ['resetwarning', 'clearwarn', 'unwarn', 'delwarn'],
  category: 'admin',
  description: 'Reset all warnings for a user',
  usage: '.resetwarn @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    try {
      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return extra.reply('❌ Please mention or reply to the user to reset warnings!\n\nExample: .resetwarn @user');
      }
      
      // Get current warnings before clearing
      const currentWarnings = database.getWarnings(extra.from, target);
      
      if (currentWarnings.count === 0) {
        return extra.reply(`✅ @${target.split('@')[0]} has no warnings to reset.`, { mentions: [target] });
      }
      
      const previousCount = currentWarnings.count;

      // Clear all warnings in database
      database.clearWarnings(extra.from, target);
      
      // Send confirmation with the design
      await sock.sendMessage(extra.from, {
        text: RESETWARN_DESIGN(target, previousCount),
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('ResetWarn command error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
