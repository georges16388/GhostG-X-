/**
 * ViewOnce Command - AGM Ghost Stealth Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (type) => `╭╼━≪• ɢʜᴏsᴛ ʀᴇᴠᴇᴀʟ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜɴʟᴏᴄᴋᴇᴅ
┃ ᴍᴇᴅɪᴀ : ${type.toUpperCase()} ⚡
┃ ᴍᴏᴅᴇ : sᴛᴇᴀʟᴛʜ 📥
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'viewonce',
  aliases: ['vv', 'vv2', 'readvo'],
  category: 'utility',
  description: 'Reveal view-once messages discreetly',
  usage: '.vv (public) | .vv2 (private + auto-delete)',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const sender = extra.sender;
      const isStealth = msg.body.toLowerCase().includes('vv2');

      const ctx = msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo;

      if (!ctx?.quotedMessage) return; // Discrétion : on ne répond même pas si c'est mal utilisé

      const quotedMsg = ctx.quotedMessage;
      let actualMsg = null;
      let mtype = null;

      // Détection du média ViewOnce
      if (quotedMsg.viewOnceMessageV2?.message) {
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
      }

      if (!actualMsg) return;

      // --- OPTION DISCRÈTE (vv2) ---
      if (isStealth) {
        try {
          // Suppression immédiate du message de commande de l'utilisateur
          await sock.sendMessage(chatId, { delete: msg.key });
        } catch (e) {
          // Si le bot n'est pas admin, il ne peut pas supprimer (on continue quand même)
        }
      }

      const downloadType = mtype.replace('Message', '');
      const mediaStream = await downloadContentFromMessage(actualMsg[mtype], downloadType);

      let buffer = Buffer.from([]);
      for await (const chunk of mediaStream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = (actualMsg[mtype]?.caption || '') + '\n\n' + AGM_DESIGN(downloadType);
      
      // Envoi du média
      const targetJid = isStealth ? sender : chatId;

      if (/video/.test(mtype)) {
        await sock.sendMessage(targetJid, { video: buffer, caption, mimetype: 'video/mp4' });
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(targetJid, { image: buffer, caption, mimetype: 'image/jpeg' });
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(targetJid, { audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
      }

    } catch (error) {
      console.error('Stealth VV Error:', error);
    }
  }
};
