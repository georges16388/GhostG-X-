/**
 * Promote Command - Make member admin
 */

const { findParticipant } = require('../../utils/jidHelpers');

// Design pour la promotion d'admin
const PROMOTE_DESIGN = (user) => `╭╼━≪• ᴀᴅᴍɪɴ ᴘʀᴏᴍᴏᴛᴇᴅ •≫━╾╮
┃ ᴜsᴇʀ : @${user.split('@')[0]} 👑
┃ sᴛᴀᴛᴜs : ɴᴇᴡ ᴀᴅᴍɪɴ 🛡️
┃ ᴀᴄᴛɪᴏɴ : sᴜᴄᴄᴇssғᴜʟ ✅
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'promote',
  aliases: ['makeadmin'],
  category: 'admin',
  description: 'Promote member to admin',
  usage: '.promote @user',
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
        return extra.reply('❌ Please mention or reply to the user to promote!\n\nExample: .promote @user');
      }
      
      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);
      
      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);
      
      if (!foundParticipant) {
        return extra.reply('❌ User not found in group!');
      }
      
      // Check if already admin using fresh data
      if (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin') {
        return extra.reply('❌ This user is already an admin!');
      }
      
      // Execute promotion
      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');
      
      // Send confirmation with the design and mention
      await sock.sendMessage(extra.from, {
        text: PROMOTE_DESIGN(target),
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
