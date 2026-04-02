/**
 * Affiche l'ensemble des rituels et commandes disponibles avec une image locale aléatoire
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

const prefix = config.prefix || '.';

function toBoldSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const boldSmallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? boldSmallCaps[index] : c;
  }).join('');
}

function cleanCategoryName(name) {
  return name.replace(/[\u200B-\u200D\uFEFF]/g, '').trim(); 
}

module.exports = {
  name: 'ɢʀɪᴍᴏɪʀᴇ', 
  aliases: ['commands', 'menu', 'arcanes', 'index', 'm'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀꜰꜰɪᴄʜᴇ ʟ\'ᴇɴꜱᴇᴍʙʟᴇ ᴅᴇꜱ ʀɪᴛᴜᴇʟꜱ ᴇᴛ ᴄᴏᴍᴍᴀɴᴅᴇꜱ ᴅɪꜱᴘᴏɴɪʙʟᴇꜱ**',
  usage: `${prefix}ɢʀɪᴍᴏɪʀᴇ`,

  async execute(sock, msg, args, extra) {
    try {
      // Relecture dynamique de la configuration
      delete require.cache[require.resolve('../../config')];
      const freshConfig = require('../../config');

      const commands = loadCommands();
      const categories = {};

      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          let rawCategory = cmd.category || '🔮 ᴀᴜᴛʀᴇs sᴏʀᴛs';
          let cleanedCategory = cleanCategoryName(rawCategory);
          if (!categories[cleanedCategory]) categories[cleanedCategory] = [];
          categories[cleanedCategory].push(cmd);
        }
      });

      const fileCount = commands.size;
      const userTag = `@${extra.sender.split('@')[0]}`;
      const botNameCaps = toBoldSmallCaps(freshConfig.botName || 'ɢʜᴏsᴛɢ-𝐗');

      let menuText = `╭╼━≪• *${botNameCaps}* •≫━╾╮\n` +
                     `┃ *ᴠɪɢɪʟᴀɴᴄᴇ* : 🟢 ᴇ́ᴠᴇɪʟʟᴇ́\n` +
                     `┃ *ᴘᴇ̀ʟᴇʀɪɴ* : ${userTag}\n` +
                     `┃ *ᴀʟʟɪᴀɴᴄᴇ* : ♰ sᴄᴇʟʟᴇ́ᴇ ♰\n` +
                     `┃ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ* : [ *${prefix}* ]\n` +
                     `┃ *ᴀʀᴄᴀɴᴇs* : ${fileCount} sᴏʀᴛs\n` +
                     `┃ *♛ sᴜᴢᴇʀᴀɪɴ* : https://wa.me/22651622652\n` +
                     `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      const sortedCategories = Object.keys(categories).sort();
      sortedCategories.forEach(catKey => {
        const cmdList = categories[catKey];
        if (cmdList && cmdList.length > 0) {
          menuText += `*╭╼━≪• *${catKey}* •≫━╾╮*\n`;
          const sortedCmds = cmdList.sort((a, b) => a.name.localeCompare(b.name));
          sortedCmds.forEach(cmd => {
            menuText += `┃➻ *${toBoldSmallCaps(cmd.name)}*\n`;
          });
          menuText += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
        }
      });

      menuText += `*_♰ ǫᴜᴇ ʟᴀ ʟᴜᴍɪᴇ̀ʀᴇ ᴅɪssɪᴘᴇ ᴛᴇs ᴛᴇ́ɴᴇ̀ʙʀᴇs ♰_*\n` +
                  `> *sᴄᴇʟʟᴇ́ ᴘᴀʀ ʟᴇs ᴀʀᴄᴀɴᴇs ᴅᴇ ${botNameCaps}*`;

      const randomNumber = Math.floor(Math.random() * 7) + 1;
      const imagePath = path.join(__dirname, `../../utils/bot_image_${randomNumber}.jpg`);
      const fallbackPath = path.join(__dirname, '../../utils/bot_image.jpg');
      
      let imageBuffer;
      if (fs.existsSync(imagePath)) imageBuffer = fs.readFileSync(imagePath);
      else if (fs.existsSync(fallbackPath)) imageBuffer = fs.readFileSync(fallbackPath);

      // Préparation des options d'envoi avec le JID dynamique
      const messageOptions = {
        mentions: [extra.sender],
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            // C'est ici que l'Oracle applique ton sᴇᴀᴜ_ᴄᴀɴᴀʟ dynamique !
            newsletterJid: freshConfig.newsletterJid || '120363425540434745@newsletter',
            newsletterName: freshConfig.botName || 'ɢʜᴏsᴛɢ-𝐗',
            serverMessageId: -1
          }
        }
      };

      if (imageBuffer) {
        messageOptions.image = imageBuffer;
        messageOptions.caption = menuText;
      } else {
        messageOptions.text = menuText;
      }

      await sock.sendMessage(extra.from, messageOptions, { quoted: msg });

    } catch (error) {
      console.error('Menu error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
