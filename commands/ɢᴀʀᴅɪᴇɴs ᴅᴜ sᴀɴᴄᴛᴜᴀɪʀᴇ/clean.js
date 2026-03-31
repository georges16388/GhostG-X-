/**
 * Clean Command - Delete messages in group
 */

const config = require ('../../config.js');

module.exports = {
  name: 'clean',
  aliases: ['purge', 'clear'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Clean messages (all or from specific user if replied)',
  usage: '.clean <number>',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    try {
      const count = parseInt(args[0]);
      if (!count || count < 1 || count > 100) {
        return extra.reply(`*❓ Veuillez entrer un nombre valide entre 1 et 100.*\nExemple: \`${prefix}clean 20\``);
      }

      const jid = extra.from;
      const { store } = require('../../index');
      
      // Check if message is a reply
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const msgs = store.messages[jid];
      if (!msgs) {
        return extra.reply('*❌ Aucun message trouvé dans la mémoire du bot pour ce groupe.*');
      }

      let messagesToDelete = [];

      if (quotedMsg && quotedParticipant) {
        // Mode: Delete specific user's messages
        messagesToDelete = Object.values(msgs)
          .filter(m => {
            const sender = m.key.participant || m.key.remoteJid;
            return sender === quotedParticipant;
          })
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      } else {
        // Mode: Delete last N messages from chat
        messagesToDelete = Object.values(msgs)
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count);
      }

      if (messagesToDelete.length === 0) {
        return extra.reply('*❌ Aucun message correspondant n\'a pu être trouvé pour la suppression.*');
      }

      let deleted = 0;
      for (const m of messagesToDelete) {
        try {
          await sock.sendMessage(jid, { delete: m.key });
          deleted++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error('[clean] delete error:', err.message);
        }
      }
      
      return extra.reply(
        `╭╼━≪• *ᴘᴜʀɢᴇ_ᴅᴜ_sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
        `┃ *ᴇ́ᴛᴀᴛ* : ᴛᴇʀᴍɪɴᴇ́ ✅\n` +
        `┃ *ᴄɪʙʟᴇs* : ${deleted} ᴍᴇssᴀɢᴇ(s)\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `*ʟ'ᴀʀᴄᴀɴᴇ ᴀ ᴇʟɪᴍɪɴᴇ ʟᴇs ᴛʀᴀᴄᴇs sᴘᴇᴄɪғɪᴇᴇs ᴀᴠᴇᴄ sᴜᴄᴄᴇs.*\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );
      
    } catch (e) {
      console.error('[clean cmd] error:', e);
      extra.reply(`❌ Error: ${e.message}`);
    }
  }
};
