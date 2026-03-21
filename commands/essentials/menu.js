/**
 * Menu Command - GhostG-X Prestige Edition V5 (Gratitude Edition)
 * Design Pur & Stylisé par -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
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
  description: 'Menu complet GhostG-X.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};
      let totalCommands = 0;

      // Compte exact et tri par catégorie
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
      // Affiche le nom du propriétaire (celui qui a déployé)
      const ownerName = config.ownerName || "Truth Devices"; 

      // --- EN-TÊTE ---
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

      // --- LISTE DE TOUTES LES COMMANDES ---
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

      const messageOptions = {
        caption: menuText,
        mentions: [extra.sender],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          externalAdReply: {
            title: botName,
            body: toStyledCaps("jesus taime - truth devices"),
            mediaType: 1,
            sourceUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c",
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      };

      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      const finalImage = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : { url: "https://files.catbox.moe/2fmwpu.jpg" };

      await sock.sendMessage(extra.from, { image: finalImage, ...messageOptions }, { quoted: msg });
      await sock.sendMessage(extra.from, { react: { text: "🙏", key: msg.key } });

    } catch (error) {
      console.error('Menu Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
