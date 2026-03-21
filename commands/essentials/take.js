/**
 * Take Command - Smart Identity Edition
 * Ultra-Fast Fix for -ɢʜᴏsᴛɢ 𝐗
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');

module.exports = {
  name: 'take',
  aliases: ['steal', 'wm'],
  category: 'media',
  description: 'Change le nom d\'un sticker.',

  async execute(sock, msg, args, extra) {
    try {
      const { from, prefix, pushName } = extra;
      
      // Extraction correcte du message cité
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quoted?.stickerMessage;

      if (!sticker) {
        return sock.sendMessage(from, { text: `🎭 *Répondez à un sticker !*\nEx: ${prefix}take MonNom` }, { quoted: msg });
      }

      // Réaction flash
      await sock.sendMessage(from, { react: { text: "🥷", key: msg.key } });

      // Téléchargement Direct & Rapide
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // --- LOGIQUE DE NOM ---
      const packname = args.length ? args.join(' ') : (pushName || "ɢʜᴏꜱᴛɢ-x");
      const author = "ɢʜᴏꜱᴛ-x";

      // --- INJECTION EXIF ---
      const img = new webp.Image();
      await img.load(buffer);

      const json = {
        "sticker-pack-id": `ghost-${Date.now()}`,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": ["💠"]
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const result = await img.save(null);

      // Envoi du sticker et du message de succès
      await sock.sendMessage(from, { sticker: result }, { quoted: msg });
      
      const successMsg = `╭╼━≪• ꜱᴛɪᴄᴋᴇʀ ꜱᴛᴇᴀʟᴇʀ •≫━╾╮\n┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ʀᴇ-ᴘᴀᴄᴋᴇᴅ\n┃ ᴏᴡɴᴇʀ : ${packname}\n╰━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`;
      
      await sock.sendMessage(from, { text: successMsg }, { quoted: msg });

    } catch (error) {
      console.error('Take error:', error);
      await sock.sendMessage(extra.from, { text: '❌ Erreur : Assurez-vous d\'avoir installé "node-webpmux"' });
    }
  }
};
