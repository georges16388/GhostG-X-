/**
 * ResetWarn Command - Reset warnings for a user
 */

const database = require('../../database');
// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
  name: 'resetwarn',
  // Ajout de 'absoudre' et 'resetwarn' en texte brut pour assurer la réactivité !
  aliases: ['resetwarning', 'clearwarn', 'unwarn', 'pardonner', 'absoudre'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Reset all warnings for a user',
  usage: '.resetwarn @user',
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
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ᴀ̀ ᴀʙsᴏᴜᴅʀᴇ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${prefix}ᴀʙsᴏᴜᴅʀᴇ @user* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Get current warnings before clearing
      const currentWarnings = database.getWarnings(extra.from, target);
      
      if (currentWarnings.count === 0) {
        return extra.reply(`✅ *@${target.split('@')[0]} ɴ'ᴀ ᴀᴜᴄᴜɴ ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛ ᴀ̀ ᴇғғᴀᴄᴇʀ.* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`, { mentions: [target] });
      }
      
      // Clear all warnings
      database.clearWarnings(extra.from, target);
      
      const text = `╭╼━━━━━━━━━━━━━━━╾╮\n` +
                   `┃     🔮 *ᴀʙsᴏʟᴜᴛɪᴏɴ* ┃\n` +
                   `╰╼━━━━━━━━━━━━━━━╾╯\n\n` +
                   `👤 *ɪɴᴅɪᴠɪᴅᴜ :* @${target.split('@')[0]}\n` +
                   `⚠️ *ᴀᴠᴇʀᴛɪssᴇᴍᴇɴᴛs ᴇғғᴀᴄᴇ́s :* ${currentWarnings.count}\n\n` +
                   `*ᴛᴏᴜᴛᴇs ʟᴇs sᴇɴᴛᴇɴᴄᴇs ᴏɴᴛ ᴇ́ᴛᴇ́ ʟᴇᴠᴇ́ᴇs ᴘᴏᴜʀ ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ.*\n\n` +
                   `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
      
      await sock.sendMessage(extra.from, {
        text,
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('ResetWarn command error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
