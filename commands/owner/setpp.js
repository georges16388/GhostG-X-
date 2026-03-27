/**
 * Bot Profile Picture Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM ---
const AGM_PP = (status) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴘᴘ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status} 🖼️
┃ ᴜᴘᴅᴀᴛᴇ : 🟢 sᴜᴄᴄᴇss
┃ ᴛᴀsᴋ : ᴘʀᴏғɪʟᴇ ᴜᴘᴅᴀᴛᴇ ⚡
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setbotpp',
  aliases: ['setppbot', 'setpp', 'botpp'],
  category: 'owner',
  description: 'Changer la photo de profil du bot.',
  usage: '.setbotpp (répondre à une image ou un sticker)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const from = msg.key.remoteJid;

    try {
      // 1. Extraction du message cité (Image ou Sticker)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quoted) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ.*');
      }

      const isImage = quoted.imageMessage;
      const isSticker = quoted.stickerMessage;

      if (!isImage && !isSticker) {
        return extra.reply('❌ *ʟᴇ ᴍᴇssᴀɢᴇ ᴅᴏɪᴛ êᴛʀᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ !*');
      }

      const media = isImage || isSticker;

      await sock.sendMessage(from, { react: { text: '📸', key: msg.key } });

      // 2. Téléchargement du média en Buffer
      const stream = await downloadContentFromMessage(media, isImage ? 'image' : 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 3. Mise à jour de la photo de profil
      // Note : Baileys accepte directement un Buffer pour updateProfilePicture
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      
      await sock.updateProfilePicture(botJid, buffer);

      // 4. Feedback avec design AGM
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      await extra.reply(AGM_PP('ᴜᴘᴅᴀᴛᴇᴅ'));

    } catch (error) {
      console.error('[SETBOTPP ERROR]:', error);
      await extra.reply('❌ *éᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅᴇ ʟᴀ ᴘʜᴏᴛᴏ ᴅᴇ ᴘʀᴏғɪʟ.*');
    }
  }
};
