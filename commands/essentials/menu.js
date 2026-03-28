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
  description: 'Menu GhostG-X avec image dynamique et lien newsletter.',
  usage: '.menu',

  async execute(sock, msg, args, extra) {
    try {
      const { from } = extra;
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const botName = "ɢʜᴏsᴛɢ-x ᴍᴅ";
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

      // --- CONSTRUCTION DU TEXTE ---
      let menuText = `*╭╼━≪• ${botName} •≫━╾╮*\n`;
      menuText += `*┃* *${toStyledCaps('sᴛᴀᴛᴜᴛ')}* : 🟢 *${toStyledCaps('ᴏɴʟɪɴᴇ')}*\n`;
      menuText += `*┃* *${toStyledCaps('ᴜᴛɪʟɪsᴀᴛᴇᴜʀ')}* : *@${senderJid.split('@')[0]}*\n`;
      menuText += `*┃* *${toStyledCaps('ᴘʀᴇғɪxᴇ')}* : [ *${prefix}* ]\n`;
      menuText += `*┃* *${toStyledCaps('ᴄᴏᴍᴍᴀɴᴅᴇs')}* : *${totalCmds}* *${toStyledCaps('ғɪʟᴇs')}*\n`;
      menuText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;

      const catOrder = ['essentials', 'ai', 'admin', 'media', 'utility', 'fun', 'owner', 'faith'];
      const sortedCats = Object.keys(categories).sort((a, b) => {
          let indexA = catOrder.indexOf(a);
          let indexB = catOrder.indexOf(b);
          if (indexA === -1) indexA = 99;
          if (indexB === -1) indexB = 99;
          return indexA - indexB;
      });

      for (const cat of sortedCats) {
        menuText += `*╭╼━≪• ${toStyledCaps(cat)} •≫━╾╮*\n`;
        menuText += categories[cat].map(cmd => `*┃* ➽ *${toStyledCaps(cmd.name)}*`).join('\n') + '\n';
        menuText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
      }

      menuText += `_“${toStyledCaps('ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ')}”_\n`;
      menuText += `> > *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // --- ENVOI AVEC NEWSLETTER ---
      await sock.sendMessage(from, {
        image: menuImage,
        caption: menuText,
        mentions: [senderJid],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          // Intégration de la Newsletter
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
            serverMessageId: 143
          },
          externalAdReply: {
            title: botName,
            body: "sʏsᴛᴇᴍ ᴘʀᴇsᴛɪɢᴇ ᴠ5",
            mediaType: 1,
            thumbnail: menuImage, 
            sourceUrl: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c', // Ta chaîne
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

    } catch (error) {
      console.error("Erreur Menu:", error);
    }
  }
};
