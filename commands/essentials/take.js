/**
 * Take Command - Smart Identity Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (newPack) => `╭╼━≪• sᴛɪᴄᴋᴇʀ sᴛᴇᴀʟᴇʀ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇ-ᴘᴀᴄᴋᴇᴅ
┃ ᴏᴡɴᴇʀ : ${newPack.length > 15 ? newPack.substring(0, 12) + '...' : newPack}
┃ ᴍᴏᴅᴇ : ɪᴅ-ᴘʀᴏᴛᴇᴄᴛ ⚡
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'take',
  aliases: ['steal', 'wm'],
  description: 'Steal a sticker and change its packname (User or Bot name)',
  usage: '.take [optionnel: nom] (répondre à un sticker)',
  category: 'media',
  
  async execute(sock, msg, args, extra) {
    let targetMessage = msg;
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
    
    if (ctxInfo?.quotedMessage) {
      targetMessage = {
        key: { remoteJid: extra.from, id: ctxInfo.stanzaId, participant: ctxInfo.participant },
        message: ctxInfo.quotedMessage,
      };
    }
    
    const stickerMsg = targetMessage.message?.stickerMessage;
    if (!stickerMsg) {
      return extra.reply('🎭 *ʀéᴘᴏɴᴅᴇᴢ à ᴜɴ sᴛɪᴄᴋᴇʀ ᴀᴠᴇᴄ .ᴛᴀᴋᴇ.*');
    }

    await sock.sendMessage(extra.from, { react: { text: "🥷", key: msg.key } });
    
    try {
      const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
      if (!mediaBuffer) throw new Error('Download failed');
      
      // --- LOGIQUE D'IDENTITÉ ---
      const botName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";
      let packname;

      if (args.length) {
        // 1. Priorité à l'argument tapé
        packname = args.join(' ');
      } else if (msg.pushName && msg.pushName !== '') {
        // 2. Sinon le pseudo de l'utilisateur
        packname = msg.pushName;
      } else {
        // 3. Si anonyme, le nom du bot
        packname = botName;
      }
      
      const img = new webp.Image();
      await img.load(mediaBuffer);
      
      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': botName, // Ton nom reste l'éditeur officiel
        'emojis': ['💠']
      };
      
      const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);
      
      img.exif = exif;
      const finalBuffer = await img.save(null);
      
      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });
      await extra.reply(AGM_DESIGN(packname));
      
    } catch (error) {
      console.error('Take command error:', error);
      await extra.reply('❌ *ᴇᴄʜᴇᴄ ᴅᴜ ᴠᴏʟ ᴅᴇ sᴛɪᴄᴋᴇʀ.*');
    }
  },
};
