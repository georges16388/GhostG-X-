/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴇɴᴜ ᴘʀᴇsᴛɪɢᴇ ᴠ5 (ᴇʟɪᴛᴇ ᴇᴅɪᴛɪᴏɴ)
 * sᴛʏʟᴇ ʙʏ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'h', 'm'],
  category: 'essentials',
  description: 'Menu GhostG-X avec design Prestige et image dynamique.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const { from, pushName } = extra;
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const prefix = config.prefix || '.';

      // --- LOGIQUE D'IMAGE DYNAMIQUE ---
      const localImgPath = path.join(process.cwd(), 'utils', 'bot_image.jpg');
      const menuImage = fs.existsSync(localImgPath) 
        ? fs.readFileSync(localImgPath) 
        : { url: 'https://files.catbox.moe/2fmwpu.jpg' };

      // --- CHARGEMENT COMMANDES ---
      const commands = loadCommands();
      const categories = {};
      let totalCmds = 0;

      commands.forEach((cmd) => {
        totalCmds++;
        const cat = cmd.category ? cmd.category.toLowerCase() : 'autres';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      });

      // --- CONSTRUCTION DU TEXTE (DESIGN EXACT) ---
      let menuText = `╭╼━≪• *ɢʜᴏsᴛɢ-x ᴍᴅ* •≫━╾╮\n`;
      menuText += `┃\n`;
      menuText += `┃ ${toStyledCaps('statut')} : 🟢 ${toStyledCaps('online')}\n`;
      menuText += `┃ ${toStyledCaps('utilisateur')} : @${senderJid.split('@')[0]}\n`;
      menuText += `┃ ${toStyledCaps('jesus taime')} : ❤️✝️\n`;
      menuText += `┃ ${toStyledCaps('prefixe')} : [ *${prefix}* ]\n`;
      menuText += `┃ ${toStyledCaps('commandes')} : ${totalCmds} ${toStyledCaps('files')}\n`;
      menuText += `┃\n`;
      menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // Ordre des catégories selon ton souhait
      const catOrder = ['essentials', 'ai', 'admin', 'media', 'utility', 'fun', 'owner', 'textmarker'];
      
      const sortedCats = Object.keys(categories).sort((a, b) => {
          let indexA = catOrder.indexOf(a);
          let indexB = catOrder.indexOf(b);
          if (indexA === -1) indexA = 99;
          if (indexB === -1) indexB = 99;
          return indexA - indexB;
      });

      for (const cat of sortedCats) {
        menuText += `╭╼━≪• *${toStyledCaps(cat)}* •≫━╾╮\n`;
        // Tri alphabétique des commandes à l'intérieur de la catégorie
        const sortedCmds = categories[cat].sort((a, b) => a.name.localeCompare(b.name));
        menuText += sortedCmds.map(cmd => `┃ ➽ *${toStyledCaps(cmd.name)}*`).join('\n') + '\n';
        menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      }

      menuText += `_“${toStyledCaps('merci seigneur pour ta grace')}”_\n`;
      menuText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // --- ENVOI AVEC NEWSLETTER ---
      await sock.sendMessage(from, {
        image: menuImage,
        caption: menuText,
        mentions: [senderJid],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          },
          externalAdReply: {
            title: "ɢʜᴏsᴛɢ-x ᴍᴅ",
            body: "sʏsᴛᴇᴍ ᴘʀᴇsᴛɪɢᴇ ᴠ5",
            mediaType: 1,
            thumbnail: menuImage, 
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error("Erreur Menu:", error);
    }
  }
};
