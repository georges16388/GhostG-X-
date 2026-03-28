/**
 * QR Code Generator - AGM Design Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const qrcode = require('qrcode');

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

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (text) => {
  const shortText = text.length > 20 ? text.substring(0, 17) + '...' : text;
  return `╭╼━≪• *ǫʀ ᴄᴏᴅᴇ sʏsᴛᴇᴍ* •≫━╾╮
┃ 
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : 🟢 ${toSmallCaps('ɢᴇɴᴇʀᴀᴛᴇᴅ')}
┃ ${toSmallCaps('ᴛᴇxᴛ')} : ${shortText}
┃ ${toSmallCaps('ᴍᴏᴅᴇ')} : ${toSmallCaps('sʏsᴛᴇᴍ')} ⚡
┃ 
╰━━━━━━━━━━━━━━━╯
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
      if (args.length === 0) {
        const warn = toSmallCaps("veuillez entrer un texte ou un lien");
        return extra.reply(`⚠️ *${warn}*`);
      }

      const text = args.join(' ');

      // Réaction immédiate
      await sock.sendMessage(extra.from, { react: { text: "🔳", key: msg.key } });

      // Génération du Buffer QR (Qualité Haute)
      const qrBuffer = await qrcode.toBuffer(text, {
        type: 'png',
        width: 600,
        margin: 2,
        color: {
          dark: '#000000', // Noir pour le scan
          light: '#ffffff' // Blanc pour le fond
        }
      });

      // Envoi de l'image QR avec le design Ghost
      await sock.sendMessage(extra.from, {
        image: qrBuffer,
        caption: AGM_DESIGN(text),
        contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏsᴛ ǫʀ sᴄᴀɴɴᴇʀ",
                body: toSmallCaps("code genere avec succes"),
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: true
            }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('QR Error:', error);
      const errMsg = toSmallCaps(`erreur : ${error.message}`);
      await extra.reply(`❌ *${errMsg}*`);
    }
  }
};
