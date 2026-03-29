/**
 * Media To URL - AGM Cloud Edition (Catbox)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - High Compatibility
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadByBuffer } = require('../../utils/uploader'); 

const toStyledCaps = (text) => {
  if (!text) return "";
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
  aliases: ['url', 'makeurl', 'catbox', 'host'],
  category: 'media',
  description: 'Convertir un média en lien URL via Catbox',
  usage: '.tourl (répondez à un média)',

  async execute(sock, msg, args, extra) {
    const from = extra.from;

    try {
      // 1. DÉTECTION ROBUSTE DU MÉDIA
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
      
      // On cherche la clé qui finit par 'Message' (imageMessage, videoMessage, etc.)
      const mimeType = Object.keys(quoted).find(key => 
        /image|video|audio|sticker|document/i.test(key) && !key.includes('protocol')
      );

      if (!mimeType) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ʀᴇᴘᴏɴᴅʀᴇ ᴀ ᴜɴ ᴍᴇᴅɪᴀ')}*`);
      }

      await sock.sendMessage(from, { react: { text: '☁️', key: msg.key } });

      // 2. TÉLÉCHARGEMENT DU MÉDIA
      const messageContent = quoted[mimeType];
      const downloadType = mimeType.replace('Message', '').toLowerCase();
      
      // Utilisation du stream Baileys
      const stream = await downloadContentFromMessage(messageContent, downloadType === 'sticker' ? 'sticker' : (downloadType === 'image' ? 'image' : (downloadType === 'video' ? 'video' : 'document')));
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer || buffer.length === 0) throw new Error('Buffer vide');

      // 3. INFOS & UPLOAD
      const sizeStr = (buffer.length / (1024 * 1024)).toFixed(2) + ' ᴍʙ';
      
      // Appel à l'uploader corrigé
      const mediaUrl = await uploadByBuffer(buffer); 

      // 4. RÉPONSE FINALE
      const finalCaption = `${AGM_DESIGN(sizeStr, mimeType.replace('Message',''))}\n\n🔗 *${toStyledCaps('ʟɪɴᴋ')} :* ${mediaUrl}`;

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('❌ [ᴛᴏᴜʀʟ ᴇʀʀᴏʀ]:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ')}* : ${toStyledCaps('ʟᴇ sᴇʀᴠᴇᴜʀ ᴅᴇ sᴛᴏᴄᴋᴀɢᴇ ɴᴇ ʀᴇᴘᴏɴᴅ ᴘᴀs')}`);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  }
};
