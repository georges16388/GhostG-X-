/**
 * Unblock Command - GhostG-X Edition
 * Débloque une âme dans le sanctuaire
 */

module.exports = {
  name: 'ᴅᴇʙᴀɴɴɪssᴇᴍᴇɴᴛ',
  aliases: ['debannissement', 'unblock', 'debloquer', 'libérer', 'lib'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ʀᴇᴠᴏǫᴜᴇ ʟᴇ ʙᴀɴɴɪssᴇᴍᴇɴᴛ ᴅ\'ᴜɴᴇ ᴀ̂ᴍᴇ',
  usage: '.ᴅᴇʙᴀɴɴɪssᴇᴍᴇɴᴛ @ᴜsᴇʀ ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ',
  ownerOnly: true, // Reste accessible uniquement aux administrateurs du bot
  
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
        return extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴᴇ ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ ᴘᴏᴜʀ ʟᴀ ᴅᴇ́ʙᴀɴɴɪʀ !*');
      }
      
      // Rituel de déblocage via Baileys
      await sock.updateBlockStatus(target, 'unblock');
      
      await sock.sendMessage(extra.from, {
        text: `*✅ ʟ\'ᴀ̂ᴍᴇ ᴅᴇ @${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ʟɪʙᴇ́ʀᴇ́ᴇ ᴅᴇs ᴀʙʏsᴇs !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Unblock command error:', error);
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
