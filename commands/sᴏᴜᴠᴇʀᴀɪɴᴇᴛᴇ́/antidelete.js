/**
 * Anti-Delete Command - GhostG-X Edition
 * Active ou désactive la vision des messages supprimés
 */

const config = require('../../config'); // Importation de la configuration

module.exports = {
  name: 'ᴀɴᴛɪᴅᴇʟᴇᴛᴇ',
  aliases: ['antisuppression', 'revive'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ʟᴀ ᴠɪsɪᴏɴ ᴅᴇs ᴍᴇssᴀɢᴇs sᴜᴘᴘʀɪᴍᴇ́s*',
  usage: (prefix) => `${prefix}ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ/ᴏғғ`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;
    const prefix = config.prefix || '.'; // Utilisation du préfixe de la config

    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴠᴏɪʀ ʟ\'ɪɴᴠɪsɪʙʟᴇ.*');

    const mode = args[0]?.toLowerCase();

    if (mode === 'on') {
      if (global.antidelete === 'on') {
        return reply('*👁️ ʟ\'ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*');
      }
      global.antidelete = 'on';
      await reply('*👁️ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴀᴄᴛɪᴠᴇ́. ʀɪᴇɴ ɴᴇ ᴍ\'ᴇ́ᴄʜᴀᴘᴘᴇ ᴅᴇ́sᴏʀᴍᴀɪs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    } else if (mode === 'off') {
      if (global.antidelete === 'off' || !global.antidelete) {
        return reply('*🌑 ʟ\'ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*');
      }
      global.antidelete = 'off';
      await reply('*🌑 ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́. ʟᴇs sᴇᴄʀᴇᴛs ʀᴇsᴛᴇʀᴏɴᴛ ᴅᴀɴs ʟ\'ᴏʙsᴄᴜʀɪᴛᴇ́.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    } else {
      const etat = global.antidelete === 'on' ? 'ᴀᴄᴛɪғ' : 'ɪɴᴀᴄᴛɪғ';
      await reply(`*〆 ᴇ́ᴛᴀᴛ ᴀᴄᴛᴜᴇʟ :* ${etat}\n*ᴜsᴀɢᴇ : ${prefix}ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ/ᴏғғ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
