/**
 * QR Code Generator - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const qrcode = require('qrcode');

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

// --- FONCTION DE DESIGN AGM PRESTIGE (GRAS) ---
const AGM_DESIGN = (text) => {
  const shortText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  return `*╭╼━≪• ${toStyledCaps('ǫʀ ᴄᴏᴅᴇ sʏsᴛᴇᴍ')} •≫━╾╮*
*┃* *┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ɢᴇɴᴇʀᴀᴛᴇᴅ')}*
*┃* 📝 *${toStyledCaps('ᴛᴇxᴛ')}* : *${toStyledCaps(shortText)}*
*┃* ⚡ *${toStyledCaps('ᴍᴏᴅᴇ')}* : *${toStyledCaps('sʏsᴛᴇᴍ')}*
*┃* *╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'qr',
  aliases: ['qrcode'],
  category: 'utility',
  description: 'Générer un QR code à partir d\'un texte ou lien',
  usage: '.qr <texte>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');

      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps("ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴛᴇxᴛᴇ ᴏᴜ ᴜɴ ʟɪᴇɴ")}*`);
      }

      await sock.sendMessage(extra.from, { react: { text: "🔳", key: msg.key } });

      // Génération du Buffer QR (Qualité Haute)
      const qrBuffer = await qrcode.toBuffer(text, {
        type: 'png',
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Envoi avec design épuré (Sans sourceUrl pour éviter le lien bleu)
      await sock.sendMessage(extra.from, {
        image: qrBuffer,
        caption: AGM_DESIGN(text),
        contextInfo: {
            externalAdReply: {
                title: toStyledCaps("ɢʜᴏsᴛ ǫʀ sᴄᴀɴɴᴇʀ"),
                body: toStyledCaps("code genere avec succes"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false
            }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('QR Error:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ɢᴇɴᴇʀᴀᴛɪᴏɴ")}*`);
    }
  }
};
