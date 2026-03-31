/**
 * Warn Command - Warn a user
 */

const database = require('../../database');
const config = require('../../config');

module.exports = {
  name: 'sᴇɴᴛᴇɴᴄᴇ',
  aliases: ['warn', 'warning', 'punir', 'sentence', 'prevenir'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Warn a user',
  usage: '.sᴇɴᴛᴇɴᴄᴇ @user <reason>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  async execute(sock, msg, args, extra) {
    // On récupère le préfixe depuis ton fichier config.js
    const prefix = config.prefix || '^';

    try {
      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {
        target = ctx.participant;
      } else {
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ᴀ̀ sᴀɴᴄᴛɪᴏɴɴᴇʀ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${prefix}sᴇɴᴛᴇɴᴄᴇ @user <ʀᴀɪsᴏɴ>* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      const reason = args.slice(mentioned.length > 0 ? 1 : 0).join(' ') || 'ᴀᴜᴄᴜɴᴇ ʀᴀɪsᴏɴ sᴘᴇ́ᴄɪғɪᴇ́ᴇ';
      
      // Cannot warn admins
      const foundParticipant = extra.groupMetadata.participants.find(
        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      
      if (foundParticipant) {
        return extra.reply(`❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅ'ᴀᴘᴘʟɪǫᴜᴇʀ ᴜɴᴇ sᴇɴᴛᴇɴᴄᴇ ᴀ̀ ᴜɴ ɢᴀʀᴅɪᴇɴ (ᴀᴅᴍɪɴ) !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      const warnings = database.addWarning(extra.from, target, reason);
      
      let text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                 `┃    ⚠️ *sᴇɴᴛᴇɴᴄᴇ ᴇ́ᴍɪsᴇ* ┃\n` +
                 `╰╼━━━━━━━━━━━━━━━╾╯\n\n`;
                 
      text += `👤 *ɪɴᴅɪᴠɪᴅᴜ :* @${target.split('@')[0]}\n`;
      text += `📝 *ᴍᴏᴛɪғ :* ${reason}\n`;
      text += `⚠️ *sᴇɴᴛᴇɴᴄᴇs :* ${warnings.count}/${config.maxWarnings}\n\n`;
      
      if (warnings.count >= config.maxWarnings) {
        text += `❌ *ʟ'ɪɴᴅɪᴠɪᴅᴜ ᴀ ᴀᴛᴛᴇɪɴᴛ ʟᴇ sᴇᴜɪʟ ᴍᴀxɪᴍᴀʟ ᴅᴇ sᴇɴᴛᴇɴᴄᴇs ᴇᴛ ᴠᴀ ᴇ̂ᴛʀᴇ ᴇxɪʟᴇ́ !*\n\n`;
        text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
        
        if (extra.isBotAdmin) {
          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');
          database.clearWarnings(extra.from, target);
        }
      } else {
        text += `⚠️ *ʟᴀ ᴘʀᴏᴄʜᴀɪɴᴇ sᴇɴᴛᴇɴᴄᴇ ᴇɴᴛʀᴀɪ̂ɴᴇʀᴀ ᴜɴ ʙᴀɴɴɪssᴇᴍᴇɴᴛ ɪᴍᴍᴇ́ᴅɪᴀᴛ !*\n\n`;
        text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        
        await sock.sendMessage(extra.from, {
          text,
          mentions: [target]
        }, { quoted: msg });
      }
      
    } catch (error) {
      console.error('Warn command error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
