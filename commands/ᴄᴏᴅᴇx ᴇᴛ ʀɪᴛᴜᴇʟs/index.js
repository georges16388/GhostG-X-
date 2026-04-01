/**
 * Affiche l'ensemble des rituels et commandes disponibles avec une image locale aléatoire
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

// Fonction avancée pour convertir du texte normal en Small Caps GRAS (Bold Small Caps)
function toBoldSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // Alphabet Small Caps en gras
  const boldSmallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? boldSmallCaps[index] : c;
  }).join('');
}

// Fonction pour nettoyer les caractères invisibles parasites dans les noms de catégories
function cleanCategoryName(name) {
  return name
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Supprime les espaces invisibles
    .trim()
    .toUpperCase();
}

module.exports = {
  name: 'ɢʀɪᴍᴏɪʀᴇ', 
  aliases: ['commands', 'menu', 'arcanes', 'index', 'm'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴀꜰꜰɪᴄʜᴇ ʟ\'ᴇɴꜱᴇᴍʙʟᴇ ᴅᴇꜱ ʀɪᴛᴜᴇʟꜱ ᴇᴛ ᴄᴏᴍᴍᴀɴᴅᴇꜱ ᴅɪꜱᴘᴏɴɪʙʟᴇꜱ**',
  usage: 'ɢʀɪᴍᴏɪʀᴇ',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      // Groupement et nettoyage des catégories
      commands.forEach((cmd, name) => {
        if (cmd.name === name) { // Ne compte que les noms principaux, pas les alias
          let rawCategory = cmd.category || '🔮 ᴀᴜᴛʀᴇs sᴏʀᴛs';
          let cleanedCategory = cleanCategoryName(rawCategory);

          if (!categories[cleanedCategory]) {
            categories[cleanedCategory] = [];
          }
          categories[cleanedCategory].push(cmd);
        }
      });

      const prefix = config.prefix || '.';
      const fileCount = commands.size;
      const userTag = `@${extra.sender.split('@')[0]}`;
      const botNameCaps = toBoldSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-𝐗');

      // En-tête avec ton design GhostG-X 100% Immersif
      let menuText = `╭╼━≪• *${botNameCaps}* •≫━╾╮\n` +
                     `┃ *ᴠɪɢɪʟᴀɴᴄᴇ* : 🟢 ᴇ́ᴠᴇɪʟʟᴇ́\n` +
                     `┃ *ᴘᴇ̀ʟᴇʀɪɴ* : ${userTag}\n` +
                     `┃ *ᴀʟʟɪᴀɴᴄᴇ* : ♰ sᴄᴇʟʟᴇ́ᴇ ♰\n` +
                     `┃ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ* : [ *${prefix}* ]\n` +
                     `┃ *ᴀʀᴄᴀɴᴇs* : ${fileCount} sᴏʀᴛs\n` +
                     `┃ *♛ sᴜᴢᴇʀᴀɪɴ* : https://wa.me/22651622652\n` +
                     `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      // Tri alphabétique des catégories uniques
      const sortedCategories = Object.keys(categories).sort();

      sortedCategories.forEach(catKey => {
        const cmdList = categories[catKey];
        if (cmdList && cmdList.length > 0) {

          // Titre de la catégorie en Bold Small Caps
          menuText += `╭╼━≪• *${catKey}* •≫━╾╮\n`;

          // Tri alphabétique des commandes à l'intérieur de la catégorie
          const sortedCmds = cmdList.sort((a, b) => a.name.localeCompare(b.name));

          sortedCmds.forEach(cmd => {
            // Toutes les commandes passent par la même police Small Caps
            const boldSmallCapsName = toBoldSmallCaps(cmd.name);
            menuText += `┃➽ *${boldSmallCapsName}*\n`;
          });

          menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        }
      });

      menuText += `*_♰ ǫᴜᴇ ʟᴀ ʟᴜᴍɪᴇ̀ʀᴇ ᴅɪssɪᴘᴇ ᴛᴇs ᴛᴇ́ɴᴇ̀ʙʀᴇs ♰_*\n` +
                  `> *sᴄᴇʟʟᴇ́ ᴘᴀʀ ʟᴇs ᴀʀᴄᴀɴᴇs ᴅᴇ ${botNameCaps}*`;

      // 🎲 SÉLECTION ALÉATOIRE DE L'IMAGE
      const randomNumber = Math.floor(Math.random() * 7) + 1;
      const imageName = `bot_image_${randomNumber}.jpg`;
      const imagePath = path.join(__dirname, '../../utils', imageName);

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
        // Repli de secours
        const fallbackPath = path.join(__dirname, '../../utils/bot_image.jpg');

        if (fs.existsSync(fallbackPath)) {
          const fallbackBuffer = fs.readFileSync(fallbackPath);
          await sock.sendMessage(extra.from, {
            image: fallbackBuffer,
            caption: menuText,
            mentions: [extra.sender]
          }, { quoted: msg });
        } else {
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
