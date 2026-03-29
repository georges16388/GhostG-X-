/**
 * Sticker Command - GhostG-X MD (Silent Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createStickerBuffer } = require('../../utils/sticker'); // On utilise ton moteur existant

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'stc'],
  category: 'media',
  description: 'Convertir image ou vidéo en sticker.',
  usage: '.sticker',

  async execute(sock, msg, args, { from, reply, react, pushName }) {
    try {
      // 🔹 1. DÉTECTION DU MEDIA
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const mime = (quoted || msg.message)?.imageMessage ? 'image' : (quoted || msg.message)?.videoMessage ? 'video' : null;

      if (!mime) {
        return reply(`⚠️ *${toStyledCaps('repondez a une image ou video')}*`);
      }

      await react("🎨");

      // 🔹 2. TÉLÉCHARGEMENT
      const mediaMsg = quoted ? { message: quoted } : msg;
      const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, { 
        logger: undefined, 
        reuploadRequest: sock.updateMediaMessage 
      });

      // 🔹 3. GÉNÉRATION VIA TON UTILS (Gère l'Exif Truth Devices)
      // On utilise pushName pour personnaliser l'auteur du sticker dynamiquement
      const stickerBuffer = await createStickerBuffer(buffer, { 
        pack: "ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs 💠", 
        author: `ɢʜᴏsᴛɢ-𝐗 ( ${pushName} )` 
      });

      // 🔹 4. ENVOI FINAL
      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
      await react("✅");

    } catch (error) {
      console.error('Sticker Error:', error);
      reply(`❌ *${toStyledCaps("erreur lors de la conversion")}*`);
    }
  },
};
