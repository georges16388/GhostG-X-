/**
 * Menu Command - GhostG-X Prestige Edition V5 (Gratitude Edition)
 * Focus: Clean Design + Native WhatsApp Channel Button
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h'],
  category: 'essentials',
  description: 'Menu GhostG-X avec bouton "Voir la chaîne" natif.',
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
      const botName = "ɢʜᴏsᴛɢ-x";
      const ownerNumber = "22651622652";
      const ownerName = toStyledCaps(config.ownerName || "Truth Devices"); 

      let menuText = `╭╼━≪• *${botName}* •≫━╾╮\n`;
      menuText += `┃ *${toStyledCaps('statut')}* : 🟢 ᴏɴʟɪɴᴇ\n`;
      menuText += `┃ *${toStyledCaps('utilisateur')}* : @${ownerName}\n`;
      menuText += `┃ *${toStyledCaps('jesus taime')}* : ❤️✝️\n`;
      menuText += `┃ *${toStyledCaps('prefixe')}* : [ ${prefix} ]\n`;
      menuText += `┃ *${toStyledCaps('commandes')}* : ${totalCommands} ғɪʟᴇs\n`;
      menuText += `┃ *${toStyledCaps('developpeur')}* : https://wa.me/${ownerNumber}\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      const catOrder = ['essentials', 'ai', 'group', 'admin', 'fun', 'media', 'anime', 'owner', 'utility'];
      const allCats = Object.keys(categories).sort();
      const finalOrder = [...new Set([...catOrder.filter(c => allCats.includes(c)), ...allCats])];

      for (const cat of finalOrder) {
        if (!categories[cat]) continue;
        menuText += `╭╼━≪• *${toStyledCaps(cat)}* •≫━╾╮\n`;
        categories[cat].forEach(cmd => {
          menuText += `┃➽ *${toStyledCaps(cmd.name)}*\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      }

      menuText += `> *${toStyledCaps('powered by ghostg-x')}*\n`;
      menuText += `> *${toStyledCaps('merci seigneur pour ta grace')}*`;

      // --- CONFIGURATION SANS LIEN GOOGLE ---
      const messageOptions = {
        image: { url: "https://files.catbox.moe/2fmwpu.jpg" },
        caption: menuText,
        mentions: [extra.sender],
        contextInfo: {
          // Affiche le badge en haut et active le bouton "Voir la chaîne" en bas
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 100 
          },
          isForwarded: true,
          forwardingScore: 1 
          // J'ai supprimé externalAdReply pour enlever le lien Google/Catbox au-dessus
        }
      };

      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      if (fs.existsSync(imagePath)) {
        messageOptions.image = fs.readFileSync(imagePath);
      }

      await sock.sendMessage(extra.from, messageOptions, { quoted: msg });
      await sock.sendMessage(extra.from, { react: { text: "🙏", key: msg.key } });

    } catch (error) {
      console.error('Menu Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
