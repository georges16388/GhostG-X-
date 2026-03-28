/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Clean Edition - No External Links
 */

const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');
const { uploadByBuffer } = require('../../utils/uploader'); 

const toStyledCaps = (text) => {
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

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
      const from = extra.from;

      // 1. Détection du média cité ou du message direct
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
      const mimeType = getContentType(quoted);

      if (!quoted || !/image|video|audio|sticker|document/i.test(mimeType)) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });

      // 2. Préparation du téléchargement
      const mediaContent = quoted[mimeType];
      const stream = await downloadContentFromMessage(
        mediaContent,
        mimeType.replace('Message', '').toLowerCase()
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (buffer.length === 0) throw new Error('Buffer vide');

      // 3. Calcul des infos
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      const cleanType = mimeType.replace('Message', '');

      // 4. Upload
      const mediaUrl = await uploadByBuffer(buffer); 

      // 5. Envoi du résultat sans lien cliquable dans l'aperçu
      const caption = `${AGM_DESIGN(sizeMB, cleanType)}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(from, {
        text: caption,
        contextInfo: {
            // Suppression de sourceUrl et showAdAttribution pour éviter les liens parasites
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toStyledCaps("transfert securise effectue"),
            thumbnail: buffer.length < 100000 ? buffer : null, 
            mediaType: 1,
            renderLargerThumbnail: false // Garde l'aperçu petit et discret
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('ToURL Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴜᴘʟᴏᴀᴅ.')}*`);
    }
  }
};
