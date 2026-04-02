/**
 * Affiche l'ensemble des rituels et commandes disponibles avec une image locale aléatoire
 * GhostG-X Edition - Rang Dynamique avec Masquage Hashes
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // 🛡️ Importation requise pour les hashes

const prefix = config.prefix || '.';

// Fonction pour le style Small Caps classique
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

// Fonction pour le style Gras Small Caps
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
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀꜰꜰɪᴄʜᴇ ʟ\'ᴇɴꜱᴇᴍʙʟᴇ ᴅᴇꜱ ʀɪᴛᴜᴇʟꜱ ᴇᴛ ᴄᴏᴍᴍᴀɴᴅᴇꜱ ᴅɪꜱᴘᴏɴɪʙʟᴇꜱ',
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

      // Calcule le vrai nombre de sorts uniques sans compter les alias
      const realCommandsCount = Object.values(categories).reduce((acc, curr) => acc + curr.length, 0);
      const botNameCaps = toBoldSmallCaps(freshConfig.botName || 'ɢʜᴏsᴛɢ-𝐗');

      // 🛡️ DÉTERMINATION DU RANG PAR EMPREINTE CRYPTOGRAPHIQUE (ZÉRO-FOOTPRINT)
      const senderNumber = extra.sender.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');
      
      // Les empreintes SHA-256 de tes deux numéros maîtres
      const masterHashes = [
        '06b54ba67f8f495d3923a195d866df6684c4a8489b9200245cfd967a2f15a5d8',
        '1fa2429423005e19710a46165501a1d5a4c3a2c14d6c482d96ef8f80d415e899'
      ];
      
      let userRank;
      if (masterHashes.includes(senderHash)) {
        userRank = toSmallCaps('maître suprême ♕');
      } else {
        userRank = toSmallCaps('utilisateur');
      }

      let menuText = `╭╼━≪• *${botNameCaps}* •≫━╾╮\n` +
                     `┃ *ᴠɪɢɪʟᴀɴᴄᴇ* : 🟢 *ᴇ́ᴠᴇɪʟʟᴇ́*\n` +
                     `┃ *ᴘᴇ̀ʟᴇʀɪɴ* : ${toSmallCaps(sock.user.name || "Georges")}\n` +
                     `┃ *ʀᴀɴɢ* : ${userRank}\n` + 
                     `┃ *ᴀʟʟɪᴀɴᴄᴇ* : ♰ sᴄᴇʟʟᴇ́ᴇ ♰\n` +
                     `┃ *ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ* : [ *${prefix}* ]\n` +
                     `┃ *ᴀʀᴄᴀɴᴇs* : ${realCommandsCount} sᴏʀᴛs\n` +
                     `┃ *♛ sᴜᴢᴇʀᴀɪɴ* : *ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs ⚔*\n` +
                     `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;

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

      menuText += `*_♰ ǫᴜᴇ ʟᴀ ʟᴜᴍɪᴇ̀ʀᴇ ᴅᴜ sᴀɪɴᴛ-ᴇsᴘʀɪᴛ ʙʀɪsᴇ ᴇᴛ ᴅɪssɪᴘᴇ ᴛᴏᴜᴛᴇ ᴛᴇ́ɴᴇ̀ʙʀᴇ ♰_*\n` +
                  `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      const randomNumber = Math.floor(Math.random() * 7) + 1;
      const imagePath = path.join(__dirname, `../../utils/bot_image_${randomNumber}.jpg`);
      const fallbackPath = path.join(__dirname, '../../utils/bot_image.jpg');

      let imageBuffer;
      if (fs.existsSync(imagePath)) imageBuffer = fs.readFileSync(imagePath);
      else if (fs.existsSync(fallbackPath)) imageBuffer = fs.readFileSync(fallbackPath);

      const messageOptions = {
        mentions: [extra.sender],
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
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
