/**
 * Take Command - Smart Identity Edition (V5.3)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');

module.exports = {
  name: 'take',
  aliases: ['t', 'steal', 'wm', 'wmsticker'],
  category: 'media',
  description: 'Change le nom et l\'auteur d\'un sticker instantanément.',
  usage: '.take [Pack | Auteur]',

  async execute(sock, msg, args, { from, pushName, react, reply }) {
    try {
      // 1. Détection du sticker cité
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quoted?.stickerMessage;

      if (!sticker) {
        return reply('🎭 *ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴘᴏᴜʀ ᴄʜᴀɴɢᴇʀ sᴏɴ ɴᴏᴍ !*');
      }

      await react("🥷");

      // 2. Téléchargement via Baileys Utils (Plus stable)
      const buffer = await downloadMediaMessage(
        { message: quoted },
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      // 3. Logique d'arguments intelligente (Séparateur '|')
      let packName = "ɢʜᴏꜱᴛɢ-x ᴍᴅ";
      let authorName = pushName || "ɢʜᴏꜱᴛ-x ʙᴏᴛ";

      if (args.length > 0) {
        const fullArgs = args.join(' ');
        if (fullArgs.includes('|')) {
          [packName, authorName] = fullArgs.split('|').map(v => v.trim());
        } else {
          packName = fullArgs;
        }
      }

      // 4. Injection des EXIF
      const img = new webp.Image();
      await img.load(buffer);

      const json = {
        "sticker-pack-id": `ghost-${Date.now()}`,
        "sticker-pack-name": packName,
        "sticker-pack-publisher": authorName,
        "emojis": ["💠", "✨"]
      };

      // Header EXIF standard pour WhatsApp
      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const result = await img.save(null);

      // 5. Envoi final
      await sock.sendMessage(from, { sticker: result }, { quoted: msg });
      await react("✅");

    } catch (error) {
      console.error('Take error:', error);
      reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ᴍᴏᴅɪғɪᴄᴀᴛɪᴏɴ.*');
    }
  }
};
