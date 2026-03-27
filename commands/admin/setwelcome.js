/**
 * sᴇᴛᴡᴇʟᴄᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴄᴜsᴛᴏᴍɪᴢᴇ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ ᴛᴇxᴛ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ᴅʙ = require('../../database');

module.exports = {
  name: 'setwelcome',
  aliases: ['changewelcome'],
  category: 'admin',
  description: 'ᴍᴏᴅɪꜰɪᴇʀ ʟᴇ ᴍᴇssᴀɢᴇ ᴅᴇ ʙɪᴇɴᴠᴇɴᴜᴇ ᴅᴜ ɢʀᴏᴜᴘᴇ.',
  usage: '.sᴇᴛᴡᴇʟᴄᴏᴍᴇ <ᴛᴇxᴛᴇ>',
  groupOnly: true,
  adminOnly: true,

  execute: async (sock, msg, args, { from, reply, react }) => {
    try {
      const ɴᴇᴡᴛᴇxᴛ = args.join(' ');

      if (!ɴᴇᴡᴛᴇxᴛ) {
        return reply(
          `❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴇssᴀɢᴇ.* \n\n` +
          `💡 *ᴠᴀʀɪᴀʙʟᴇs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `  > @user : ᴄɪᴛᴇ ʟᴇ ᴍᴇᴍʙʀᴇ\n` +
          `  > #memberCount : ɴᴏᴍʙʀᴇ ᴅᴇ ᴍᴇᴍʙʀᴇs\n` +
          `  > #time : ʜᴇᴜʀᴇ ᴀᴄᴛᴜᴇʟʟᴇ`
        );
      }

      await react('✍️');
      ᴅʙ.updateGroupSettings(from, { 
        welcomeMessage: ɴᴇᴡᴛᴇxᴛ,
        welcome: true // ᴀᴄᴛɪᴠᴇ ᴀᴜᴛᴏᴍᴀᴛɪǫᴜᴇᴍᴇɴᴛ
      });

      return reply(
        `╭╼━≪• *ᴡᴇʟᴄᴏᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ* •≫━╾╮\n` +
        `┃ ✅ *ɴᴏᴜᴠᴇᴀᴜ ᴍᴇssᴀɢᴇ ᴇɴʀᴇɢɪsᴛʀᴇ́ !*\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `📝 *ᴀᴘᴇʀᴄ̧ᴜ :*\n${ɴᴇᴡᴛᴇxᴛ}\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`
      );

    } catch (ᴇʀʀᴏʀ) {
      console.error('[sᴇᴛᴡᴇʟᴄᴏᴍᴇ ᴇʀʀᴏʀ]:', ᴇʀʀᴏʀ);
      reply(`❌ *ᴇʀʀᴇᴜʀ :* ${ᴇʀʀᴏʀ.ᴍᴇssᴀɢᴇ}`);
    }
  }
};
