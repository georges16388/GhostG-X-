/**
 * ɢᴘᴛ ɪᴍᴀɢᴇ ᴇᴅɪᴛᴏʀ - ᴀɢᴍ sʏsᴛᴇᴍ ᴀɪ
 * ᴇᴅɪᴛ ɪᴍᴀɢᴇ ᴜsɪɴɢ ɢᴘᴛ ᴠɪsɪᴏɴ ᴡɪᴛʜ ᴘʀᴏᴍᴘᴛ
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');
const sharp = require('sharp');
const config = require('../../config');

module.exports = {
  name: 'gptimage',
  aliases: ['gptimg', 'editimage', 'aiimage', 'vision', 'gi'],
  category: 'ai',
  description: 'ᴍᴏᴅɪꜰɪᴇʀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴀᴠᴇᴄ ʟ\'ɪᴀ ɢᴘᴛ ᴠɪsɪᴏɴ.',
  usage: '.ɢᴘᴛɪᴍᴀɢᴇ <ᴘʀᴏᴍᴘᴛ> (ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ/sᴛɪᴄᴋᴇʀ)',

  async execute(sock, msg, args, { from, reply, react, prefix }) {
    try {
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      
      // ᴠᴇ́ʀɪꜰɪᴄᴀᴛɪᴏɴ sɪ ᴍᴇssᴀɢᴇ ᴄɪᴛᴇ́
            if (!ctxInfo?.quotedMessage) {
        return await reply(
          `╭╼━≪• *ɢᴘᴛ ɪᴍᴀɢᴇ ᴇᴅɪᴛᴏʀ* •≫━╾╮\n` +
          `┃ *ᴛᴀʀɢᴇᴛ* : ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ 📸\n` +
          `┃ *ᴜsᴀɢᴇ* : ${prefix}ɢᴘᴛɪᴍᴀɢᴇ <ᴘʀᴏᴍᴘᴛ>\n` +
          `┃ *ᴇxᴇᴍᴘʟᴇ* : ${prefix}ɢᴘᴛɪᴍᴀɢᴇ ᴀᴊᴏᴜᴛᴇ ᴅᴇs ʟᴜɴᴇᴛᴛᴇs\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `📝 *ɪɴsᴛʀᴜᴄᴛɪᴏɴs :*\n` +
          `ʀᴇ́ᴘᴏɴᴅᴇᴢ ᴀ̀ ᴜɴ ᴍᴇ́ᴅɪᴀ ᴀᴠᴇᴄ ᴜɴᴇ ɪɴsᴛʀᴜᴄᴛɪᴏɴ ᴘᴏᴜʀ ǫᴜᴇ ʟ'ɪᴀ ʟᴇ ᴍᴏᴅɪꜰɪᴇ.\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }


      const prompt = args.join(' ').trim();
      if (!prompt) {
        return await reply(
          '❌ *ᴠᴇᴜɪʟʟᴇᴢ ꜰᴏᴜʀɴɪʀ ᴜɴᴇ ɪɴsᴛʀᴜᴄᴛɪᴏɴ !*\n\n' +
          `ᴇxᴇᴍᴘʟᴇ : ${prefix}ɢᴘᴛɪᴍᴀɢᴇ ᴀᴊᴏᴜᴛᴇ ᴅᴇs ʟᴜɴᴇᴛᴛᴇs ᴅᴇ sᴏʟᴇɪʟ`
        );
      }

      const quotedMsg = ctxInfo.quotedMessage;
      const isImage = !!quotedMsg.imageMessage;
      const isSticker = !!quotedMsg.stickerMessage;

      if (!isImage && !isSticker) {
        return await reply('❌ *ᴠᴇᴜɪʟʟᴇᴢ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ ᴜɴ sᴛɪᴄᴋᴇʀ sᴛᴀᴛɪǫᴜᴇ !*');
      }

      await react('⏳');
      await reply('⏳ *ᴛʀᴀɪᴛᴇᴍᴇɴᴛ ᴅᴇ ʟ\'ɪᴍᴀɢᴇ ᴘᴀʀ ʟ\'ɪᴀ ɢʜᴏsᴛɢ...*');

      const targetMessage = {
        key: {
          remoteJid: from,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: quotedMsg,
      };

      // ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴜ ᴍᴇ́ᴅɪᴀ
      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) return await reply('❌ *ᴇ́ᴄʜᴇᴄ ᴅᴜ ᴛᴇ́ʟᴇ́ᴄʜᴀʀɢᴇᴍᴇɴᴛ.*');

      let imageBuffer = mediaBuffer;

      // ᴄᴏɴᴠᴇʀsɪᴏɴ sɪ sᴛɪᴄᴋᴇʀ
      if (isSticker) {
        if (quotedMsg.stickerMessage.isAnimated) {
          return await reply('❌ *ʟᴇs sᴛɪᴄᴋᴇʀs ᴀɴɪᴍᴇ́s ɴᴇ sᴏɴᴛ ᴘᴀs sᴜᴘᴘᴏʀᴛᴇ́s.*');
        }
        try {
          imageBuffer = await webp2png(mediaBuffer);
        } catch (e) {
          console.error(e);
          return await reply('❌ *ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ ᴄᴏɴᴠᴇʀsɪᴏɴ ᴅᴜ sᴛɪᴄᴋᴇʀ.*');
        }
      }

      // ᴏᴘᴛɪᴍɪsᴀᴛɪᴏɴ ᴀᴠᴇᴄ sʜᴀʀᴘ (ᴊᴘᴇɢ ǫᴜᴀʟɪᴛʏ 90)
      let finalImageBuffer;
      try {
        finalImageBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch (e) {
        finalImageBuffer = imageBuffer;
      }

      // ᴘʀᴇ́ᴘᴀʀᴀᴛɪᴏɴ ᴅᴇs ᴅᴏɴɴᴇ́ᴇs ᴘᴏᴜʀ ʟ'ᴀᴘɪ
      const form = new FormData();
      form.append('image', finalImageBuffer, { filename: 'ghostg_vision.jpg', contentType: 'image/jpeg' });
      form.append('param', prompt);

      const apiUrl = 'https://api.nexray.web.id/ai/gptimage';
      
      const response = await axios.post(apiUrl, form, {
        headers: { 
            ...form.getHeaders(),
            'User-Agent': 'ɢʜᴏsᴛɢ-x ᴍᴅ ᴠ5'
        },
        responseType: 'arraybuffer',
        timeout: 120000 
      });

      if (!response.data || response.data.length === 0) {
        return await reply('❌ *ʟ\'ᴀᴘɪ ɴ\'ᴀ ʀᴇɴᴠᴏʏᴇ́ ᴀᴜᴄᴜɴᴇ ᴅᴏɴɴᴇ́ᴇ.*');
      }

      const resultImageBuffer = Buffer.from(response.data);

      // ᴇɴᴠᴏɪ ᴅᴜ ʀᴇ́sᴜʟᴛᴀᴛ
      await sock.sendMessage(from, {
        image: resultImageBuffer,
        caption: `✨ *ɢᴘᴛ ᴠɪsɪᴏɴ ʀᴇsᴜʟᴛ*\n\n📝 *ɪɴsᴛʀᴜᴄᴛɪᴏɴ :* ${prompt}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`
      }, { quoted: msg });
      
      await react('✅');

    } catch (error) {
      console.error('[ɢᴘᴛɪᴍᴀɢᴇ ᴇʀʀᴏʀ]:', error);
      await react('❌');
      
      const errMsg = error.response ? `ᴇʀʀᴇᴜʀ sᴇʀᴠᴇᴜʀ (${error.response.status})` : error.message;
      return await reply(`❌ *ᴇʀʀᴇᴜʀ :* ${errMsg}`);
    }
  },
};
