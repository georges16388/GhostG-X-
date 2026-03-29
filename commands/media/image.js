/**
 * Google Image Search - AGM Elite Selector
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Optimized for V5.3 - Stability Update
 */

// On passe sur un scraper plus récent ou une méthode axios stable
const { googleImage } = require('ruhend-scraper'); 

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

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

      // Utilisation de Ruhend pour plus de stabilité sur les IPs serveurs
      const results = await googleImage(text);
      
      if (!results || results.length === 0) {
        return extra.reply(`❌ *${toStyledCaps('ᴀᴜᴄᴜɴ ʀᴇsᴜʟᴛᴀᴛ ᴛʀᴏᴜᴠᴇ')}*`);
      }

      // Sélection des 5 premières images pour le menu
      const selection = results.slice(0, 5);

      const sentMsg = await sock.sendMessage(chatId, {
        image: { url: selection[0] }, // On affiche la 1ère en aperçu
        caption: AGM_DESIGN(text, selection),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ɪᴍᴀɢᴇ sʏsᴛᴇᴍ",
            body: toStyledCaps("faites votre choix"),
            mediaType: 1,
            thumbnailUrl: selection[0],
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // --- GESTION DU COLLECTOR ---
      // On s'assure que ton handler.js supporte cette fonction
      if (extra.setExpectedResponse) {
        extra.setExpectedResponse(chatId, msg.sender, {
          type: 'image_selection',
          data: selection, // On passe le tableau d'URLs
          originalId: sentMsg.key.id,
          timeout: 60000 // On laisse 1 minute à l'utilisateur
        });
      }

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('[IMAGE ERROR]:', error.message);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ʀᴇᴄʜᴇʀᴄʜᴇ')}*`);
    }
  }
};
