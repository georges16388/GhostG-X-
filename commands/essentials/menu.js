
/**
 * Menu Command - GhostG-X- Prestige Edition V5 (Gratitude Edition)
 * Design Minimaliste & Pur par -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

const toSmallCaps = (text) => {
  if (!text) return ""; 
  const str = Array.isArray(text) ? String(text[0]) : String(text);
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  };
  return str.toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h'],
  category: 'essentials',
  description: 'Menu avec témoignage de gratitude GhostG-X.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};
      let totalCommands = 0;

      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          totalCommands++;
          const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }
      });

      const prefix = config.prefix || '.';
      const botName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";
      const ownerNumber = "22651622652";
      const pushName = msg.pushName || 'Guest';

      // --- EN-TÊTE UNIQUE AVEC TÉMOIGNAGE ---
      let menuText = `┏▣ ◈ *${botName}* ◈\n`;
      menuText += `│\n`;
      menuText += `◈ *${toSmallCaps('commandes')}* : [ ${totalCommands} ]\n`;
      menuText += `◈ *${toSmallCaps('utilisateur')}* : ${toSmallCaps(pushName)}\n`;
      menuText += `◈ *${toSmallCaps('jesus taime')}* ❤️✝️\n`; // La phrase de gratitude ajoutée ici
      menuText += `◈ *${toSmallCaps('prefixe')}* : [ ${prefix} ]\n`;
      menuText += `◈ *${toSmallCaps('developpeur')}* : wa.me/${ownerNumber}\n`;
      menuText += `┗▣\n\n`;

      const catOrder = ['essentials', 'ai', 'group', 'admin', 'fun', 'media', 'anime', 'owner', 'utility'];
      const allCats = Object.keys(categories).sort();
      const finalOrder = [...new Set([...catOrder.filter(c => allCats.includes(c)), ...allCats])];

      for (const cat of finalOrder) {
        if (!categories[cat]) continue;
        menuText += `┏▣ ◈ *${toSmallCaps(cat)} ᴍᴇɴᴜ* ◈\n`;
        categories[cat].forEach(cmd => {
          menuText += `│➽ ${toSmallCaps(cmd.name)}\n`;
        });
        menuText += `┗▣\n\n`;
      }

      menuText += `> ${toSmallCaps('powered by ghostg x')}\n`;
      menuText += `> ${toSmallCaps('merci seigneur pour ta grace')}`; // Un second petit rappel discret en bas

      const messageOptions = {
        caption: menuText,
        mentions: [extra.sender],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: botName,
            serverMessageId: -1
          },
          externalAdReply: {
            title: botName,
            body: toSmallCaps("jesus taime - truth devices"),
            mediaType: 1,
            sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c",
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      };

      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(extra.from, { image: fs.readFileSync(imagePath), ...messageOptions }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, { image: { url: "https://files.catbox.moe/2fmwpu.jpg" }, ...messageOptions }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: "🙏", key: msg.key } }); // Réaction changée en prière pour le menu

    } catch (error) {
      console.error('Menu Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
