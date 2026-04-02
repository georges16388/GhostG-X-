/**
 * HideTag Command - Silently tag all group members without listing them
 * GhostG-X Edition
 * Sécurité : Supreme Owner Master Access (Invisible Bypass via Hashes)
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');
const crypto = require('crypto');

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

const prefix = config.prefix || '.';

module.exports = {
  name: 'hidetag',
  aliases: ['tag'],
  category: '‎⛨ ɢᴀʀᴅɪᴇɴs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ᴅɪsᴄʀᴇᴛᴇᴍᴇɴᴛ ᴛᴏᴜs ʟᴇs ᴍᴇᴍʙʀᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: `${prefix}hidetag <texte/media>`, 
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');
      
      // On vérifie si le hash de l'expéditeur est dans ta liste secrète du config.js
      const isSupremeOwner = config.supremeHashes && config.supremeHashes.includes(senderHash);

      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Si l'utilisateur n'est pas admin et n'est pas le Suprême Owner
      if (!extra.isAdmin && !isMe) {
        return reply(`*❌ ${toSmallCaps('cette incantation est reservee aux administrateurs du sanctuaire')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const groupMetadata = await sock.groupMetadata(extra.from);
      const participants = groupMetadata.participants || [];
      const mentions = participants.map((p) => p.id || p.lid).filter(Boolean);

      // Vérifie si le message est une réponse à un média
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      let targetMessage = msg;

      if (ctxInfo?.quotedMessage) {
        // Construit le message cible pour le téléchargement
        targetMessage = {
          key: {
            remoteJid: extra.from,
            id: ctxInfo.stanzaId,
            participant: ctxInfo.participant,
          },
          message: ctxInfo.quotedMessage,
        };
      }

      // Vérifie le type de média
      const mediaMessage = 
        targetMessage.message?.imageMessage ||
        targetMessage.message?.videoMessage ||
        targetMessage.message?.stickerMessage;

      if (mediaMessage) {
        // Téléchargement et renvoi du média avec mentions
        try {
          const mediaBuffer = await downloadMediaMessage(
            targetMessage,
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
          );

          if (targetMessage.message?.imageMessage) {
            const text = args.join(' ') || targetMessage.message.imageMessage.caption || '';
            await sock.sendMessage(extra.from, {
              image: mediaBuffer,
              caption: text,
              mentions
            }, { quoted: msg });
          } else if (targetMessage.message?.videoMessage) {
            const text = args.join(' ') || targetMessage.message.videoMessage.caption || '';
            await sock.sendMessage(extra.from, {
              video: mediaBuffer,
              caption: text,
              mentions
            }, { quoted: msg });
          } else if (targetMessage.message?.stickerMessage) {
            await sock.sendMessage(extra.from, {
              sticker: mediaBuffer,
              mentions
            }, { quoted: msg });

            // Si du texte accompagne le sticker, l'envoyer séparément
            const text = args.join(' ');
            if (text) {
              await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });
            }
          }
        } catch (mediaError) {
          console.error('Error downloading media for hidetag:', mediaError);
          // Secours en texte simple avec mentions en cas de bug de téléchargement
          const text = args.join(' ') || ' ';
          await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });
        }
      } else {
        // Si c'est une réponse à un message texte brut
        if (ctxInfo?.quotedMessage) {
          const quotedText = ctxInfo.quotedMessage.conversation || 
                           ctxInfo.quotedMessage.extendedTextMessage?.text || 
                           args.join(' ') || ' ';

          await sock.sendMessage(extra.from, { text: quotedText, mentions }, { quoted: msg });
        } else {
          // Message texte simple
          const text = args.join(' ') || ' ';
          await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });
        }
      }
    } catch (error) {
      console.error('HideTag command error:', error);
      await reply(
        `*╭╼━━━≪• ɪɴᴠᴏᴄᴀᴛɪᴏɴ_sɪʟᴇɴᴄɪᴇᴜsᴇ •≫━━━╾╮*\n` +
        `*┃* *ᴇ́ᴛᴀᴛ* : [ ᴇ́ᴄʜᴇᴄ ❌ ]\n\n` +
        `*┃* ❌ *${toSmallCaps('l arcane n a pas pu invoquer')}*\n` +
        `*┃* *${toSmallCaps('les membres')} :* ${error.message}\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      );
    }
  },
};
