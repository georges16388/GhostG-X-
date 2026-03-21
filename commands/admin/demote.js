/**
 * Demote Command - Remove admin privileges
 */

const { findParticipant } = require('../../utils/jidHelpers');

// Design pour l'annonce de la destitution
const DEMOTE_DESIGN = (user) => `╭╼━≪• ᴀᴅᴍɪɴ ᴅᴇᴍᴏᴛᴇᴅ •≫━╾╮
┃ ᴜsᴇʀ : @${user.split('@')[0]}
┃ sᴛᴀᴛᴜs : ɴᴏ ʟᴏɴɢᴇʀ ᴀᴅᴍɪɴ
┃ ᴀᴄᴛɪᴏɴ : sᴜᴄᴄᴇssғᴜʟ ✅
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'demote',
  aliases: ['removeadmin'],
  category: 'admin',
  description: 'Remove admin privileges from member',
  usage: '.demote @user',
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
        return extra.reply('❌ Please mention or reply to the user to demote!\n\nExample: .demote @user');
      }

      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);

      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);

      if (!foundParticipant) {
        return extra.reply('❌ User not found in group!');
      }

      // Check if user is admin using fresh data
      if (foundParticipant.admin !== 'admin' && foundParticipant.admin !== 'superadmin') {
        return extra.reply('❌ This user is not an admin!');
      }

      // Execute demotion
      await sock.groupParticipantsUpdate(extra.from, [target], 'demote');

      // Send confirmation with the new design
      await sock.sendMessage(extra.from, {
        text: DEMOTE_DESIGN(target),
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
