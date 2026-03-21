/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (ɢʀᴀᴛɪᴛᴜᴅᴇ ᴇᴅɪᴛɪᴏɴ)
 * Optimisé pour le Pushname cliquable et le bouton Newsletter
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
  description: 'Menu GhostG-X avec Pushname et bouton Newsletter.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      // 1. CALCUL DU NOMBRE RÉEL DE COMMANDES
      const commands = loadCommands();
      const categories = {};
      let totalFiles = 0;

      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          totalFiles++;
          const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }
      });

      // 2. RÉCUPÉRATION DES INFOS UTILISATEUR
      const pushName = msg.pushName || 'ᴜsᴇʀ';
      const senderJid = extra.sender;
      const senderNumber = senderJid.split('@')[0];

      const prefix = config.prefix || '.';
      const botName = "ɢʜᴏsᴛɢ-x";
      const ownerNumber = "22651622652";

      // 3. CONSTRUCTION DU TEXTE (DESIGN PRÉCIS)
      let menuText = `╭╼━≪• *${botName}* •≫━╾╮\n`;
      menuText += `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n`;
      // La mention magique : @numéro (Nom)
      menuText += `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${botNumber} (${sock.user.name || botName})\n`;\n`;
      menuText += `┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ* : ❤️✝️\n`;
      menuText += `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n`;
      menuText += `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalFiles} ғɪʟᴇs\n`;
      menuText += `┃ *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : https://wa.me/22651622652\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // Liste des catégories dans l'ordre souhaité
      const catOrder = ['essentials', 'ai', 'admin', 'fun', 'media', 'owner', 'utility', 'faith', 'textmaker'];
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

      menuText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*\n`;
      menuText += `> *ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ*`;

      // 4. ENVOI DU MESSAGE AVEC OPTIONS NEWSLETTER
      const messageOptions = {
        image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
        caption: menuText,
        contextInfo: {
          mentionedJid: [senderJid], // Active le lien bleu sur le @numéro
          isForwarded: true,
          forwardingScore: 999,
          // Badge "Voir la chaîne" et Infos Newsletter
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          }
        }
      };

      await sock.sendMessage(extra.from, messageOptions, { quoted: msg });
      await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error('Menu Error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
