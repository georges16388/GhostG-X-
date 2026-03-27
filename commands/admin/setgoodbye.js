/**
 * sᴇᴛɢᴏᴏᴅʙʏᴇ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴄᴜsᴛᴏᴍɪᴢᴇ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ ᴛᴇxᴛ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ᴅʙ = require('../../database');

const sᴇᴛɢᴏᴏᴅʙʏᴇ_ᴅᴇsɪɢɴ = (ᴘʀᴇᴠɪᴇᴡ) => `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ sᴇᴛᴛɪɴɢ* •≫━╾╮
┃ sᴛᴀᴛᴜs : ᴜᴘᴅᴀᴛᴇᴅ ✅
┃ ᴛʏᴘᴇ : ᴄᴜsᴛᴏᴍ ᴛᴇxᴛ 📝
┃ ᴘʀᴇᴠɪᴇᴡ : ${ᴘʀᴇᴠɪᴇᴡ}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbyetext', 'changegoodbye'],
  category: 'admin',
  description: 'ᴍᴏᴅɪꜰɪᴇʀ ʟᴇ ᴍᴇssᴀɢᴇ ᴅᴇ ᴅᴇ́ᴘᴀʀᴛ ᴅᴜ ɢʀᴏᴜᴘᴇ.',
  usage: '.sᴇᴛɢᴏᴏᴅʙʏᴇ <ᴛᴇxᴛᴇ>',
  groupOnly: true,
  adminOnly: true,

  execute: async (sock, msg, args, { from, reply, react }) => {
    try {
      const ɴᴇᴡᴛᴇxᴛ = args.join(' ');

      if (!ɴᴇᴡᴛᴇxᴛ) {
        const sᴇᴛᴛɪɴɢs = ᴅʙ.getGroupSettings(from);
        return reply(
          `📝 *ᴍᴇssᴀɢᴇ ᴅᴇ ᴅᴇ́ᴘᴀʀᴛ ᴀᴄᴛᴜᴇʟ :*\n\n${sᴇᴛᴛɪɴɢs.goodbyeMessage}\n\n` +
          `💡 *ᴠᴀʀɪᴀʙʟᴇs ᴅɪsᴘᴏɴɪʙʟᴇs :*\n` +
          `  > @user : ɴᴏᴍ ᴅᴜ ᴍᴇᴍʙʀᴇ\n` +
          `  > #memberCount : ᴍᴇᴍʙʀᴇs ʀᴇsᴛᴀɴᴛs\n` +
          `  > #time : ʜᴇᴜʀᴇ ᴅᴜ ᴅᴇ́ᴘᴀʀᴛ`
        );
      }

      if (ɴᴇᴡᴛᴇxᴛ.length > 500) return reply('❌ *ᴍᴇssᴀɢᴇ ᴛʀᴏᴘ ʟᴏɴɢ ! (ᴍᴀx 500 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs).*');

      await react('✍️');
      ᴅʙ.updateGroupSettings(from, { 
        goodbyeMessage: ɴᴇᴡᴛᴇxᴛ,
        goodbye: true 
      });

      const ᴘʀᴇᴠɪᴇᴡᴛᴇxᴛ = ɴᴇᴡᴛᴇxᴛ.replace('@user', '@' + (msg.key.participant || from).split('@')[0]);

      return reply(sᴇᴛɢᴏᴏᴅʙʏᴇ_ᴅᴇsɪɢɴ(ᴘʀᴇᴠɪᴇᴡᴛᴇxᴛ));

    } catch (ᴇʀʀᴏʀ) {
      console.error('[sᴇᴛɢᴏᴏᴅʙʏᴇ ᴇʀʀᴏʀ]:', ᴇʀʀᴏʀ);
      reply(`❌ *ᴇʀʀᴇᴜʀ :* ${ᴇʀʀᴏʀ.ᴍᴇssᴀɢᴇ}`);
    }
  }
};
