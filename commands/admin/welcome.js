/**
 * ᴡᴇʟᴄᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴇɴᴀʙʟᴇ/ᴅɪsᴀʙʟᴇ ᴀᴜᴛᴏ-ɢʀᴇᴇᴛ sʏsᴛᴇᴍ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ᴅʙ = require('../../database');

const ᴡᴇʟᴄᴏᴍᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ = (sᴛᴀᴛᴜs) => `╭╼━≪• *ᴡᴇʟᴄᴏᴍᴇ sʏsᴛᴇᴍ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : ${sᴛᴀᴛᴜs === 'ᴏɴ' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ *ᴛᴀʀɢᴇᴛ* : ɴᴇᴡ ᴍᴇᴍʙᴇʀs 👥
┃ *ᴀᴄᴛɪᴏɴ* : ᴀᴜᴛᴏ-ɢʀᴇᴇᴛ 👋
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'welcome',
  aliases: ['welcomeon', 'welcomeoff'],
  category: 'admin',
  description: 'ᴀᴄᴛɪᴠᴇʀ ᴏᴜ ᴅᴇ́sᴀᴄᴛɪᴠᴇʀ ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴇ ʙɪᴇɴᴠᴇɴᴜᴇ.',
  usage: '.ᴡᴇʟᴄᴏᴍᴇ ᴏɴ/ᴏꜰꜰ',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  execute: async (sock, msg, args, { from, reply, react }) => {
    try {
      const ᴀᴄᴛɪᴏɴ = args[0]?.ᴛᴏʟᴏᴡᴇʀᴄᴀsᴇ();
      const sᴇᴛᴛɪɴɢs = ᴅʙ.getGroupSettings(from);

      if (!ᴀᴄᴛɪᴏɴ || !['ᴏɴ', 'ᴏꜰꜰ'].includes(ᴀᴄᴛɪᴏɴ)) {
        const sᴛᴀᴛᴜssᴛʀ = sᴇᴛᴛɪɴɢs.welcome ? 'ᴏɴ' : 'ᴏꜰꜰ';
        await react('ℹ️');
        return reply(
          `${ᴡᴇʟᴄᴏᴍᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ(sᴛᴀᴛᴜssᴛʀ)}\n\n` +
          `📝 *ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ :*\n${sᴇᴛᴛɪɴɢs.welcomeMessage}\n\n` +
          `💡 *ᴜsᴀɢᴇ :*\n` +
          `  > .ᴡᴇʟᴄᴏᴍᴇ ᴏɴ\n` +
          `  > .ᴡᴇʟᴄᴏᴍᴇ ᴏꜰꜰ\n` +
          `  > .sᴇᴛᴡᴇʟᴄᴏᴍᴇ <ᴛᴇxᴛᴇ>`
        );
      }

      const ᴇɴᴀʙʟᴇ = ᴀᴄᴛɪᴏɴ === 'ᴏɴ';
      ᴅʙ.updateGroupSettings(from, { welcome: ᴇɴᴀʙʟᴇ });
      await react(ᴇɴᴀʙʟᴇ ? '✅' : '⚠️');

      return reply(
        `${ᴡᴇʟᴄᴏᴍᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ(ᴀᴄᴛɪᴏɴ.ᴛᴏᴜᴘᴘᴇʀᴄᴀsᴇ())}\n\n` +
        `✅ *ʟᴇ sʏsᴛᴇ̀ᴍᴇ ᴅᴇ ʙɪᴇɴᴠᴇɴᴜᴇ ᴇsᴛ ᴍᴀɪɴᴛᴇɴᴀɴᴛ* ${ᴇɴᴀʙʟᴇ ? 'ᴀᴄᴛɪᴠᴇ́' : 'ᴅᴇ́sᴀᴄᴛɪᴠᴇ́'} !`
      );

    } catch (ᴇʀʀᴏʀ) {
      console.error('[ᴡᴇʟᴄᴏᴍᴇ ᴇʀʀᴏʀ]:', ᴇʀʀᴏʀ);
      reply(`❌ *ᴇʀʀᴇᴜʀ :* ${ᴇʀʀᴏʀ.ᴍᴇssᴀɢᴇ}`);
    }
  }
};
