/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { uploadByBuffer } = require('../../utils/uploader'); 

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
const AGM_DESIGN = (size, type) => `*╭╼━≪• ${toStyledCaps('ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ')} •≫━╾╮*
*┃* *┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴜᴘʟᴏᴀᴅᴇᴅ')}*
*┃* ⚖️ *${toStyledCaps('sɪᴢᴇ')}* : *${size}*
*┃* 🌐 *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃* *╰━━━━━━━━━━━━━━━╯*
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

      // 1. Vérification de la citation (Quoted)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      // 2. Détection du type de média
      const mime = Object.keys(quoted)[0];
      if (!/image|video|audio|sticker|document/.test(mime.toLowerCase())) {
        return extra.reply(`❌ *${toStyledCaps('ᴄᴇ ᴛʏᴘᴇ ᴅᴇ ғɪᴄʜɪᴇʀ ɴᴇsᴛ ᴘᴀs sᴜᴘᴘᴏʀᴛᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '☁️', key: msg.key } });

      // 3. Téléchargement manuel sécurisé
      const targetMessage = {
        key: msg.message.extendedTextMessage.contextInfo,
        message: quoted
      };

      const buffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      if (!buffer) {
        throw new Error('DOWNLOAD_FAILED');
      }

      // 4. Calcul de la taille et type propre
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      const cleanType = mime.replace('Message', '');

      // 5. Upload sur Catbox
      let mediaUrl;
      try {
        mediaUrl = await uploadByBuffer(buffer); 
      } catch (uploadErr) {
        console.error('Upload Error:', uploadErr);
        return extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟʜᴇʙᴇʀɢᴇᴍᴇɴᴛ ᴄᴀᴛʙᴏx')}*`);
      }

      // 6. Envoi du résultat final
      const caption = `${AGM_DESIGN(sizeMB, cleanType)}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toStyledCaps("conversion catbox reussie"),
            thumbnail: buffer.length < 2000000 ? buffer : null, 
            sourceUrl: mediaUrl,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('ToURL Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴜᴘʟᴏᴀᴅ')}*`);
    }
  }
};
