/**
 * Take Command - Smart Identity Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');

module.exports = {
  name: 'take',
  aliases: ['t', 'steal', 'wm', 'wmsticker'],
  category: 'media',
  description: 'Change le nom et l\'auteur d\'un sticker instantanément.',

  async execute(sock, msg, args, extra) {
    try {
      const { from, pushName } = extra;

      // 1. Détection du sticker cité
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quoted?.stickerMessage;

      if (!sticker) {
        return extra.reply('🎭 *ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴘᴏᴜʀ ᴄʜᴀɴɢᴇʀ sᴏɴ ɴᴏᴍ !*');
      }

      // 2. Réaction flash "Ninja"
      await sock.sendMessage(from, { react: { text: "🥷", key: msg.key } });

      // 3. Téléchargement rapide du flux
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 4. Configuration des nouvelles métadonnées
      // Si l'utilisateur écrit .take MonNom, on prend "MonNom". Sinon on prend son pseudo WhatsApp.
      const packname = args.length ? args.join(' ') : (pushName || "ɢʜᴏꜱᴛɢ-x");
      const author = "ɢʜᴏꜱᴛ-x ʙᴏᴛ";

      // 5. Injection des EXIF (Signature GhostG-X)
      const img = new webp.Image();
      await img.load(buffer);

      const json = {
        "sticker-pack-id": `ghost-${Date.now()}`,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": ["💠", "✨"]
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const result = await img.save(null);

      // 6. Envoi direct du sticker modifié (Sans message texte)
      await sock.sendMessage(from, { sticker: result }, { quoted: msg });
      
      // Réaction de succès
      await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
      console.error('Take error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ᴍᴏᴅɪғɪᴄᴀᴛɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ.*');
    }
  }
};
