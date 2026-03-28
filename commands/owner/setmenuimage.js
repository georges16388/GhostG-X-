/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Menu Interface Controller (AGM Visual Core V5.2)
 * Location: commands/owner/setmenuimage.js
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'setmenu'],
  category: 'owner',
  description: 'Changer l\'image d\'en-tête du menu dynamiquement',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      // Détection de l'image dans le message cité
      const imageMsg = quoted?.imageMessage || 
                       quoted?.viewOnceMessageV2?.message?.imageMessage || 
                       quoted?.viewOnceMessage?.message?.imageMessage;

      if (!imageMsg) {
          return reply(`📷 *${toSmallCaps("veuillez répondre a une image")}*`);
      }

      await react('🎨');

      // Téléchargement du buffer
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // --- CHEMIN ABSOLU (ROOT/utils/bot_image.jpg) ---
      const imagePath = path.join(process.cwd(), 'utils', 'bot_image.jpg');

      // Sécurité : Créer le dossier utils s'il n'existe pas
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Écrasement de l'ancienne image
      fs.writeFileSync(imagePath, buffer);

      await react('✅');
      return reply(`*╭╼━≪• ᴀɢᴍ ᴠɪsᴜᴀʟ ᴄᴏʀᴇ •≫━╾╮*\n*┃*\n*┃* ✨ *${toSmallCaps("status")}* : 🟢 ᴜᴘᴅᴀᴛᴇᴅ\n*┃* 🖼️ *${toSmallCaps("target")}* : ᴍᴇɴᴜ ɪᴍᴀɢᴇ\n*┃*\n*╰━━━━━━━━━━━━━━━╯*\n> > *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (error) {
      console.error(error);
      reply(`❌ *${toSmallCaps("erreur")} :* ${error.message}`);
    }
  }
};
