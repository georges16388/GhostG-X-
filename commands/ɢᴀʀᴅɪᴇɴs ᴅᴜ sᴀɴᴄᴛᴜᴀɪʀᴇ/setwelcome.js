/**
 * Set Welcome - Customize welcome message
 */

const db = require('../../database');
// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
  name: 'inscription',
  // Ajout de 'setwelcome' et 'inscription' en texte brut pour assurer la réactivité !
  aliases: ['welcometext', 'setwelcome', 'inscription'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  desc: 'Set custom welcome message',
  usage: '.inscription <message> (use @user for member mention)',
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
          text: `╭╼━≪• *ᴍᴇssᴀɢᴇ ᴅ'ᴀᴄᴄᴜᴇɪʟ* •≫━╾╮\n` +
                `╰━━━━━━━━━━━━━━━╯\n\n` +
                `📝 *ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ :*\n` +
                `${groupSettings.welcomeMessage || 'ᴀᴜᴄᴜɴ'}\n\n` +
                `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
                `  ${prefix}ɪɴsᴄʀɪᴘᴛɪᴏɴ <ᴍᴇssᴀɢᴇ>\n\n` +
                `💡 *ᴀsᴛᴜᴄᴇ :* ᴜᴛɪʟɪsᴇᴢ \`@user\` ᴘᴏᴜʀ ᴍᴇɴᴛɪᴏɴɴᴇʀ ʟ'ɪɴᴅɪᴠɪᴅᴜ ǫᴜɪ ʀᴇᴊᴏɪɴᴛ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }
      
      const welcomeMessage = args.join(' ');
      
      if (welcomeMessage.length > 500) {
        return await sock.sendMessage(groupId, {
          text: `❌ *ʟᴇ ᴍᴇssᴀɢᴇ ᴅ'ᴀᴄᴄᴜᴇɪʟ ᴇsᴛ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀxɪᴍᴜᴍ 𝟻𝟶𝟶 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs).* \n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }
      
      db.updateGroupSettings(groupId, { welcomeMessage });
      
      await sock.sendMessage(groupId, {
        text: `✅ *ᴍᴇssᴀɢᴇ ᴅ'ᴀᴄᴄᴜᴇɪʟ ᴍɪs ᴀ̀ ᴊᴏᴜʀ !*\n\n` +
              `🔮 *ᴀᴘᴇʀᴄ̧ᴜ :*\n` +
              `${welcomeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}\n\n` +
              `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [msg.key.participant]
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Set Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
    }
  }
};
