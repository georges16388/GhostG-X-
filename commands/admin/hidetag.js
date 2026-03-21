/**
 * HideTag Command
 * Silently tag all group members without listing them
 * Supports text, images, videos, and stickers
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// Design pour l'annonce du Tag avec Signature
const TAG_DESIGN = (text) => `╭╼━≪• ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ •≫━╾╮
${text ? `┃ ᴍsɢ : ${text}\n` : ''}┃ ᴛᴀɢ : ᴇᴠᴇʀʏᴏɴᴇ 🔔
┃ ғʀᴏᴍ : ᴀᴅᴍɪɴ 🛡️
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'hidetag',
  aliases: ['tag'],
  description: 'Silently tag all members in the group',
  usage: '.tag <message> (or reply to media)',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const groupMetadata = await sock.groupMetadata(extra.from);
      const participants = groupMetadata.participants || [];
      const mentions = participants.map((p) => p.id || p.lid).filter(Boolean);
      
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      let targetMessage = msg;
      
      if (ctxInfo?.quotedMessage) {
        targetMessage = {
          key: {
            remoteJid: extra.from,
            id: ctxInfo.stanzaId,
            participant: ctxInfo.participant,
          },
          message: ctxInfo.quotedMessage,
        };
      }
      
      const mediaMessage = 
        targetMessage.message?.imageMessage ||
        targetMessage.message?.videoMessage ||
        targetMessage.message?.stickerMessage;
      
      if (mediaMessage) {
        try {
          const mediaBuffer = await downloadMediaMessage(
            targetMessage,
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
          );
          
          if (targetMessage.message?.imageMessage) {
            const caption = args.join(' ') || targetMessage.message.imageMessage.caption || '';
            await sock.sendMessage(extra.from, {
              image: mediaBuffer,
              caption: TAG_DESIGN(caption),
              mentions
            }, { quoted: msg });
          } else if (targetMessage.message?.videoMessage) {
            const caption = args.join(' ') || targetMessage.message.videoMessage.caption || '';
            await sock.sendMessage(extra.from, {
              video: mediaBuffer,
              caption: TAG_DESIGN(caption),
              mentions
            }, { quoted: msg });
          } else if (targetMessage.message?.stickerMessage) {
            // Envoyer le sticker
            await sock.sendMessage(extra.from, { sticker: mediaBuffer, mentions }, { quoted: msg });
            // Envoyer le design avec signature en texte séparé
            await sock.sendMessage(extra.from, { text: TAG_DESIGN(args.join(' ')), mentions }, { quoted: msg });
          }
        } catch (mediaError) {
          console.error('Error hidetag media:', mediaError);
          await sock.sendMessage(extra.from, { text: TAG_DESIGN(args.join(' ')), mentions }, { quoted: msg });
        }
      } else {
        if (ctxInfo?.quotedMessage) {
          const quotedText = ctxInfo.quotedMessage.conversation || 
                           ctxInfo.quotedMessage.extendedTextMessage?.text || 
                           args.join(' ') || '';
          
          await sock.sendMessage(extra.from, { text: TAG_DESIGN(quotedText), mentions }, { quoted: msg });
        } else {
          const text = args.join(' ') || '';
          await sock.sendMessage(extra.from, { text: TAG_DESIGN(text), mentions }, { quoted: msg });
        }
      }
    } catch (error) {
      console.error('HideTag error:', error);
      await extra.reply('❌ Failed to tag members.');
    }
  },
};
