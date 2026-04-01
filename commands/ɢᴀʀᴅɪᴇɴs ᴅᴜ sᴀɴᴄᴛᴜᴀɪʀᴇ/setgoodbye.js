/**
 * Set Goodbye - Customize goodbye message
 */

const db = require('../../database');
// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
  name: 'motsadieu',
  // Ajout de 'motsadieu', 'setgoodbye' et 'traceadieu' en texte brut pour assurer la réactivité !
  aliases: ['goodbyetext', 'setgoodbye', 'motsadieu', 'traceadieu'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  desc: 'Set custom goodbye message',
  usage: '.motsadieu <message> (use @user for member mention)',
  groupOnly: true,
  adminOnly: false,
  botAdminNeeded: false,
  execute: async (sock, msg, args) => {
    // On récupère le préfixe depuis ton fichier config.js
    const prefix = config.prefix || '^';

    try {
      const groupId = msg.key.remoteJid;
      
      if (!args.length) {
        const groupSettings = db.getGroupSettings(groupId);
        
        return await sock.sendMessage(groupId, {
          text: `╭╼━≪• *ᴍᴇssᴀɢᴇ ᴅ'ᴀᴅɪᴇᴜx* •≫━╾╮\n` +
                `╰━━━━━━━━━━━━━━━╯\n\n` +
                `📝 *ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ :*\n` +
                `${groupSettings.goodbyeMessage || 'ᴀᴜᴄᴜɴ'}\n\n` +
                `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
                `  ${prefix}ᴍᴏᴛsᴀᴅɪᴇᴜ <ᴍᴇssᴀɢᴇ>\n\n` +
                `💡 *ᴀsᴛᴜᴄᴇ :* ᴜᴛɪʟɪsᴇᴢ \`@user\` ᴘᴏᴜʀ ᴍᴇɴᴛɪᴏɴɴᴇʀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ǫᴜɪ ǫᴜɪᴛᴛᴇ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }
      
      const goodbyeMessage = args.join(' ');
      
      if (goodbyeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: `❌ *ʟᴇ ᴍᴇssᴀɢᴇ ᴅ'ᴀᴅɪᴇᴜx ᴇsᴛ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀxɪᴍᴜᴍ 𝟻𝟶𝟶 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs).* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }
      
      db.updateGroupSettings(groupId, { goodbyeMessage });
      
      await sock.sendMessage(groupId, {
        text: `✅ *ᴍᴇssᴀɢᴇ ᴅ'ᴀᴅɪᴇᴜx ᴍɪs ᴀ̀ ᴊᴏᴜʀ !*\n\n` +
              `🔮 *ᴀᴘᴇʀᴄ̧ᴜ :*\n` +
              `${goodbyeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}\n\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [msg.key.participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Goodbye Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
    }
  }
};
