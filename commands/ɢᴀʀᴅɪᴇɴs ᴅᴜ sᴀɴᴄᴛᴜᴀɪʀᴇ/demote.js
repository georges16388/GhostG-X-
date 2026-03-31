/**
 * Demote Command - Remove admin privileges
 * Version : Prestige V5.2 - Full Power (Design Small Caps)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { findParticipant } = require('../../utils/jidHelper');
const config = require('../../config.js');

module.exports = {
  name: 'demote',
  aliases: ['removeadmin', 'dem', 'destituer', 'rabaisser'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Remove admin privileges from member',
  usage: '.demote @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    // On récupère le préfixe depuis ton fichier config.js
    const prefix = config.prefix || '.';

    try {
      let target;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];
      
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant) { // Gère la réponse à un message (simplifié comme promote)
        target = ctx.participant;
      } else {
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ᴀ̀ ᴅᴇsᴛɪᴛᴜᴇʀ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${prefix}ᴅᴇᴍᴏᴛᴇ @user* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);
      
      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);
      
      if (!foundParticipant) {
        return extra.reply(`❌ *ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ ɴᴇ ғᴀɪᴛ ᴘᴀs ᴘᴀʀᴛɪᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Check if user is admin using fresh data
      if (foundParticipant.admin !== 'admin' && foundParticipant.admin !== 'superadmin') {
        return extra.reply(`❌ *ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ ɴ'ᴇsᴛ ᴘᴀs ᴜɴ ɢᴀʀᴅɪᴇɴ (ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴇᴜʀ) !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      await sock.groupParticipantsUpdate(extra.from, [target], 'demote');
      
      // Notification de destitution calquée sur le promote
      await sock.sendMessage(extra.from, {
        text: `📉 *@${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ᴅᴇsᴛɪᴛᴜᴇ́ ᴅᴜ ʀᴀɴɢ ᴅᴇ ɢᴀʀᴅɪᴇɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
