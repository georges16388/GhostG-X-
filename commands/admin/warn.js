/**
 * Warn Command - Warn a user
 */

const database = require('../../database');
const config = require('../../config');

// Design pour l'avertissement
const WARN_DESIGN = (user, count, max, reason) => `╭╼━≪• ᴜsᴇʀ ᴡᴀʀɴᴇᴅ •≫━╾╮
┃ ᴜsᴇʀ : @${user.split('@')[0]} 👤
┃ ʀᴇᴀsᴏɴ : ${reason} 📝
┃ ᴡᴀʀɴs : ${count}/${max} ⚠️
┃ sᴛᴀᴛᴜs : ${count >= max ? 'ᴇxᴘᴜʟsɪᴏɴ 🚨' : 'ᴡᴀʀɴɪɴɢ ᴘᴏsᴛᴇᴅ'}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'warn',
  aliases: ['warning'],
  category: 'admin',
  description: 'Warn a user',
  usage: '.warn @user <reason>',
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
        return extra.reply('❌ Please mention or reply to the user to warn!\n\nExample: .warn @user Breaking rules');
      }
      
      const reason = args.slice(mentioned.length > 0 ? 1 : 0).join(' ') || 'No reason specified';
      
      // Sécurité : Impossible de warn les admins
      const foundParticipant = extra.groupMetadata.participants.find(
        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      
      if (foundParticipant) {
        return extra.reply('❌ Cannot warn an admin!');
      }
      
      // Ajout du warn en DB
      const warnings = database.addWarning(extra.from, target, reason);
      const maxWarns = config.maxWarnings || 3;
      
      // Envoi du design
      await sock.sendMessage(extra.from, {
        text: WARN_DESIGN(target, warnings.count, maxWarns, reason),
        mentions: [target]
      }, { quoted: msg });
      
      // Logique d'expulsion si le max est atteint
      if (warnings.count >= maxWarns) {
        if (extra.isBotAdmin) {
          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');
          database.clearWarnings(extra.from, target);
        } else {
          await extra.reply('⚠️ Max warnings reached, but I need admin to kick the user.');
        }
      }
      
    } catch (error) {
      console.error('Warn error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
