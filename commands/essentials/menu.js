/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (ɢʀᴀᴛɪᴛᴜᴅᴇ ᴇᴅɪᴛɪᴏɴ)
 * Fix : Syntaxe & Mentions dynamiques
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

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
      // 1. CALCUL DES COMMANDES
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

      // 2. RÉCUPÉRATION DES INFOS (BOT ID)
      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botNumber = botJid.split('@')[0];
      const botName = "ɢʜᴏsᴛɢ-x";
      const prefix = config.prefix || '.';

      // 3. CONSTRUCTION DU TEXTE
      let menuText = `╭╼━≪• *${botName}* •≫━╾╮\n`;
      menuText += `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n`;
      // Correction de la ligne Utilisateur
      menuText += `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${botNumber} (${sock.user.name || botName})\n`;
      menuText += `┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ* : ❤️✝️\n`;
      menuText += `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n`;
      menuText += `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalFiles} ғɪʟᴇs\n`;
      menuText += `┃ *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : https://wa.me/22651622652\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

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

      // 4. ENVOI
      await sock.sendMessage(extra.from, {
        image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
        caption: menuText,
        contextInfo: {
          mentionedJid: [botJid], // IMPORTANT: botJid pour que le @numéro soit cliquable
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error('Menu Error:', error);
    }
  }
};
