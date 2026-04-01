/**
 * GetPP Command - Get profile picture of a user
 */

const config = require('../../config.js');

module.exports = {
  name: 'ɢᴇᴛᴘᴘ',
  aliases: ['gp', 'getpic', 'pp', 'getpp'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ʀᴇ́ᴄᴜᴘᴇ̀ʀᴇ ʟᴀ ᴘʜᴏᴛᴏ ᴅᴇ ᴘʀᴏꜰɪʟ ᴅ\'ᴜɴ ᴜᴛɪʟɪꜱᴀᴛᴇᴜʀ**',
  usage: '.ɢᴇᴛᴘᴘ',

  async execute(sock, msg, args, extra) {
    const prefix = config.prefix || '.';

    try {
      let targetUser = null;

      // Extraction de la cible (Reply ou Tag)
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      if (mentioned && mentioned.length > 0) {
        targetUser = mentioned[0];
      } else if (ctx?.participant) {
        targetUser = ctx.participant;
      } else {
        // Si rien, on prend l'auteur du message
        targetUser = extra.sender;
      }

      if (!targetUser) {
        return extra.reply(`❌ *ᴠᴇᴜɪʟʟᴇᴢ ᴍᴇɴᴛɪᴏɴɴᴇʀ ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ʟ'ɪɴᴅɪᴠɪᴅᴜ !*\n\n*ᴇxᴇᴍᴘʟᴇ : ${prefix}ɢᴇᴛᴘᴘ @user*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      try {
        // Tentative de récupération de l'URL
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');

        if (!ppUrl) {
          return extra.reply(`❌ *ɪᴍᴀɢᴇ ᴅᴇ ᴘʀᴏғɪʟ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ ᴘᴏᴜʀ ᴄᴇᴛ ɪɴᴅɪᴠɪᴅᴜ* !\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // Envoi direct de la photo de profil via l'URL (plus rapide)
        await sock.sendMessage(extra.from, { 
          image: { url: ppUrl },
          caption: `👤 *ɪᴍᴀɢᴇ ᴅᴇ ᴘʀᴏғɪʟ ᴅᴇ* @${targetUser.split('@')[0]}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
          mentions: [targetUser]
        }, { quoted: msg });

      } catch (profileError) {
        // Gestion propre des restrictions de confidentialité WhatsApp
        return extra.reply(`❌ *ɪᴍᴀɢᴇ ᴅᴇ ᴘʀᴏғɪʟ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ ᴏᴜ ᴘʀɪᴠᴇ́ᴇ* !\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

    } catch (error) {
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
