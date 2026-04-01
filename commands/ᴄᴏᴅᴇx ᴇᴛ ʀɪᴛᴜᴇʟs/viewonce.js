/**
 * ViewOnce Command - Reveal view-once messages
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');

module.exports = {
  name: 'ʀᴇᴠᴇʟᴇʀ',
  aliases: ['readvo', 'read', 'vv', 'readviewonce', 'reveler', 'vv2'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '*ᴅᴇ́ᴠᴏɪʟᴇ ʟᴇs ᴍᴇssᴀɢᴇs ᴀ̀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ* *(ɪᴍᴀɢᴇs/ᴠɪᴅᴇ́ᴏs/ᴀᴜᴅɪᴏ)*',
  usage: '.ʀᴇᴠᴇʟᴇʀ (ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ)',
  
  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;
      
      // CORRECTION : Extraction propre du texte pour détecter précisément la commande utilisée
      const bodyText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.body || 
                       '';
                       
      const prefix = config.prefix || '.';
      const isVV2 = bodyText.trim().toLowerCase().startsWith(`${prefix}vv2`);

      // Try to get contextInfo from different message types
      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await sock.sendMessage(
          chatId,
          { text: `*〆 ɪɴᴠᴏᴄᴀᴛɪᴏɴ ɪɴᴄᴏᴍᴘʟᴇ̀ᴛᴇ : ʀᴇ́ᴘᴏɴᴅᴇᴢ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀ̀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ ᴘᴏᴜʀ ʟᴇ ᴅᴇ́ᴠᴏɪʟᴇʀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` },
          { quoted: msg }
        );
      }

      const quotedMsg = ctx.quotedMessage;

      // Check various patterns used for view-once messages
      const hasViewOnce =
        !!quotedMsg.viewOnceMessageV2 ||
        !!quotedMsg.viewOnceMessageV2Extension ||
        !!quotedMsg.viewOnceMessage ||
        !!quotedMsg.viewOnce ||
        !!quotedMsg?.imageMessage?.viewOnce ||
        !!quotedMsg?.videoMessage?.viewOnce ||
        !!quotedMsg?.audioMessage?.viewOnce;

      if (!hasViewOnce) {
        return await sock.sendMessage(
          chatId,
          { text: `*〆 ᴄᴇ ᴍᴇssᴀɢᴇ ɴᴇ ᴘᴏssᴇ̀ᴅᴇ ᴘᴀs ʟᴇ sᴄᴇᴀᴜ ᴅᴇ ʟᴀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` },
          { quoted: msg }
        );
      }

      let actualMsg = null;
      let mtype = null;

      if (quotedMsg.viewOnceMessageV2Extension?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2Extension.message;
        mtype = Object.keys(actualMsg)[0];
      } else if (quotedMsg.viewOnceMessageV2?.message) {
        actualMsg = quotedMsg.viewOnceMessageV2.message;
        mtype = Object.keys(actualMsg)[0];
      } else if (quotedMsg.viewOnceMessage?.message) {
        actualMsg = quotedMsg.viewOnceMessage.message;
        mtype = Object.keys(actualMsg)[0];
      } else if (quotedMsg.imageMessage?.viewOnce) {
        actualMsg = { imageMessage: quotedMsg.imageMessage };
        mtype = 'imageMessage';
      } else if (quotedMsg.videoMessage?.viewOnce) {
        actualMsg = { videoMessage: quotedMsg.videoMessage };
        mtype = 'videoMessage';
      } else if (quotedMsg.audioMessage?.viewOnce) {
        actualMsg = { audioMessage: quotedMsg.audioMessage };
        mtype = 'audioMessage';
      }

      if (!actualMsg || !mtype) {
        return await sock.sendMessage(
          chatId,
          { text: `*〆 ᴛʏᴘᴇ ᴅᴇ sᴄᴇᴀᴜ ɴᴏɴ sᴜᴘᴘᴏʀᴛᴇ́ ᴘᴀʀ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*` },
          { quoted: msg }
        );
      }

      const downloadType =
        mtype === 'imageMessage' ? 'image'
        : mtype === 'videoMessage' ? 'video'
        : 'audio';

      // ── MODE VV2 : suppression silencieuse + envoi en inbox owner ──
      if (isVV2) {
        // 1. Supprimer la commande du chat pour ne pas laisser de traces
        try {
          await sock.sendMessage(chatId, { delete: msg.key });
        } catch (delError) {
          console.error('Failed to delete message:', delError.message);
        }

        // 2. Télécharger le média
        const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
        let buffer = Buffer.from([]);
        for await (const chunk of mediaStream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = actualMsg[mtype]?.caption || '';

        // 3. Récupérer le JID de l'owner depuis config.js et s'assurer qu'il est au bon format
        const ownerNumber = config.owner || config.ownerNumber || config.OWNER || '22651622652';
        const cleanNumber = ownerNumber.toString().replace(/[^0-9]/g, '');
        const ownerJid = `${cleanNumber}@s.whatsapp.net`;

        // 4. Envoyer en inbox owner
        if (/video/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            video: buffer,
            caption: caption
              ? `*〆 ᴍᴜʀᴍᴜʀᴇ ᴅᴇ́ᴄᴏᴅᴇ́ :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
              : `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
            mimetype: 'video/mp4'
          });
        } else if (/image/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            image: buffer,
            caption: caption
              ? `*〆 ᴍᴜʀᴍᴜʀᴇ ᴅᴇ́ᴄᴏᴅᴇ́ :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
              : `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
            mimetype: 'image/jpeg'
          });
        } else if (/audio/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            audio: buffer,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
          });
        }

        return; // Fin du mode vv2, pas d'affichage dans le groupe
      }

      // ── MODE VV (classique) ──
      await sock.sendMessage(
        chatId,
        { text: `*☬ ᴅɪssɪᴘᴀᴛɪᴏɴ ᴅᴇ ʟ'ɪʟʟᴜsɪᴏɴ ᴇɴ ᴄᴏᴜʀs...*` },
        { quoted: msg }
      );

      const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = actualMsg[mtype]?.caption || '';

      if (/video/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            video: buffer,
            caption: caption
              ? `*〆 ᴍᴜʀᴍᴜʀᴇ ᴅᴇ́ᴄᴏᴅᴇ́ :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
              : `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
            mimetype: 'video/mp4'
          },
          { quoted: msg }
        );
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            image: buffer,
            caption: caption
              ? `*〆 ᴍᴜʀᴍᴜʀᴇ ᴅᴇ́ᴄᴏᴅᴇ́ :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
              : `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`,
            mimetype: 'image/jpeg'
          },
          { quoted: msg }
        );
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            audio: buffer,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
          },
          { quoted: msg }
        );
      }

    } catch (error) {
      console.error('Error in viewonce command:', error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `*〆 ʟ'ɪʟʟᴜsɪᴏɴ ᴀ ʀᴇ́sɪsᴛᴇ́. ᴇ́ᴄʜᴇᴄ ᴅᴇ ʟᴀ ʀᴇ́ᴠᴇ́ʟᴀᴛɪᴏɴ.*\n*ᴇʀʀᴇᴜʀ : ${error.message}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        },
        { quoted: msg }
      );
    }
  }
};
