/**
 * ViewOnce Reveal - AGM Elite Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (type, caption) => `╭╼━≪• ᴠɪᴇᴡ-ᴏɴᴄᴇ ʀᴇᴠᴇᴀʟ •≫━╾╮
┃ ᴛʏᴘᴇ : ${type} 👁️
┃ sᴛᴀᴛᴜs : 🟢 ᴜɴʟᴏᴄᴋᴇᴅ
┃ ᴍᴏᴅᴇ : ᴘʀᴇsᴛɪɢᴇ ⚡
${caption ? `┃ ᴄᴀᴘᴛɪᴏɴ : ${caption.substring(0, 15)}...` : '┃ ɴᴏ ᴄᴀᴘᴛɪᴏɴ'}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'viewonce',
  aliases: ['readvo', 'read', 'vv', 'readviewonce'],
  category: 'general',
  description: 'Révéler les messages à vue unique',
  usage: '.vv (répondre à un message View-Once)',

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;

    try {
      // 1. Extraction du contexte de réponse
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quoted) {
        return sock.sendMessage(chatId, { text: '🗑️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ ᴍᴇssᴀɢᴇ à ᴠᴜᴇ ᴜɴɪǫᴜᴇ.*' }, { quoted: msg });
      }

      // 2. Identification du type de message ViewOnce
      let viewOnceType = quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension || quoted.viewOnceMessage;
      let actualMsg = viewOnceType ? viewOnceType.message : quoted;

      const mtype = Object.keys(actualMsg)[0];
      const media = actualMsg[mtype];

      // Vérification si c'est bien un message ViewOnce
      if (!media?.viewOnce && !viewOnceType) {
        return sock.sendMessage(chatId, { text: '❌ *ᴄᴇ ɴ\'ᴇsᴛ ᴘᴀs ᴜɴ ᴍᴇssᴀɢᴇ à ᴠᴜᴇ ᴜɴɪǫᴜᴇ !*' }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { react: { text: '🔓', key: msg.key } });

      // 3. Téléchargement du contenu
      const downloadType = mtype.replace('Message', '');
      const stream = await downloadContentFromMessage(media, downloadType);
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const caption = media.caption || '';
      const displayType = mtype === 'imageMessage' ? '📸 IMAGE' : mtype === 'videoMessage' ? '🎬 VIDEO' : '🎵 AUDIO';

      // 4. Renvoi du média sans la restriction ViewOnce
      if (/video/.test(mtype)) {
        await sock.sendMessage(chatId, {
          video: buffer,
          caption: AGM_DESIGN(displayType, caption),
          mimetype: 'video/mp4'
        }, { quoted: msg });
      } else if (/image/.test(mtype)) {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: AGM_DESIGN(displayType, caption),
          mimetype: 'image/jpeg'
        }, { quoted: msg });
      } else if (/audio/.test(mtype)) {
        await sock.sendMessage(chatId, {
          audio: buffer,
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[VIEWONCE ERROR]:', error);
      await sock.sendMessage(chatId, { text: '❌ *éᴄʜᴇᴄ ᴅᴇ ʟᴀ ʀéᴠéʟᴀᴛɪᴏɴ.*' }, { quoted: msg });
    }
  }
};
