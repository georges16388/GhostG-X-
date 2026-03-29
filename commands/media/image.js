/**
 * Google Image Search - AGM Elite Selector
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Interactive Selector
 */

const { googleImage } = require('@bochilteam/scraper');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
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
    const text = args.join(' ');
    const chatId = extra.from;

    try {
      if (!text) {
        return extra.reply(`⚠️ *${toStyledCaps('ᴠᴇᴜɪʟʟᴇᴢ ᴇɴᴛʀᴇʀ ᴜɴ ᴍᴏᴛ-ᴄʟᴇ')}*`);
      }

      await sock.sendMessage(chatId, { react: { text: '🔍', key: msg.key } });

      const results = await googleImage(text);
      if (!results || results.length === 0) {
        return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
      }

      // On prend les 5 premières images
      const selection = results.slice(0, 5);
      
      // Envoi du menu de sélection
      const sentMsg = await sock.sendMessage(chatId, {
        image: { url: selection[0] },
        caption: AGM_DESIGN(text, selection),
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

      // --- LOGIQUE DE RÉPONSE (COLLECTOR) ---
      // On attend une réponse de l'utilisateur pendant 30 secondes
      const filter = (m) => m.quoted && m.quoted.id === sentMsg.key.id && !isNaN(m.text) && m.text > 0 && m.text <= selection.length;
      
      // Note : Cette partie dépend de la gestion des événements de ton index.js/handler.js
      // Si ton bot n'a pas de collector intégré, voici la méthode manuelle :
      extra.setExpectedResponse && extra.setExpectedResponse(chatId, msg.sender, {
        type: 'image_selection',
        data: selection,
        timeout: 30000
      });

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[IMAGE ERROR]:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʀᴇᴄʜᴇʀᴄʜᴇ')}*`);
    }
  }
};
