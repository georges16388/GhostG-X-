/**
 * Unblock Command - GhostG-X Edition
 * Débloque une âme dans le sanctuaire
 */

const config = require('../../config'); // Importation de la configuration

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ᴅᴇʙᴀɴɴɪssᴇᴍᴇɴᴛ',
  aliases: ['debannissement', 'unblock', 'debloquer', 'deban','libérer', 'lib'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇᴠᴏǫᴜᴇ ʟᴇ ʙᴀɴɴɪssᴇᴍᴇɴᴛ ᴅ\'ᴜɴᴇ ᴀ̂ᴍᴇ**',
  usage: `${prefix}ᴅᴇʙᴀɴɴɪssᴇᴍᴇɴᴛ @ᴜsᴇʀ ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ`,

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
        return reply(`*〆 ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ ᴍᴇɴᴛɪᴏɴ ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴᴇ ᴀ̂ᴍᴇ ᴘᴏᴜʀ ʟᴀ ᴅᴇ́ʙᴀɴɴɪʀ !*\n*ᴜsᴀɢᴇ : ${prefix}ᴅᴇʙᴀɴɴɪssᴇᴍᴇɴᴛ @ᴜsᴇʀ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Rituel de déblocage via Baileys
      await sock.updateBlockStatus(target, 'unblock');

      // Message de confirmation avec mention
      await sock.sendMessage(chatId, {
        text: `*✅ ʟ\'ᴀ̂ᴍᴇ ᴅᴇ @${target.split('@')[0]} ᴀ ᴇ́ᴛᴇ́ ʟɪʙᴇ́ʀᴇ́ᴇ ᴅᴇs ᴀʀᴄᴀɴᴇs !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
        mentions: [target]
      }, { quoted: msg });

    } catch (error) {
      console.error('[unblock cmd] error:', error);
      await reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
