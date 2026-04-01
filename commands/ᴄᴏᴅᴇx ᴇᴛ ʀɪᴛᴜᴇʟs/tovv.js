/**
 * ToVV Command - Convert normal media to View-Once & Delete Original (Universal)
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');

// Fonction pour le style Small Caps
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
  name: 'ᴛᴏᴠᴠ',
  aliases: ['tovv', 'makevo', 'setviewonce', 'vo'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴄᴏɴᴠᴇʀᴛɪᴛ ᴜɴ ᴍᴇ́ᴅɪᴀ ɴᴏʀᴍᴀʟ ᴇɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴠᴜᴇ ᴜɴɪQᴜᴇ ᴇᴛ sᴜᴘᴘʀɪᴍᴇ ʟ\'ᴏʀɪɢɪɴᴀʟ**',
  usage: 'ᴛᴏᴠᴠ',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');

      // Extraction du contexte pour trouver le message cité
      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await extra.reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('repondez a une image ou une video')}*\n` +
          `┃ *${toSmallCaps('pour lenfermer dans la vue unique')} !*\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const quotedMsg = ctx.quotedMessage;
      let mtype = null;
      let actualMsg = null;

      // Détection du type de média cité
      if (quotedMsg.imageMessage) {
        mtype = 'imageMessage';
        actualMsg = quotedMsg.imageMessage;
      } else if (quotedMsg.videoMessage) {
        mtype = 'videoMessage';
        actualMsg = quotedMsg.videoMessage;
      }

      if (!mtype || !actualMsg) {
        return await extra.reply(
          `╭╼━≪• *❌ sᴄᴇᴀᴜ ɪɴᴠᴀʟɪᴅᴇ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🥀 *${toSmallCaps('le message cite n est pas')}*\n` +
          `┃ *${toSmallCaps('un media convertible')} (ɪᴍᴀɢᴇ/ᴠɪᴅᴇ́ᴏ).* \n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const downloadType = mtype === 'imageMessage' ? 'image' : 'video';

      // 1. Téléchargement du média d'origine en mémoire tampon
      const mediaStream = await downloadContentFromMessage(actualMsg, downloadType);
      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = actualMsg.caption || '';

      // 2. DISCRÉTION ABSOLUE : Suppression du message de commande (.tovv)
      try {
        await sock.sendMessage(chatId, { delete: msg.key });
      } catch (delError) {
        console.error('Failed to delete command message:', delError.message);
      }

      // 3. EFFACEMENT DU GRIMOIRE : Suppression du média d'origine
      try {
        let deleteObj = {
          remoteJid: chatId,
          fromMe: ctx.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
          id: ctx.stanzaId
        };

        // Si on est dans un groupe, Baileys a besoin du paramètre participant
        if (isGroup) {
          deleteObj.participant = ctx.participant;
        }

        await sock.sendMessage(chatId, { delete: deleteObj });
      } catch (delMediaError) {
        console.error('Failed to delete original media:', delMediaError.message);
      }

      // 4. Envoi du média sous le sceau de la Vue Unique (ViewOnce)
      if (mtype === 'videoMessage') {
        await sock.sendMessage(chatId, {
          video: buffer,
          caption: caption,
          mimetype: 'video/mp4',
          viewOnce: true
        });
      } else if (mtype === 'imageMessage') {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: caption,
          mimetype: 'image/jpeg',
          viewOnce: true
        });
      }

    } catch (error) {
      console.error('Error in tovv command:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${toSmallCaps('impossible d enfermer ce media')}`);
    }
  }
};
