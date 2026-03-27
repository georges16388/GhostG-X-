/**
 * ɢᴏᴏᴅʙʏᴇ ᴄᴏᴍᴍᴀɴᴅ - ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ
 * ᴇɴᴀʙʟᴇ/ᴅɪsᴀʙʟᴇ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const ᴅʙ = require('../../database');

const ɢᴏᴏᴅʙʏᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ = (sᴛᴀᴛᴜs) => `╭╼━≪• *ɢᴏᴏᴅʙʏᴇ sʏsᴛᴇᴍ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : ${sᴛᴀᴛᴜs === 'ᴏɴ' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ *ᴛᴀʀɢᴇᴛ* : ʟᴇᴀᴠɪɴɢ ᴍᴇᴍʙᴇʀs 👤
┃ *ᴀᴄᴛɪᴏɴ* : ᴀᴜᴛᴏ-ꜰᴀʀᴇᴡᴇʟʟ 👋
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'goodbye',
  aliases: ['goodbyeon', 'goodbyeoff'],
  category: 'admin',
  description: 'ᴀᴄᴛɪᴠᴇʀ ᴏᴜ ᴅᴇ́sᴀᴄᴛɪᴠᴇʀ ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴇ ᴅᴇ́ᴘᴀʀᴛ.',
  usage: '.ɢᴏᴏᴅʙʏᴇ ᴏɴ/ᴏꜰꜰ',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  execute: async (sock, msg, args, { from, reply, react }) => {
    try {
      const ᴀᴄᴛɪᴏɴ = args[0]?.ᴛᴏʟᴏᴡᴇʀᴄᴀsᴇ();
      const sᴇᴛᴛɪɴɢs = ᴅʙ.getGroupSettings(from);

      if (!ᴀᴄᴛɪᴏɴ || !['ᴏɴ', 'ᴏꜰꜰ'].includes(ᴀᴄᴛɪᴏɴ)) {
        const sᴛᴀᴛᴜssᴛʀ = sᴇᴛᴛɪɴɢs.goodbye ? 'ᴏɴ' : 'ᴏꜰꜰ';
        await react('ℹ️');
        return reply(
          `${ɢᴏᴏᴅʙʏᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ(sᴛᴀᴛᴜssᴛʀ)}\n\n` +
          `📝 *ᴍᴇssᴀɢᴇ ᴀᴄᴛᴜᴇʟ :*\n${sᴇᴛᴛɪɴɢs.goodbyeMessage}\n\n` +
          `💡 *ᴜsᴀɢᴇ :*\n` +
          `  > .ɢᴏᴏᴅʙʏᴇ ᴏɴ\n` +
          `  > .ɢᴏᴏᴅʙʏᴇ ᴏꜰꜰ\n` +
          `  > .sᴇᴛɢᴏᴏᴅʙʏᴇ <ᴛᴇxᴛᴇ>`
        );
      }

      const ᴇɴᴀʙʟᴇ = ᴀᴄᴛɪᴏɴ === 'ᴏɴ';
      ᴅʙ.updateGroupSettings(from, { goodbye: ᴇɴᴀʙʟᴇ });
      await react(ᴇɴᴀʙʟᴇ ? '✅' : '⚠️');

      return reply(
        `${ɢᴏᴏᴅʙʏᴇ_sᴛᴀᴛᴜs_ᴅᴇsɪɢɴ(ᴀᴄᴛɪᴏɴ.ᴛᴏᴜᴘᴘᴇʀᴄᴀsᴇ())}\n\n` +
        `✅ *ʟᴇ sʏsᴛᴇ̀ᴍᴇ ɢᴏᴏᴅʙʏᴇ ᴇsᴛ ᴍᴀɪɴᴛᴇɴᴀɴᴛ* ${ᴇɴᴀʙʟᴇ ? 'ᴀᴄᴛɪᴠᴇ́' : 'ᴅᴇ́sᴀᴄᴛɪᴠᴇ́'} !`
      );

    } catch (ᴇʀʀᴏʀ) {
      console.error('[ɢᴏᴏᴅʙʏᴇ ᴇʀʀᴏʀ]:', ᴇʀʀᴏʀ);
      reply(`❌ *ᴇʀʀᴇᴜʀ :* ${ᴇʀʀᴏʀ.ᴍᴇssᴀɢᴇ}`);
    }
  }
};
