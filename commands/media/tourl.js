/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { uploadByBuffer } = require('../../utils/uploader'); // Vérifie que ton uploader pointe vers Catbox
const fs = require('fs');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (size, type) => `╭╼━≪• *ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ* •≫━╾╮
┃ 
┃ ✅ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ᴜᴘʟᴏᴀᴅᴇᴅ')}
┃ ⚖️ ${toSmallCaps('sɪᴢᴇ')} : ${size}
┃ 🌐 ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps(type)}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'tourl',
  aliases: ['url', 'makeurl', 'upload', 'catbox'],
  category: 'media',
  description: 'Convertir un média en lien URL permanent via Catbox',
  usage: '.tourl (répondez à un média)',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      // Vérification de la réponse à un message
      const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!isQuoted) {
        const warn = toSmallCaps("veuillez repondre a une image, video ou audio avec .tourl");
        return extra.reply(`⚠️ *${warn}*`);
      }

      // Détecter le type de média cité
      const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      const mime = Object.keys(quotedMsg)[0];
      
      if (!/image|video|audio|sticker|document/.test(mime)) {
        const errType = toSmallCaps("ce type de fichier n'est pas supporte");
        return extra.reply(`❌ *${errType}*`);
      }

      // Réaction de chargement (Nuage)
      await sock.sendMessage(chatId, { react: { text: '☁️', key: msg.key } });

      // Téléchargement du média via l'utilitaire extra
      const buffer = await extra.downloadQuotedMedia();
      if (!buffer) {
        const errDown = toSmallCaps("echec du telechargement du media");
        return extra.reply(`❌ *${errDown}*`);
      }

      // Calcul de la taille
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB';
      const cleanType = mime.replace('Message', '').replace('Video', 'Vidéo').replace('Image', 'Image').replace('Audio', 'Audio');

      // --- UPLOAD SUR CATBOX ---
      let mediaUrl;
      try {
        // On suppose que uploadByBuffer est configuré pour Catbox
        mediaUrl = await uploadByBuffer(buffer); 
      } catch (uploadErr) {
        console.error('Upload Error:', uploadErr);
        const errCloud = toSmallCaps("erreur lors de l'hebergement sur catbox");
        return extra.reply(`❌ *${errCloud}*`);
      }

      // Construction du message final
      const caption = `${AGM_DESIGN(sizeMB, cleanType)}\n\n🔗 *${toSmallCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toSmallCaps("conversion catbox reussie"),
            thumbnail: buffer.length < 1000000 ? buffer : null, // Miniature seulement si < 1MB pour éviter les lags
            sourceUrl: mediaUrl,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('ToURL Global Error:', error);
      const errGen = toSmallCaps("une erreur est survenue lors de la generation du lien");
      await extra.reply(`❌ *${errGen}*`);
    }
  }
};
