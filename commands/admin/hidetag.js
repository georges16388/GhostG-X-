/**
 * HideTag Command - Ghost Mode Elite
 * Silently tag all members and clean the command message.
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// --- DESIGN ANNONCE AGM (LABELS FIXES) ---
const TAG_DESIGN = (text) => {
  const content = text ? `\n*┃* 📝 *ᴍsɢ* : *${text}*` : '';
  return `*╭╼━≪• ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ •≫━╾╮*
*┃*${content}
*┃* 🔔 *ᴛᴀɢ* : *ᴇᴠᴇʀʏᴏɴᴇ*
*┃* 🛡️ *ꜰʀᴏᴍ* : *ᴀᴅᴍɪɴ*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'hidetag',
  aliases: ['tag', 'hidet', 'tg'],
  category: 'admin',
  description: 'Tague tous les membres sans liste visible et efface la commande.',
  usage: '.hidetag <message> (ou répondre à un média)',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,

  async execute(sock, msg, args, { from, reply }) {
    try {
      // 1. Récupération des membres pour le tag invisible
      const metadata = await sock.groupMetadata(from);
      const mentions = metadata.participants.map(p => p.id);
      const messageText = args.join(' ');

      // 2. EFFACE LA COMMANDE (.hidetag) INSTANTANÉMENT
      await sock.sendMessage(from, { delete: msg.key });

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      let targetMessage = msg;

      // Gestion si l'utilisateur répond à un message existant
      if (ctxInfo?.quotedMessage) {
        targetMessage = {
          key: { 
            remoteJid: from, 
            id: ctxInfo.stanzaId, 
            participant: ctxInfo.participant 
          },
          message: ctxInfo.quotedMessage
        };
      }

      const mtype = Object.keys(targetMessage.message || {})[0];

      // --- CAS MÉDIA (IMAGE / VIDÉO / STICKER) ---
      if (/image|video|sticker/i.test(mtype)) {
        const buffer = await downloadMediaMessage(
          targetMessage, 
          'buffer', 
          {}, 
          { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        );

        if (/image/i.test(mtype)) {
          await sock.sendMessage(from, { 
            image: buffer, 
            caption: TAG_DESIGN(messageText), 
            mentions 
          });
        } else if (/video/i.test(mtype)) {
          await sock.sendMessage(from, { 
            video: buffer, 
            caption: TAG_DESIGN(messageText), 
            mentions 
          });
        } else if (/sticker/i.test(mtype)) {
          // Les stickers ne supportent pas de légende, on envoie le design après
          await sock.sendMessage(from, { sticker: buffer, mentions });
          if (messageText) await reply(TAG_DESIGN(messageText), { mentions });
        }
      } 
      // --- CAS TEXTE SIMPLE ---
      else {
        // Priorité au texte tapé, sinon au texte du message cité
        const finalMainText = messageText || (ctxInfo?.quotedMessage ? (ctxInfo.quotedMessage.conversation || ctxInfo.quotedMessage.extendedTextMessage?.text) : '');
        
        await sock.sendMessage(from, { 
          text: TAG_DESIGN(finalMainText), 
          mentions 
        });
      }

    } catch (error) {
      console.error('HideTag Ghost Error:', error);
      // Silence radio en cas d'erreur pour ne pas briser l'effet "Ghost"
    }
  }
};
