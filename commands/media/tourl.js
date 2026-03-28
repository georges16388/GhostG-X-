/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
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

// --- FONCTION DE DESIGN AGM (GRAS & SMALLCAPS) ---
const AGM_DESIGN = (size, type) => `*╭╼━≪• ${toStyledCaps('ᴍᴇᴅɪᴀ ᴛᴏ ᴜʀʟ')} •≫━╾╮*
*┃*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴜᴘʟᴏᴀᴅᴇᴅ')}*
*┃* ⚖️ *${toStyledCaps('sɪᴢᴇ')}* : *${size}*
*┃* 🌐 *${toStyledCaps('ᴛʏᴘᴇ')}* : *${toStyledCaps(type)}*
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'tourl',
  aliases: ['url', 'makeurl', 'catbox'],
  category: 'media',
  description: 'Convertir un média en lien URL via Catbox',
  usage: '.tourl (répondez à un média)',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      // 1. Détection du message cité (Quoted)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
                     msg.message?.imageMessage?.contextInfo?.quotedMessage || 
                     msg.message?.videoMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      // 2. Identification du type de média
      const mimeType = Object.keys(quoted)[0];
      if (!/image|video|audio|sticker|document/i.test(mimeType)) {
        return extra.reply(`❌ *${toStyledCaps('ᴄᴇ ᴛʏᴘᴇ ᴅᴇ ғɪᴄʜɪᴇʀ ɴᴇsᴛ ᴘᴀs sᴜᴘᴘᴏʀᴛᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '☁️', key: msg.key } });

      // 3. Téléchargement du buffer
      const stream = await downloadContentFromMessage(
        quoted[mimeType],
        mimeType.replace('Message', '').toLowerCase()
      );
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer || buffer.length === 0) throw new Error('DOWNLOAD_FAILED');

      // 4. Calcul de la taille et formatage
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      const cleanType = mimeType.replace('Message', '');

      // 5. Upload sur Catbox
      const mediaUrl = await uploadByBuffer(buffer); 
      if (!mediaUrl) throw new Error('UPLOAD_FAILED');

      // 6. Envoi du résultat final
      const caption = `${AGM_DESIGN(sizeMB, cleanType)}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(chatId, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toStyledCaps("conversion catbox reussie"),
            thumbnail: buffer.length < 1000000 ? buffer : null, 
            sourceUrl: mediaUrl,
            mediaType: 1,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('ToURL Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴜᴘʟᴏᴀᴅ. ᴠᴇʀɪғɪᴇᴢ ᴠᴏᴛʀᴇ ᴜᴘʟᴏᴀᴅᴇʀ.ᴊs')}*`);
    }
  }
};
