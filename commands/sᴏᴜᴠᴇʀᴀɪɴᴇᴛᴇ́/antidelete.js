/**
 * Anti-Delete Command - GhostG-X
 */

module.exports = {
  name: 'ᴀɴᴛɪᴅᴇʟᴇᴛᴇ',
  aliases: ['ad', 'revive'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴀᴄᴛɪᴠᴇ ʟᴀ ᴠɪsɪᴏɴ ᴅᴇs ᴍᴇssᴀɢᴇs sᴜᴘᴘʀɪᴍᴇ́s',
  usage: '.ᴀɴᴛɪᴅᴇʟᴇᴛᴇ [on/off]',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;

    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴠᴏɪʀ ʟ\'ɪɴᴠɪsɪʙʟᴇ.*');

    const mode = args[0]?.toLowerCase();

    if (mode === 'on') {
      global.antidelete = 'on';
      await reply('*👁️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴀᴄᴛɪᴠᴇ́. ʀɪᴇɴ ɴᴇ ᴍ\'ᴇ́ᴄʜᴀᴘᴘᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    } else if (mode === 'off') {
      global.antidelete = 'off';
      await reply('*🌑 ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́. ʟᴇs sᴇᴄʀᴇᴛs ʀᴇsᴛᴇʀᴏɴᴛ ᴅᴀɴs ʟ\'ᴏʙsᴄᴜʀɪᴛᴇ́.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    } else {
      const etat = global.antidelete === 'on' ? 'ᴀᴄᴛɪғ' : 'ɪɴᴀᴄᴛɪғ';
      await reply(`*〆 ᴇ́ᴛᴀᴛ ᴀᴄᴛᴜᴇʟ :* ${etat}\n*ᴜsᴀɢᴇ : .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ on/off*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
