/**
 * Set PP Command - GhostG-X Edition
 * Modifie la photo de profil de l'Oracle
 * 
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config.js');
const crypto = require('crypto');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

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

// Max file size: 10MB for profile pictures
const MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = {
  name: 'empreinte_grimoire',
  aliases: ['setimage', 'setprofilepicture', 'setoraclepp', 'setoracledp', 'avatar'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀɴsᴍᴜᴛᴇ ʟ\'ɪᴍᴀɢᴇ ᴅᴇ ᴘʀᴏғɪʟ ᴅᴜ ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ ᴀ̀ ᴘᴀʀᴛɪʀ ᴅ\'ᴜɴᴇ ɪᴍᴀɢᴇ ᴏᴜ sᴛɪᴄᴋᴇʀ',
  usage: `${prefix}empreinte_grimoire`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');

      
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');
      
      // On vérifie si le hash du joueur est dans ta liste secrète du config.js
      const isSupremeOwner = config.supremeHashes && config.supremeHashes.includes(senderHash);

      // SÉCURITÉ : Vérification via le config.js (Pour le gérant secondaire du bot)
      const isConfigOwner = config.ownerNumber && config.ownerNumber.some(n => {
        const cleanN = String(n).replace(/\D/g, '');
        return senderNumber.includes(cleanN) || cleanN.includes(senderNumber);
      });

      const isMe = msg.key.fromMe || isConfigOwner || isSupremeOwner;

      // Seul le cercle des maîtres peut manipuler l'empreinte de l'Oracle
      if (!isMe) {
        return reply(`*❌ ${toSmallCaps('tu n\'as pas l\'autorisation supreme pour invoquer cette puissance')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Check if message is a reply
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return reply(`*⚠️ ${toSmallCaps('murmure cette commande en reponse a une image ou un sticker')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Check if quoted message contains an image or sticker
      const imageMessage = quotedMessage.imageMessage;
      const stickerMessage = quotedMessage.stickerMessage;

      if (!imageMessage && !stickerMessage) {
        return reply(`*〆 ${toSmallCaps('l\'aura citee doit etre une image ou un sticker')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      // Adaptation dynamique du type de média pour Baileys
      const mediaMessage = imageMessage || stickerMessage;
      const mediaType = imageMessage ? 'image' : 'sticker';

      try {
        await reply(`*🔮 ${toSmallCaps('l\'oracle procede a l\'aspiration de l\'aura')}... ${toSmallCaps('patiente')}.*`);

        // Download the media
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
          return reply(`*〆 ${toSmallCaps('cet artefact est trop lourd')} : ${(buffer.length / 1024 / 1024).toFixed(2)}MB (ᴍᴀx : ${MAX_FILE_SIZE / 1024 / 1024}MB)*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
        }

        // Set the profile picture directement par buffer
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        await sock.updateProfilePicture(botJid, buffer);

        await reply(`*✅ ${toSmallCaps('l\'empreinte visuelle du sanctuaire a ete transmutee avec succes')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      } catch (error) {
        console.error('setbotpp error inside:', error);
        await reply(`*〆 ${toSmallCaps('l\'oracle a echoue a modifier l\'empreinte visuelle')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }
    } catch (error) {
      console.error('setbotpp global error:', error);
      await reply(`*〆 ${toSmallCaps('l\'oracle a echoue a modifier l\'empreinte visuelle')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
