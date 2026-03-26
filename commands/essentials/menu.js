/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (clean edition)
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d': 'ᴅ','e': 'ᴇ','f': 'ғ','g': 'ɢ','h': 'ʜ',
    'i': 'ɪ','j': 'ᴊ','k': 'ᴋ','l': 'ʟ','m': 'ᴍ','n': 'ɴ','o': 'ᴏ','p': 'ᴘ',
    'q': 'ǫ','r': 'ʀ','s': 'ꜱ','t': 'ᴛ','u': 'ᴜ','v': 'ᴠ','w': 'ᴡ','x': 'x',
    'y': 'ʏ','z': 'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h', 'm'],
  category: 'essentials',
  description: 'Menu GhostG-X propre avec mention réelle.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {

      // 🔹 1. UTILISATEUR (PROPRE)
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.split('@')[0];
      const pushName = msg.pushName || "Utilisateur";

      // 🔹 2. BOT
      const botJid = sock.user.id;
      const botName = "ɢʜᴏsᴛɢ-x";
      const prefix = config.prefix || '.';

      // 🔹 3. COMMANDES
      const commands = loadCommands();
      if (!commands || commands.size === 0) {
        throw new Error("Aucune commande chargée");
      }

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

      // 🔹 4. MENU HEADER
      let menuText = `╭╼━≪• *${botName}* •≫━╾╮\n`;
      menuText += `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n`;
      menuText += `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : ${pushName} (@${senderNumber})\n`;
      menuText += `┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ* : ❤️✝️\n`;
      menuText += `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n`;
      menuText += `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalFiles} ғɪʟᴇs\n`;
      menuText += `┃ *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : wa.me/22651622652 (ɢʜᴏsᴛɢ)\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // 🔹 5. CATÉGORIES
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

      // 🔹 6. FOOTER
      menuText += `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n`;
      menuText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // 🔹 7. ENVOI
      await sock.sendMessage(extra.from, {
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

      // 🔹 8. REACTION
      await sock.sendMessage(extra.from, {
        react: { text: "⚡", key: msg.key }
      });

    } catch (error) {
      console.error('Menu Error:', error);
    }
  }
};