/**
 * Promote Command - Make member admin
 */

const { findParticipant } = require('../../utils/jidHelper');
// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
  name: 'promote',
  // Ajout de 'elever' et 'promote' en texte brut pour assurer la réactivité !
  aliases: ['makeadmin', 'promote', 'elever', 'prom'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: 'Promote member to admin',
  usage: '.promote @user',
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
      } else if (ctx?.participant) { // Gère la réponse à un message
        target = ctx.participant;
      } else {
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ᴀ̀ ᴘʀᴏᴍᴏᴜᴠᴏɪʀ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${prefix}ᴇʟᴇᴠᴇʀ @user* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Fetch FRESH group metadata to avoid stale cache
      const freshMetadata = await sock.groupMetadata(extra.from);
      
      // Use findParticipant for LID-aware matching with fresh metadata
      const foundParticipant = findParticipant(freshMetadata.participants, target);
      
      if (!foundParticipant) {
        return extra.reply(`❌ *ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ ɴᴇ ғᴀɪᴛ ᴘᴀs ᴘᴀʀᴛɪᴇ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      // Check if already admin using fresh data
      if (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin') {
        return extra.reply(`❌ *ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴜɴ ɢᴀʀᴅɪᴇɴ (ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴇᴜʀ) !* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }
      
      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');
      
      // Notification d'élévation stylisée
      await sock.sendMessage(extra.from, {
        text: `📈 *@${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ᴇ́ʟᴇᴠᴇ́ ᴀᴜ ʀᴀɴɢ ᴅᴇ ɢᴀʀᴅɪᴇɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });
      
    } catch (error) {
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message} \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
