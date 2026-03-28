/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - Menu Interface Controller (AGM Visual Core V5.2)
 * Instant Media Update System
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_VISUAL_DESIGN = (status) => `*╭╼━≪• ᴀɢᴍ ᴠɪsᴜᴀʟ ᴄᴏʀᴇ •≫━╾╮*
*┃*
*┃* 🖼️ *${toSmallCaps('sʏsᴛᴇᴍ')}* : ᴍᴇɴᴜ ɪɴᴛᴇʀғᴀᴄᴇ
*┃* ✨ *${toSmallCaps('sᴛᴀᴛᴜs')}* : ${status}
*┃* ⚡ *${toSmallCaps('ᴀᴄᴛɪᴏɴ')}* : sʏɴᴄ ᴄᴏᴍᴘʟᴇᴛᴇ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'setmenuimage',
  aliases: ['setmenuimg', 'setmenu', 'setimage'],
  category: 'owner',
  description: 'Changer l\'image d\'en-tête du menu',
  usage: '.setmenuimage (répondre à une image)',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // Détection de l'image (normale, vue unique V1 ou V2)
      const imageMsg = quoted?.imageMessage || 
                       quoted?.viewOnceMessageV2?.message?.imageMessage || 
                       quoted?.viewOnceMessage?.message?.imageMessage;

      if (!imageMsg) {
        return reply(`📷 *${toSmallCaps("veuillez répondre a une image")}*`);
      }

      await react('🎨');

      // Téléchargement sécurisé
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Chemin absolu vers l'image du menu
      const imagePath = path.join(process.cwd(), 'utils', 'bot_image.jpg');

      // Création du dossier si manquant
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Écriture du fichier
      fs.writeFileSync(imagePath, buffer);

      await react('✅');
      return reply(AGM_VISUAL_DESIGN('✅ ᴍᴇɴᴜ ɪᴍᴀɢᴇ ᴜᴘᴅᴀᴛᴇᴅ'));

    } catch (error) {
      console.error('[SETMENUIMG ERROR]:', error);
      reply(`❌ *${toSmallCaps("erreur")} :* ${error.message}`);
    }
  }
};
