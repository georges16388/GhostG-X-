/**
 * Media to URL Converter - AGM Cloud Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { uploadByBuffer } = require('../../utils/uploader'); // Assure-toi d'avoir un utilitaire d'upload
const fs = require('fs');

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (size, type) => `╭╼━≪• ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜᴘʟᴏᴀᴅᴇᴅ
┃ sɪᴢᴇ : ${size} ⚖️
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} 🌐
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'tourl',
  aliases: ['url', 'makeurl', 'upload'],
  category: 'media',
  description: 'Convertir un média en lien URL public',
  usage: '.tourl (répondez à une image/vidéo)',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      
      // Vérifier si l'utilisateur a répondu à un message
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ ʀéᴘᴏɴᴅʀᴇ à ᴜɴᴇ ɪᴍᴀɢᴇ, ᴠɪᴅéᴏ ᴏᴜ ᴀᴜᴅɪᴏ ᴀᴠᴇᴄ .ᴛᴏᴜʀʟ*');
      }

      // Détecter le type de média
      const mime = Object.keys(quoted)[0];
      if (!/image|video|audio|sticker/.test(mime)) {
        return extra.reply('❌ *ᴄᴇ ᴛʏᴘᴇ ᴅᴇ ғɪᴄʜɪᴇʀ ɴ\'ᴇsᴛ ᴘᴀs sᴜᴘᴘᴏʀᴛé.*');
      }

      await sock.sendMessage(chatId, { react: { text: '☁️', key: msg.key } });

      // Télécharger le média en buffer
      const buffer = await extra.downloadQuotedMedia();
      if (!buffer) return extra.reply('❌ *éᴄʜᴇᴄ ᴅᴜ ᴛéʟéᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴜ ᴍéᴅɪᴀ.*');

      // Calcul de la taille (en MB)
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB';

      // --- UPLOAD (Utilisation d'un service comme Telegra.ph ou Catbox) ---
      // Note : Remplace 'uploadByBuffer' par ta fonction d'upload réelle si nécessaire
      let mediaUrl;
      try {
        mediaUrl = await uploadByBuffer(buffer, mime); 
      } catch (uploadErr) {
        // Fallback si l'uploader principal échoue
        return extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ l\'ʜéʙᴇʀɢᴇᴍᴇɴᴛ sᴜʀ ʟᴇ ᴄʟᴏᴜᴅ.*');
      }

      const caption = `${AGM_DESIGN(sizeMB, mime.split('M')[0])}\n\n🔗 *ʟɪɴᴋ :* ${mediaUrl}`;

      await sock.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "AGM CLOUD UPLOADER",
            body: "Media converted successfully",
            thumbnail: buffer, // Miniature du média original
            sourceUrl: mediaUrl,
            mediaType: 1
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('ToURL Error:', error);
      await extra.reply('❌ *ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴇsᴛ sᴜʀᴠᴇɴᴜᴇ ʟᴏʀs ᴅᴇ ʟᴀ ɢéɴéʀᴀᴛɪᴏɴ ᴅᴜ ʟɪᴇɴ.*');
    }
  }
};
