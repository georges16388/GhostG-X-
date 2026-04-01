/**
 * ViewOnce Command - Reveal view-once messages
 * GhostG-X Edition
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');

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
  name: 'reveler',
  aliases: ['readvo', 'read', 'vv', 'readviewonce', 'vv2'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴇᴠᴏɪʟᴇ ʟᴇs ᴍᴇssᴀɢᴇs ᴀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ (ɪᴍᴀɢᴇs/ᴠɪᴅᴇᴏs/ᴀᴜᴅɪᴏ)**',
  usage: `${config.prefix || '.'}reveler (repondre a un message a vue unique)`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      // Extraction propre du texte pour détecter précisément la commande utilisée
      const bodyText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.body || 
                       '';

      const prefix = config.prefix || '.';
      const isVV2 = bodyText.trim().toLowerCase().startsWith(`${prefix}vv2`);

      // Essayer de récupérer contextInfo depuis différents types de messages
      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await sock.sendMessage(
          chatId,
          { text: `*⚠️ ${toSmallCaps('invocation incomplete : repondez a un message a vue unique pour le devoiler')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*` },
          { quoted: msg }
        );
      }

      const quotedMsg = ctx.quotedMessage;

      // Vérifier les patterns utilisés pour les messages à vue unique
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
          { text: `*⚠️ ${toSmallCaps('ce message ne possede pas le sceau de la vue unique')} !*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*` },
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
          { text: `*⚠️ ${toSmallCaps('type de sceau non supporte par le sanctuaire')}.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*` },
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

        // 3. Récupérer le JID de l'owner (Fallback vers tes données de profil si config vide)
        const ownerNumber = config.owner || config.ownerNumber || config.OWNER || '22651622652';
        const cleanNumber = ownerNumber.toString().replace(/[^0-9]/g, '');
        const ownerJid = `${cleanNumber}@s.whatsapp.net`;

        // 4. Envoyer en inbox owner
        const murmureText = `*〆 ${toSmallCaps('murmure decode')} :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;
        const defaultCredit = `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

        if (/video/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            video: buffer,
            caption: caption ? murmureText : defaultCredit,
            mimetype: 'video/mp4'
          });
        } else if (/image/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            image: buffer,
            caption: caption ? murmureText : defaultCredit,
            mimetype: 'image/jpeg'
          });
        } else if (/audio/.test(mtype)) {
          await sock.sendMessage(ownerJid, {
            audio: buffer,
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
          });
        }

        return; // Fin du mode vv2, on arrête l'exécution ici.
      }

      // ── MODE VV (classique) ──
      await sock.sendMessage(
        chatId,
        { text: `*☬ ${toSmallCaps('dissipation de l\'illusion en cours')}...*` },
        { quoted: msg }
      );

      const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = actualMsg[mtype]?.caption || '';
      const murmureText = `*〆 ${toSmallCaps('murmure decode')} :* ${caption}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;
      const defaultCredit = `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      if (/video/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            video: buffer,
            caption: caption ? murmureText : defaultCredit,
            mimetype: 'video/mp4'
          },
          { quoted: msg }
        );
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            image: buffer,
            caption: caption ? murmureText : defaultCredit,
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
          text: `*❌ ${toSmallCaps('l\'illusion a resiste, echec de la revelation')}.*\n*${toSmallCaps('erreur')} : ${error.message}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`
        },
        { quoted: msg }
      );
    }
  }
};
