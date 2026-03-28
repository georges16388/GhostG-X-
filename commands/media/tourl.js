/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Clean Edition - No External Links
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
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

      // 1. Détection précise du média (Direct ou Quoted)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
      const mimeType = getContentType(quoted);

      // On vérifie si c'est bien un média géré
      if (!quoted || !mimeType || !/image|video|audio|sticker|document/i.test(mimeType)) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });

      // 2. Téléchargement sécurisé
      const mediaKey = mimeType.replace('Message', '').toLowerCase();
      // Correction pour documentMessage qui nécessite 'document'
      const downloadType = mediaKey === 'document' ? 'document' : mediaKey;
      
      const stream = await downloadContentFromMessage(quoted[mimeType], downloadType);

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (buffer.length === 0) throw new Error('Buffer vide');

      // 3. Calcul des infos techniques
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      const cleanType = mediaKey.toUpperCase();

      // 4. Upload vers Catbox (via ton utilitaire)
      const mediaUrl = await uploadByBuffer(buffer); 

      // 5. Construction du message final
      const caption = `${AGM_DESIGN(sizeMB, cleanType)}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(from, {
        text: caption,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toStyledCaps("transfert securise effectue"),
            // On n'envoie le thumbnail que si c'est une image légère pour éviter les lags
            thumbnail: /image/i.test(mimeType) && buffer.length < 1000000 ? buffer : null, 
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: false 
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
