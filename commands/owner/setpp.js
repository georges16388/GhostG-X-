/**
 * Bot Avatar Controller - AGM Identity Core (Fixed Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

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
  aliases: ['setppbot', 'setpic', 'botpp'],
  category: 'owner',
  description: 'Changer la photo de profil du bot',
  usage: '.setpp (répondre à une image)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      // Extraction sécurisée du message cité (Quoted)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      // On cible l'image ou le sticker
      const imageMessage = quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage;
      
      if (!imageMessage) {
        return sock.sendMessage(from, { text: '⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ.*' }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '📸', key: msg.key } });
      
      // Téléchargement du flux
      const stream = await downloadContentFromMessage(imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Mise à jour de la Photo de Profil (PP)
      // Note: Baileys gère mieux le JID simple du bot
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      
      await sock.updateProfilePicture(botJid, buffer);

      // Réponse de succès
      await sock.sendMessage(from, { text: AGM_PP('✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴜᴘᴅᴀᴛᴇᴅ') }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('SetPP Error:', error);
      await sock.sendMessage(extra.from, { text: '❌ *éᴄʜᴇᴄ : L\'image est peut-être trop lourde ou invalide.*' }, { quoted: msg });
    }
  }
};
