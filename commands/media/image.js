/**
 * Google Image Search - AGM Elite Selector
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { googleImage } = require('@bochilteam/scraper');

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

module.exports = {
  name: 'image',
  aliases: ['img', 'pic'],
  category: 'media',
  description: 'Rechercher et choisir une image sur Google',
  usage: '.image <mot-clé>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      if (!text) return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴏᴛ-ᴄʟᴇ')}*`);

      await sock.sendMessage(extra.from, { react: { text: '🔍', key: msg.key } });

      const results = await googleImage(text);
      if (!results || results.length === 0) {
        return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
      }

      // Sélection des 5 premiers résultats
      const selection = results.slice(0, 5);
      
      let menuText = `*╭╼━≪• ${toStyledCaps('ɢᴏᴏɢʟᴇ ɪᴍᴀɢᴇ sᴇʟᴇᴄᴛᴏʀ')} •≫━╾╮*\n`;
      menuText += `*┃*\n`;
      menuText += `*┃* 🔍 *${toStyledCaps('ʀᴇᴄʜᴇʀᴄʜᴇ')}* : *${toStyledCaps(text)}*\n`;
      menuText += `*┃* 📥 *${toStyledCaps('ᴄʜᴏɪsɪssez ᴜɴ ɴᴜᴍᴇʀᴏ')}* :\n`;
      menuText += `*┃*\n`;
      
      selection.forEach((url, i) => {
        menuText += `*┃* *${i + 1}* ➽ *${toStyledCaps('ɪᴍᴀɢᴇ')} ${i + 1}*\n`;
      });
      
      menuText += `*┃*\n`;
      menuText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n`;
      menuText += `> *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴄᴇ ᴍᴇssᴀɢᴇ ᴀᴠᴇᴄ ʟᴇ ɴᴜᴍᴇʀᴏ')}*`;

      // Envoi du menu avec la première image en miniature pour donner un aperçu
      await sock.sendMessage(extra.from, {
        image: { url: selection[0] },
        caption: menuText,
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ɪᴍᴀɢᴇ sʏsᴛᴇᴍ",
            body: toStyledCaps("selectionnez votre image"),
            mediaType: 1,
            thumbnailUrl: selection[0],
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // Stockage temporaire des résultats pour le Handler de réponse (si tu en as un)
      // Sinon, je peux te coder la partie qui réceptionne le numéro.

    } catch (error) {
      console.error('Image Selector Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʀᴇᴄʜᴇʀᴄʜᴇ')}*`);
    }
  }
};
