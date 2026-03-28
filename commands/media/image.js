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

// --- FONCTION DE DESIGN DU MENU ---
const AGM_DESIGN = (query, selection) => {
  let menu = `*╭╼━≪• ${toStyledCaps('ɢᴏᴏɢʟᴇ ɪᴍᴀɢᴇ sᴇʟᴇᴄᴛᴏʀ')} •≫━╾╮*\n`;
  menu += `*┃*\n`;
  menu += `*┃* 🔍 *${toStyledCaps('ʀᴇᴄʜᴇʀᴄʜᴇ')}* : *${toStyledCaps(query)}*\n`;
  menu += `*┃* 📥 *${toStyledCaps('ᴄʜᴏɪsɪsꜱᴇᴢ ᴜɴ ɴᴜᴍᴇʀᴏ')}* :\n`;
  menu += `*┃*\n`;
  
  selection.forEach((_, i) => {
    menu += `*┃* *${i + 1}* ➽ *${toStyledCaps('ɪᴍᴀɢᴇ')} ${i + 1}*\n`;
  });
  
  menu += `*┃*\n`;
  menu += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n`;
  menu += `> *${toStyledCaps('ʀᴇᴘᴏɴᴅᴇᴢ ᴀ ᴄᴇ ᴍᴇssᴀɢᴇ ᴀᴠᴇᴄ ʟᴇ ɴᴜᴍᴇʀᴏ')}*`;
  return menu;
};

module.exports = {
  name: 'image',
  aliases: ['img', 'pic', 'google'],
  category: 'media',
  description: 'Rechercher et choisir une image sur Google',
  usage: '.image <mot-clé>',

  async execute(sock, msg, args, extra) {
    try {
      const text = args.join(' ');
      const chatId = extra.from;

      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴏᴛ-ᴄʟᴇ')}*`);
      }

      // Réaction de recherche
      await sock.sendMessage(chatId, { react: { text: '🔍', key: msg.key } });

      // Recherche via le scraper
      const results = await googleImage(text);
      
      if (!results || results.length === 0) {
        return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
      }

      // On limite à 5 résultats pour la clarté
      const selection = results.slice(0, 5);

      // Envoi du menu interactif
      await sock.sendMessage(chatId, {
        image: { url: selection[0] }, // Utilise la 1ère image comme couverture
        caption: AGM_DESIGN(text, selection),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ɪᴍᴀɢᴇ sʏsᴛᴇᴍ",
            body: toStyledCaps("selectionnez votre image"),
            mediaType: 1,
            thumbnailUrl: selection[0],
            sourceUrl: "https://github.com/georges16388",
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Image Selector Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʀᴇᴄʜᴇʀᴄʜᴇ')}*`);
    }
  }
};
