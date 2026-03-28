/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (ᴄʟᴇᴀɴ ᴇᴅɪᴛɪᴏɴ)
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

/**
 * Fonction récursive pour compter tous les fichiers .js
 * dans le dossier commands et ses sous-dossiers.
 */
const countFiles = (dirPath) => {
  let count = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += countFiles(fullPath); // On descend dans le sous-dossier
    } else if (file.endsWith('.js')) {
      count++; // C'est un fichier de commande
    }
  });
  return count;
};

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d': 'ᴅ','e': 'ᴇ','f': 'ғ','g': 'ɢ','h': 'ʜ',
    'i': 'ɪ','j': 'ᴊ','k': 'ᴋ','l': 'ʟ','m':'ᴍ','n': 'ɴ','o': 'ᴏ','p': 'ᴘ',
    'q': 'ǫ','r': 'ʀ','s': 'ꜱ','t': 'ᴛ','u': 'ᴜ','v':'ᴠ','w': 'ᴡ','x': 'x',
    'y': 'ʏ','z': 'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h', 'm'],
  category: 'essentials',
  description: 'Menu GhostG-X propre avec compteur de fichiers réel.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const { from } = extra;
      
      // 🔹 1. IDENTIFICATION UTILISATEUR
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.split('@')[0];
      const prefix = config.prefix || '.';

      // 🔹 2. COMPTEUR DE FICHIERS (RÉCURSIF)
      const commandsPath = path.join(process.cwd(), 'commands');
      const totalFilesCount = countFiles(commandsPath);

      // 🔹 3. CHARGEMENT DES COMMANDES POUR LES CATÉGORIES
      const commands = loadCommands();
      const categories = {};

      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(cmd);
        }
      });

      // 🔹 4. CONSTRUCTION DU HEADER
      let menuText = `╭╼━≪• *ɢʜᴏsᴛɢ-x ᴍᴅ* •≫━╾╮\n`;
      menuText += `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n`;
      menuText += `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${senderNumber}\n`;
      menuText += `┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ* : ❤️✝️\n`;
      menuText += `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n`;
      menuText += `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalFilesCount} ${toStyledCaps('files')}\n`; // Compteur réel ici
      menuText += `┃ *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : wa.me/22651622652\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // 🔹 5. ORDRE DES CATÉGORIES
      const catOrder = ['essentials', 'ai', 'admin', 'fun', 'media', 'owner', 'utility', 'faith', 'textmarker'];
      const existingCats = Object.keys(categories).sort((a, b) => {
          let indexA = catOrder.indexOf(a);
          let indexB = catOrder.indexOf(b);
          if (indexA === -1) indexA = 99;
          if (indexB === -1) indexB = 99;
          return indexA - indexB;
      });

      // 🔹 6. GÉNÉRATION DES SECTIONS
      for (const cat of existingCats) {
        menuText += `╭╼━≪• *${toStyledCaps(cat)}* •≫━╾╮\n`;
        const sortedCmds = categories[cat].sort((a, b) => a.name.localeCompare(b.name));
        for (const cmd of sortedCmds) {
          menuText += `┃➽ *${toStyledCaps(cmd.name)}*\n`;
        }
        menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      }

      // 🔹 7. FOOTER
      menuText += `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n`;
      menuText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // 🔹 8. ENVOI DU MESSAGE
      await sock.sendMessage(from, {
        image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
        caption: menuText,
        contextInfo: {
          mentionedJid: [senderJid],
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error('Menu Prestige Error:', error);
    }
  }
};
