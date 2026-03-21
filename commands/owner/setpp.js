/**
 * Bot Avatar Controller - AGM Identity Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM (AVATAR STYLE) ---
const AGM_PP = (status) => `╭╼━≪• ᴀɢᴍ ɪᴅᴇɴᴛɪᴛʏ •≫━╾╮
┃ sʏsᴛᴇᴍ : ᴘʀᴏғɪʟᴇ ᴘɪᴄ 🖼️
┃ sᴛᴀᴛᴜs : ${status}
┃ ᴀᴄᴛɪᴏɴ : ᴜᴘᴅᴀᴛɪɴɢ...
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setpp',
  aliases: ['setppbot', 'setpic', 'setpp'],
  category: 'owner',
  description: 'Changer la photo de profil du bot',
  usage: '.setbotpp (répondre à une image/sticker)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ.*');

      const mime = quoted.imageMessage || quoted.stickerMessage;
      if (!mime) return extra.reply('❌ *ᴍéᴅɪᴀ ɪɴᴠᴀʟɪᴅᴇ (ɪᴍᴀɢᴇ/sᴛɪᴄᴋᴇʀ ᴜɴɪǫᴜᴇᴍᴇɴᴛ).*');

      await sock.sendMessage(extra.from, { react: { text: '📸', key: msg.key } });
      await extra.reply(AGM_PP('🟠 ɪɴ ᴘʀᴏɢʀᴇss'));

      // Téléchargement
      const stream = await downloadContentFromMessage(mime, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Mise à jour de la PP
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      await sock.updateProfilePicture(botJid, buffer);

      await extra.reply(AGM_PP('✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ'));
      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('SetPP Error:', error);
      await extra.reply('❌ *éᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅᴇ ʟ\'ᴀᴠᴀᴛᴀʀ.*');
    }
  }
};
