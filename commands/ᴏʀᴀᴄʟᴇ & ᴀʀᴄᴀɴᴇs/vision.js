/**
 * GPT Image Command - GhostG-X Edition
 * Edit image using GPT Vision with prompt
 */

const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { webp2png } = require('../../utils/webp2mp4');
const sharp = require('sharp');
const config = require('../../config');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'vision',
  aliases: ['gptimg', 'editimage', 'aiimage', 'gi', 'gptimage', 'ᴠɪsɪᴏɴ'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀɴsᴍᴜᴛᴇ ᴜɴᴇ ɪᴍᴀɢᴇ ᴠɪᴀ ʟᴀʟᴄʜɪᴍɪᴇ ᴅᴇ ʟɪᴀ (ɢᴘᴛ ᴠɪsɪᴏɴ)**',
  usage: `${config.prefix || '.'}vision [murmure] (repondre a une image)`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const { reply } = extra;

    try {
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctxInfo?.quotedMessage) {
        return reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃ 🔮 *${toSmallCaps('reponds a une image')}*\n` +
          `┃ *${toSmallCaps('avec un murmure de modification')} !*\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const prompt = args.join(' ').trim();
      if (!prompt) {
        return reply(`*❌ ${toSmallCaps('invocation incomplete dictes un murmure pour la transmutation')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const quotedMsg = ctxInfo.quotedMessage;
      const isImage = !!quotedMsg.imageMessage;
      const isSticker = !!quotedMsg.stickerMessage;

      if (!isImage && !isSticker) {
        return reply(`*❌ ${toSmallCaps('aucun support visuel detecte repondez a une image ou un sticker')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      // Réaction avec l'orbe de transmutation
      await sock.sendMessage(chatId, {
        react: { text: '⏳', key: msg.key }
      });

      const targetMessage = {
        key: {
          remoteJid: chatId,
          id: ctxInfo.stanzaId,
          participant: ctxInfo.participant,
        },
        message: quotedMsg,
      };

      const mediaBuffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage },
      );

      if (!mediaBuffer) {
        return reply(`*❌ ${toSmallCaps('echec de saisie impossible de recuperer le support visuel')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      let imageBuffer = mediaBuffer;
      if (isSticker) {
        if (quotedMsg.stickerMessage.isAnimated) {
          return reply(`*❌ ${toSmallCaps('les artefacts animes ne sont pas supportes')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }
        imageBuffer = await webp2png(mediaBuffer);
      }

      let finalImageBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();

      const form = new FormData();
      form.append('image', finalImageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
      form.append('param', prompt);

      const response = await axios.post('https://api.nexray.web.id/ai/gptimage', form, {
        headers: { ...form.getHeaders() },
        responseType: 'arraybuffer',
        timeout: 120000,
      });

      if (!response.data) {
        return reply(`*❌ ${toSmallCaps('loracle na rien renvoye reessayez linvocation')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const resultImageBuffer = Buffer.from(response.data);
      const botName = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x');

      await sock.sendMessage(chatId, {
        image: resultImageBuffer,
        caption: `╭╼━≪• *🎬 ᴀsᴘɪʀᴀᴛɪᴏɴ ʀᴇ́ᴜssɪᴇ* •≫━╾╮\n` +
                 `┃ 🔮 *${toSmallCaps('extrait par')} :* ${botName}\n` +
                 `┃ 🔗 *${toSmallCaps('source')} :* ɢᴘᴛᴠɪsɪᴏɴ\n` +
                 `┃ 🔖 *${toSmallCaps('prompt')} :* ${toSmallCaps(prompt)}\n` +
                 `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      }, { quoted: msg });

    } catch (error) {
      console.error('GPT Image error:', error);
      return reply(`*❌ ${toSmallCaps('lalchimie a echoue')} : ${toSmallCaps(error.message || 'erreur inconnue')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  },
};
