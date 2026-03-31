/**
 * Block Command - GhostG-X Edition
 * Bannit et condamne une âme dans le sanctuaire
 */

module.exports = {
  name: 'ᴄᴏɴᴅᴀᴍɴᴇʀ',
  aliases: ['condamner', 'block', 'bannir', 'sceller'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴄᴏɴᴅᴀᴍɴᴇ ᴇᴛ ᴇxᴄʟᴜᴛ ᴜɴᴇ ᴀ̂ᴍᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: '.ᴄᴏɴᴅᴀᴍɴᴇʀ @ᴜsᴇʀ ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ',
  ownerOnly: true,
  
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
        return extra.reply(`*〆 ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ ᴘᴏᴜʀ ʟᴀ ᴄᴏɴᴅᴀᴍɴᴇʀ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      await sock.updateBlockStatus(target, 'block');
      
      await sock.sendMessage(extra.from, {
        text: `*⚖️ ʟ'ᴀ̂ᴍᴇ ᴅᴇ @${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ᴄᴏɴᴅᴀᴍɴᴇ́ᴇ ᴇᴛ ʙᴀɴɴɪᴇ ᴅᴇs ᴀʀᴄᴀɴᴇs !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      await extra.reply(`*〆 ʟᴀ sᴇɴᴛᴇɴᴄᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
