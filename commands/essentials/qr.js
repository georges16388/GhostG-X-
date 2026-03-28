/**
 * QR Code Generator - AGM Design Edition (Clean Version)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const qrcode = require('qrcode');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'qr',
  aliases: ['qrcode'],
  category: 'utility',
  description: 'Générer un QR code à partir d\'un texte ou lien',
  usage: '.qr <texte>',

  async execute(sock, msg, args, extra) {
    const { from, reply, react } = extra;
    try {
      const text = args.join(' ');

      if (!text) {
        return reply(`⚠️ *${toStyledCaps("veuillez entrer un texte ou un lien")}*`);
      }

      await react("🔳");

      // Génération du Buffer QR Haute Qualité
      const qrBuffer = await qrcode.toBuffer(text, {
        type: 'png',
        width: 600,
        margin: 4, // Plus de marge pour un scan plus facile
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Construction du texte épuré
      const shortText = text.length > 25 ? text.substring(0, 22) + '...' : text;
      let design = `*╭╼━≪• ${toStyledCaps('ǫʀ ᴄᴏᴅᴇ sʏsᴛᴇᴍ')} •≫━╾╮*\n`;
      design += `*┃*\n`;
      design += `*┃* ✅ *${toStyledCaps('status')}* : 🟢 *${toStyledCaps('genere')}*\n`;
      design += `*┃* 📝 *${toStyledCaps('contenu')}* : _${shortText}_\n`;
      design += `*┃*\n`;
      design += `*╰━━━━━━━━━━━━━━━╯*\n`;
      design += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // Envoi de l'image seule avec sa légende (SANS externalAdReply)
      await sock.sendMessage(from, {
        image: qrBuffer,
        caption: design,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363425540434745@newsletter',
                newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                serverMessageId: 143
            }
        }
      }, { quoted: msg });

      await react("✅");

    } catch (error) {
      console.error('QR Error:', error);
      reply(`❌ *${toStyledCaps("erreur lors de la generation")}*`);
    }
  }
};
