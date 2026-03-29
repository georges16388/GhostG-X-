/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Multi-Mime Support
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadByBuffer } = require('../../utils/uploader'); 

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM ---
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
  aliases: ['url', 'makeurl', 'catbox', 'host'],
  category: 'media',
  description: 'Convertir un média en lien URL via Catbox',
  usage: '.tourl (répondez à un média)',

  async execute(sock, msg, args, extra) {
    const from = extra.from;

    try {
      // 1. Détection du message cité (Quoted) ou direct
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
      
      // On cherche quel type de média est présent
      const mimeType = Object.keys(quoted).find(key => key.endsWith('Message') && !key.includes('protocol') && !key.includes('senderKey'));

      if (!quoted || !mimeType || !/image|video|audio|sticker|document/i.test(mimeType)) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });

      // 2. Extraction du type de téléchargement pour Baileys
      const downloadType = mimeType.replace('Message', '');
      const mediaData = quoted[mimeType];

      // 3. Téléchargement et Bufférisation
      const stream = await downloadContentFromMessage(mediaData, downloadType.toLowerCase());
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (buffer.length === 0) throw new Error('Download failed: Buffer empty');

      // 4. Infos Techniques
      const sizeStr = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      const typeStr = downloadType.toUpperCase();

      // 5. Upload via ton utilitaire uploader.js (Catbox)
      const mediaUrl = await uploadByBuffer(buffer); 

      // 6. Envoi du résultat final
      const finalCaption = `${AGM_DESIGN(sizeStr, typeStr)}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(from, {
        text: finalCaption,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ᴄʟᴏᴜᴅ sʏsᴛᴇᴍ",
            body: toStyledCaps("transfert securise effectue"),
            // On affiche la miniature si c'est une image < 1MB
            thumbnail: /image/i.test(mimeType) && buffer.length < 1000000 ? buffer : null, 
            mediaType: 1,
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[TOURL ERROR]:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ ʟᴏʀs ᴅᴇ ʟᴜᴘʟᴏᴀᴅ')}*`);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  }
};
