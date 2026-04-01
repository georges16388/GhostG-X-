/**
 * Menu Command - GhostG-X Edition
 * Affiche l'ensemble des rituels et commandes disponibles avec une image locale aléatoire
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

// Fonction pour convertir du texte normal en Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'grimoire', 
  aliases: ['commands', 'menu', 'arcanes', 'index', 'm', 'help'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: 'Affiche l\'ensemble des rituels et commandes disponibles',
  usage: '.grimoire',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      // Groupement des commandes directement par le texte de leur catégorie
      commands.forEach((cmd, name) => {
        if (cmd.name === name) { // Ne compte que les noms principaux, pas les alias
          const categoryName = cmd.category || '🔮 ᴀᴜᴛʀᴇs sᴏʀᴛs';

          if (!categories[categoryName]) {
            categories[categoryName] = [];
          }
          categories[categoryName].push(cmd);
        }
      });

      const prefix = config.prefix || '.';
      const fileCount = commands.size;
      const pushName = msg.pushName || 'ᴜᴛɪʟɪsᴀᴛᴇᴜʀ';
      const userTag = `@${extra.sender.split('@')[0]}`;
      const botNameCaps = toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-𝐗');

      // En-tête avec ton design
      let menuText = `╭╼━≪• *${botNameCaps}* •≫━╾╮\n` +
                     `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                     `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : ${userTag}\n` +
                     `┃ *ᴊᴇsᴜs ᴛᴀɪᴍᴇ* : ❤️✝\n` +
                     `┃ *ᴘʀᴇғɪxᴇ* : [ ${prefix} ]\n` +
                     `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${fileCount} ғɪʟᴇs\n` +
                     `┃ *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : https://wa.me/22651622652\n` +
                     `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // Tri alphabétique des catégories
      const sortedCategories = Object.keys(categories).sort();

      sortedCategories.forEach(catKey => {
        const cmdList = categories[catKey];
        if (cmdList && cmdList.length > 0) {

          // Ton titre de catégorie
          menuText += `╭╼━≪• *${catKey.toUpperCase()}* •≫━╾╮\n`;

          // Tri alphabétique des commandes à l'intérieur de la catégorie
          const sortedCmds = cmdList.sort((a, b) => a.name.localeCompare(b.name));

          sortedCmds.forEach(cmd => {
            const smallCapsName = toSmallCaps(cmd.name);
            menuText += `┃➽ *${smallCapsName}*\n`;
          });

          menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        }
      });

      menuText += `*_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_❤️*\n` +
                  `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botNameCaps}*`;

      // 🎲 SÉLECTION ALÉATOIRE DE L'IMAGE 🎲
      // Génère un chiffre aléatoire entre 1 et 7
      const randomNumber = Math.floor(Math.random() * 7) + 1;
      
      // Construction du nom de fichier (ex: bot_image_4.jpg)
      const imageName = `bot_image_${randomNumber}.jpg`;
      const imagePath = path.join(__dirname, '../../utils', imageName);

      // Si l'image aléatoire existe, on l'envoie
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);

        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender],
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: config.newsletterJid || '120363425540434745@newsletter',
              newsletterName: config.botName || 'ɢʜᴏsᴛɢ-𝐗',
              serverMessageId: -1
            }
          }
        }, { quoted: msg });

      } else {
        // 🔄 Repli de secours : Si l'image aléatoire n'existe pas, on tente de charger l'ancienne bot_image.jpg
        const fallbackPath = path.join(__dirname, '../../utils/bot_image.jpg');
        
        if (fs.existsSync(fallbackPath)) {
          const fallbackBuffer = fs.readFileSync(fallbackPath);
          await sock.sendMessage(extra.from, {
            image: fallbackBuffer,
            caption: menuText,
            mentions: [extra.sender]
          }, { quoted: msg });
        } else {
          // Repli ultime en texte brut
          await sock.sendMessage(extra.from, { 
            text: menuText,
            mentions: [extra.sender]
          }, { quoted: msg });
        }
      }

    } catch (error) {
      console.error('Menu error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
