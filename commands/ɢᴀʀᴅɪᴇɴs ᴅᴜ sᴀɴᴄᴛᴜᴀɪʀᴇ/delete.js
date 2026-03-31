/**
 * Delete Command
 * Delete a replied message and the command itself
 */

const config = require ('../../config.js');

module.exports = {
  name: 'delete',
  aliases: ['del', 'dlt', 'd', 'sup', 'supprime'],
  description: 'Delete a replied message and the command',
  usage: '.delete (reply to a message)',
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      
      if (!ctx?.stanzaId || !ctx?.participant) {
        return extra.reply(
          `╭╼━≪• *ᴇʟɪᴍɪɴᴀᴛɪᴏɴ_ᴄɪʙʟᴇᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*ʀᴇᴘᴏɴᴅs ᴀᴜ ᴍᴇssᴀɢᴇ ǫᴜᴇ ᴛᴜ sᴏᴜʜᴀɪᴛᴇs ғᴀɪʀᴇ ᴅɪsᴘᴀʀᴀɪᴛʀᴇ.*\n\n` +
          `  ${prefix}delete\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      // 1. Clé pour supprimer le message auquel on répond
      const deleteTargetKey = { 
        remoteJid: extra.from, 
        id: ctx.stanzaId, 
        participant: ctx.participant 
      };
      
      // 2. Clé pour supprimer le message de commande actuel (.delete)
      const deleteCommandKey = {
        remoteJid: extra.from,
        id: msg.key.id,
        participant: msg.key.participant || msg.key.remoteJid
      };
      
      // On exécute les deux suppressions
      await sock.sendMessage(extra.from, { delete: deleteTargetKey });
      await sock.sendMessage(extra.from, { delete: deleteCommandKey });
      
    } catch (error) {
      console.error('Delete command error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
    }
  }
};
