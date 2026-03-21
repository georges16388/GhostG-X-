/**
 * Take Command - Smart Identity Edition
 * Fixed Exif Injection for -ɢʜᴏsᴛɢ 𝐗
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');

const AGM_DESIGN = (newPack) => `╭╼━≪• ꜱᴛɪᴄᴋᴇʀ ꜱᴛᴇᴀʟᴇʀ •≫━╾╮
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ʀᴇ-ᴘᴀᴄᴋᴇᴅ
┃ ᴏᴡɴᴇʀ : ${newPack}
┃ ᴍᴏᴅᴇ : ɪᴅ-ᴘʀᴏᴛᴇᴄᴛ ⚡
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`;

module.exports = {
  name: 'take',
  aliases: ['steal', 'wm'],
  category: 'media',
  description: 'Change le nom d\'un sticker.',

  async execute(sock, msg, args, extra) {
    try {
      const { from, quoted, prefix, pushName } = extra;

      if (!quoted || !quoted.stickerMessage) {
        return extra.reply(`🎭 *Répondez à un sticker !*\nEx: ${prefix}take MonNom`);
      }

      await sock.sendMessage(from, { react: { text: "🥷", key: msg.key } });

      // Téléchargement propre
      const mediaBuffer = await downloadMediaMessage(
        { key: msg.message.extendedTextMessage.contextInfo.quotedMessage ? { remoteJid: from, id: msg.message.extendedTextMessage.contextInfo.stanzaId } : msg.key, 
          message: quoted },
        'buffer'
      );

      // --- LOGIQUE DE NOM ---
      const botName = "ɢʜᴏꜱᴛɢ-x ʙᴏᴛ";
      const packname = args.length ? args.join(' ') : (pushName || botName);
      const author = "ɢʜᴏꜱᴛ-x";

      // --- INJECTION EXIF SÉCURISÉE ---
      const img = new webp.Image();
      await img.load(mediaBuffer);

      const json = {
        "sticker-pack-id": `ghost-${Date.now()}`,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": ["💠"]
      };

      // Construction du buffer EXIF standardisé
      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const result = await img.save(null);

      await sock.sendMessage(from, { sticker: result }, { quoted: msg });
      await extra.reply(AGM_DESIGN(packname));

    } catch (error) {
      console.error('Take error:', error);
      await extra.reply('❌ Erreur lors de la modification du sticker.');
    }
  }
};
