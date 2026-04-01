/**
 * Block Command - GhostG-X Edition
 * Bannit et condamne une âme dans le sanctuaire
 */

const config = require('../../config'); // Importation de la configuration

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ᴄᴏɴᴅᴀᴍɴᴇʀ',
  aliases: ['condamner', 'block', 'ban', 'sceller'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴇᴍᴘᴇ̂ᴄʜᴇ ᴀ̀ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴅ\'ᴜᴛɪʟɪsᴇʀ ʟᴇ ʙᴏᴛ*',
  usage: `${prefix}ᴄᴏɴᴅᴀᴍɴᴇʀ @ᴜsᴇʀ ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;
    const chatId = msg.key.remoteJid;

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴍᴀɴɪᴇʀ ʟᴀ ᴊᴜsᴛɪᴄᴇ.*');

    try {
      let target;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // Extraction de la cible (mention ou message cité)
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } else if (ctx?.participant) {
        target = ctx.participant;
      } else {
        return reply(`*〆 ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ ᴘᴏᴜʀ ʟᴀ ᴄᴏɴᴅᴀᴍɴᴇʀ !*\n*ᴜsᴀɢᴇ : ${prefix}ᴄᴏɴᴅᴀᴍɴᴇʀ @ᴜsᴇʀ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Application du blocage au niveau de l'instance WhatsApp
      await sock.updateBlockStatus(target, 'block');

      // Message de confirmation avec mention
      await sock.sendMessage(chatId, {
        text: `*⚖️ ʟ\'ᴀ̂ᴍᴇ ᴅᴇ @${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ᴄᴏɴᴅᴀᴍɴᴇ́ᴇ ᴇᴛ ʙᴀɴɴɪᴇ ᴅᴇs ᴀʀᴄᴀɴᴇs !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[block cmd] error:', error);
      await reply(`*〆 ʟᴀ sᴇɴᴛᴇɴᴄᴇ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
