/**
 * Take Command
 * Steal a sticker and re-pack with custom or user packname
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');
const config = require('../../config');

module.exports = {
  name: 'ᴜsᴜʀᴘᴇʀ',
  aliases: ['steal', 'usurper', 'take', 't'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴠᴏʟᴇ ᴜɴ ꜱᴛɪᴄᴋᴇʀ ᴇᴛ ᴍᴏᴅɪꜰɪᴇ ʟᴇ ɴᴏᴍ ᴅᴇ ꜱᴏɴ ᴘᴀᴄᴋ**',
  usage: 'ᴜsᴜʀᴘᴇʀ',

  async execute(sock, msg, args, extra) {
    let targetMessage = msg;
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: { 
          remoteJid: extra.from, 
          id: ctxInfo.stanzaId, 
          participant: ctxInfo.participant 
        },
        message: ctxInfo.quotedMessage,
      };
    }

    const stickerMsg = targetMessage.message?.stickerMessage;
    const prefix = config.prefix || '.';
    if (!stickerMsg) {
      return extra.reply(`*🎭 ʀᴇ́ᴘᴏɴᴅᴇᴢ ᴀ̀ ᴜɴ sᴛɪᴄᴋᴇʀ ᴀᴠᴇᴄ ${prefix}ᴜsᴜʀᴘᴇʀ ᴘᴏᴜʀ ᴠᴏᴜs ᴇɴ ᴇᴍᴘᴀʀᴇʀ*\n\n>  *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }

    try {
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) return extra.reply(`*⎔ ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟ'ɪɴᴠᴏᴄᴀᴛɪᴏɴ : ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ sᴀɪsɪʀ ʟᴇ sᴛɪᴄᴋᴇʀ. ʀᴇᴇssᴀɪᴇ.*`);

      const userName = msg.pushName || extra.sender.split('@')[0];
      const packname = args.length ? args.join(' ') : userName;

      const img = new webp.Image();
      await img.load(mediaBuffer);

      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': packname || 'ɢʜᴏsᴛɢ-𝐗',
        emojis: ['🤖'],
      };

      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);

      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

    } catch (error) {
      console.error('Take command error:', error);
      await extra.reply('❌ *ᴇ́ᴄʜᴇᴄ ᴅᴜ ᴠᴏʟ ᴅᴇ sᴛɪᴄᴋᴇʀ. ᴠᴇᴜɪʟʟᴇᴢ ʀᴇ́ᴇssᴀʏᴇʀ.*');
    }
  },
};
