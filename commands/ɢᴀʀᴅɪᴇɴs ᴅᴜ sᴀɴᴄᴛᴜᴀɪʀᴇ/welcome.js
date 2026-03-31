/**
 * Welcome - Enable/disable welcome messages
 */

const db = require('../../database');
// On importe ton fichier de config à la racine
const config = require('../../config.js'); 

module.exports = {
  name: 'accueil',
  aliases: ['welcome', 'welcomeon', 'welcomeoff', 'rituelaccueil'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  desc: 'Enable/disable welcome messages',
  usage: '.accueil on/off',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  execute: async (sock, msg, args) => {
    // On récupère le préfixe depuis ton fichier config.js
    const prefix = config.prefix || '^';

    try {
      const groupId = msg.key.remoteJid;
      const action = args[0]?.toLowerCase();
      
      if (!action || !['on', 'off'].includes(action)) {
        const groupSettings = db.getGroupSettings(groupId);
        const status = groupSettings.welcome ? '✅ *ᴀᴄᴛɪᴠᴇ́*' : '❌ *ᴅᴇ́sᴀᴄᴛɪᴠᴇ́*';
        
        return await sock.sendMessage(groupId, {
          text: `╭╼━≪• *ʀɪᴛᴜᴇʟs ᴅ'ᴀᴄᴄᴜᴇɪʟ* •≫━╾╮\n` +
                `╰━━━━━━━━━━━━━━━━╯\n\n` +
                `📊 *sᴛᴀᴛᴜᴛ :* ${status}\n` +
                `📝 *ᴍᴇssᴀɢᴇ :*\n${groupSettings.welcomeMessage || 'ᴀᴜᴄᴜɴ'}\n\n` +
                `🔮 *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴs :*\n` +
                `  ${prefix}accueil on / off\n\n` +
                `💡 *ᴀsᴛᴜᴄᴇ :* ᴜᴛɪʟɪsᴇᴢ \`${prefix}́accueil <ᴍᴇssᴀɢᴇ>\` ᴘᴏᴜʀ ᴘᴇʀsᴏɴɴᴀʟɪsᴇʀ ʟᴇ ᴛᴇxᴛᴇ ᴅ'ᴇɴᴛʀᴇ́ᴇ.\n\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        }, { quoted: msg });
      }
      
      const enable = action === 'on';
      db.updateGroupSettings(groupId, { welcome: enable });
      
      const text = enable 
        ? `✅ *ʀɪᴛᴜᴇʟs ᴅ'ᴀᴄᴄᴜᴇɪʟ ᴀᴄᴛɪᴠᴇ́s !*\n\n` +
          `ʟᴇs ɴᴏᴜᴠᴇʟʟᴇs ᴀ̂ᴍᴇs ᴀʀʀɪᴠᴀɴᴛ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ sᴇʀᴏɴᴛ ᴅᴇ́sᴏʀᴍᴀɪs sᴀʟᴜᴇ́ᴇs.\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        : `❌ *ʀɪᴛᴜᴇʟs ᴅ'ᴀᴄᴄᴜᴇɪʟ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́s !*\n\n` +
          `ʟᴇ ɢʜᴏsᴛɢ-x ɴᴇ sᴀʟᴜᴇʀᴀ ᴘʟᴜs ʟᴇs ɴᴏᴜᴠᴇᴀᴜx ᴀʀʀɪᴠᴀɴᴛs.\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(groupId, { text }, { quoted: msg });
      
    } catch (error) {
      console.error('Welcome Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });
    }
  }
};
