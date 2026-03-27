/**
 * Menu Interface Controller - AGM Visual Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const AGM_VISUAL = (status) => `╭╼━≪• ᴀɢᴍ ᴠɪsᴜᴀʟ ᴄᴏʀᴇ •≫━╾╮
┃ sʏsᴛᴇᴍ : ᴍᴇɴᴜ ɪɴᴛᴇʀғᴀᴄᴇ 🖼️
┃ sᴛᴀᴛᴜs : ${status}
┃ ᴀᴄᴛɪᴏɴ : sʏɴᴄɪɴɢ...
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'setmenu'],
  category: 'owner',
  description: 'Changer l\'image d\'en-tête du menu',
  usage: '.setmenuimage (répondre à une image)',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      // On récupère l'image (normale ou vue unique)
      const img = quoted?.imageMessage || quoted?.viewOnceMessageV2?.message?.imageMessage;

      if (!img) {
        return sock.sendMessage(from, { text: '📷 *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ.*' }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });
      
      // Téléchargement ultra-rapide via Stream
      const stream = await downloadContentFromMessage(img, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Chemin vers l'image utilisée par ta commande .menu
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      // Vérification du dossier utils (sécurité)
      const utilsDir = path.dirname(imagePath);
      if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

      // Sauvegarde et écrasement immédiat
      fs.writeFileSync(imagePath, buffer);

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      await sock.sendMessage(from, { text: AGM_VISUAL('✅ ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ') }, { quoted: msg });

    } catch (error) {
      console.error('SetMenuImg Error:', error);
      await sock.sendMessage(extra.from, { text: `❌ *ᴇʀʀᴇᴜʀ : ${error.message}*` }, { quoted: msg });
    }
  }
};
