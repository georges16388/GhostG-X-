const config = require('../../config');

module.exports = {
  name: 'ᴀɴᴛɪᴅᴇʟᴇᴛᴇ',
  aliases: ['antisuppression', 'revive'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler ?
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ʟᴀ ᴠɪsɪᴏɴ ᴅᴇs ᴍᴇssᴀɢᴇs sᴜᴘᴘʀɪᴍᴇ́s*',
  usage: `${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ/sᴛᴀᴛᴜs`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;
    const prefix = config.prefix || '.';

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴠᴏɪʀ ʟ\'ɪɴᴠɪsɪʙʟᴇ.*');

    const mode = args[0]?.toLowerCase();
    const isCurrentlyOn = global.antidelete === 'on';

    if (mode === 'on') {
      if (isCurrentlyOn) {
        return reply('*👁️ ʟ\'ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*');
      }
      global.antidelete = 'on';
      await reply('*👁️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴀᴄᴛɪᴠᴇ́. ʀɪᴇɴ ɴᴇ ᴍ\'ᴇ́ᴄʜᴀᴘᴘᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      
    } else if (mode === 'off') {
      if (!isCurrentlyOn) {
        return reply('*🌑 ʟ\'ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*');
      }
      global.antidelete = 'off';
      await reply('*🌑 ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́. ʟᴇs sᴇᴄʀᴇᴛs ʀᴇsᴛᴇʀᴏɴᴛ ᴅᴀɴs ʟ\'ᴏʙsᴄᴜʀɪᴛᴇ́.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      
    } else {
      const etat = isCurrentlyOn ? 'ᴀᴄᴛɪғ' : 'ɪɴᴀᴄᴛɪғ';
      await reply(`*〆 ᴇ́ᴛᴀᴛ ᴀᴄᴛᴜᴇʟ :* ${etat}\n*ᴜsᴀɢᴇ : ${prefix}ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ/ᴏғғ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
