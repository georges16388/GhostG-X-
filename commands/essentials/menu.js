/**
 * Menu Command - GhostG-X- Prestige Edition
 * Custom Design by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

// Fonction pour convertir en SmallCaps
const toSmallCaps = (text) => {
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  };
  return text.toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h'],
  category: 'essentials',
  description: 'Menu prestige avec compteur exact et lien développeur.',
  usage: '.menu',
  
  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};
      let totalCommands = 0;

      // Calcul du nombre exact de commandes uniques
      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          totalCommands++;
          const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }
      });

      const prefix = config.prefix || '.';
      const deployerName = config.ownerName || 'ɢʜᴏsᴛɢ x';
      const botName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";

      // --- HEADER DU MENU ---
      let menuText = `    ${botName}\n`;
      menuText += `◈ ${toSmallCaps('commandes')} : [ ${totalCommands} ]\n\n`;
      
      menuText += `◈ ${toSmallCaps('utilisateur')} : ${toSmallCaps(deployerName)}\n`;
      menuText += `◈ ${toSmallCaps('prefixe')} : [ ${prefix} ]\n`;
      menuText += `◈ ${toSmallCaps('developpeur')} : wa.me/22651622652\n\n`; // CHANGEMENT DE CONTACT

      const catOrder = ['essentials', 'ai', 'group', 'admin', 'fun', 'media', 'anime', 'owner', 'utility'];
      const allCats = Object.keys(categories).sort();
      const finalOrder = [...new Set([...catOrder.filter(c => allCats.includes(c)), ...allCats])];

      // --- GÉNÉRATION DES SECTIONS ---
      for (const cat of finalOrder) {
        if (!categories[cat]) continue;
        
        menuText += `┏▣ ◈ *${toSmallCaps(cat)} ᴍᴇɴᴜ* ◈\n`;
        categories[cat].forEach(cmd => {
          menuText += `│➽ ${toSmallCaps(cmd.name)}\n`;
        });
        menuText += `┗▣\n\n`;
      }

      menuText += `> ${toSmallCaps('powered by ghostg x')}`;

      const newsletterJid = '120363425540434745@newsletter';
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');

      const messageOptions = {
        mentions: [extra.sender],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: botName,
            serverMessageId: -1
          },
          externalAdReply: {
            title: botName,
            body: toSmallCaps("rejoignez l'élite"),
            mediaType: 1,
            sourceUrl: "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A",
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg", // NOUVEAU LIEN CATBOX
            renderLargerThumbnail: true
          }
        }
      };

      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(extra.from, { image: fs.readFileSync(imagePath), caption: menuText, ...messageOptions }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, { text: menuText, ...messageOptions }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, { react: { text: "👻", key: msg.key } });

    } catch (error) {
      console.error('Menu Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
