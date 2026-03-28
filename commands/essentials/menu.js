/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ)
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
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
      // 🔹 1. INFOS UTILISATEUR & BOT
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.split('@')[0];
      const botName = "ɢʜᴏsᴛɢ-x ᴍᴅ";
      const prefix = config.prefix || '.';

      // 🔹 2. CHARGEMENT DES COMMANDES
      const commands = loadCommands();
      const categories = {};
      let totalCmds = 0;

      commands.forEach((cmd) => {
        totalCmds++;
        const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
        if (!categories[cat]) categories[cat] = [];
        // Évite les doublons si une commande a des alias
        if (!categories[cat].find(c => c.name === cmd.name)) {
          categories[cat].push(cmd);
        }
      });

      // 🔹 3. HEADER DU MENU
      let menuText = `╭╼━≪• *${botName}* •≫━╾╮\n`;
      menuText += `┃\n`;
      menuText += `┃ ${toStyledCaps('sᴛᴀᴛᴜᴛ')} : 🟢 ${toStyledCaps('ᴏɴʟɪɴᴇ')}\n`;
      menuText += `┃ ${toStyledCaps('ᴜᴛɪʟɪsᴀᴛᴇᴜʀ')} : @${senderNumber}\n`;
      menuText += `┃ ${toStyledCaps('ᴊᴇsᴜs ᴛᴀɪᴍᴇ')} : ❤️✝️\n`;
      menuText += `┃ ${toStyledCaps('ᴘʀᴇғɪxᴇ')} : [ *${prefix}* ]\n`;
      menuText += `┃ ${toStyledCaps('ᴄᴏᴍᴍᴀɴᴅᴇs')} : ${totalCmds} ${toStyledCaps('ғɪʟᴇs')}\n`;
      menuText += `┃\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // 🔹 4. GÉNÉRATION DES CATÉGORIES
      const catOrder = ['essentials', 'ai', 'admin', 'media', 'utility', 'fun', 'owner', 'faith', 'textmaker'];
      const currentCats = Object.keys(categories);
      const sortedCats = [...new Set([...catOrder.filter(c => currentCats.includes(c)), ...currentCats.sort()])];

      for (const cat of sortedCats) {
        if (!categories[cat] || categories[cat].length === 0) continue;

        menuText += `╭╼━≪• *${toStyledCaps(cat)}* •≫━╾╮\n`;
        // Alignement propre des commandes
        const cmdList = categories[cat].map(cmd => `┃ ➽ *${toStyledCaps(cmd.name)}*`).join('\n');
        menuText += `${cmdList}\n`;
        menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      }

      // 🔹 5. FOOTER
      menuText += `_“${toStyledCaps('ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ')}”_\n`;
      menuText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // 🔹 6. ENVOI AVEC CONTEXTE AVANCÉ
      await sock.sendMessage(extra.from, {
        image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
        caption: menuText,
        mentions: [senderJid],
        contextInfo: {
          mentionedJid: [senderJid],
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          },
          externalAdReply: {
            title: botName,
            body: "sʏsᴛᴇᴍ ᴘʀᴇsᴛɪɢᴇ ᴠ5",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            sourceUrl: "https://github.com/georges16388",
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error('Menu Prestige Error:', error);
      await extra.reply("❌ ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟ'ᴀғғɪᴄʜᴀɢᴇ ᴅᴜ ᴍᴇɴᴜ.");
    }
  }
};
