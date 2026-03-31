/**
 * Menu Command - GhostG-X Edition
 * Affiche l'ensemble des rituels et commandes disponibles avec l'image locale
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
      
      // En-tête avec ton design
      let menuText = `╭╼━≪• *${toSmallCaps(config.botName || 'ɢʜᴏsᴛɢ-x ᴍᴅ')}* •≫━╾╮\n` +
                     `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                     `┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${pushName}\n` +
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
      
      menuText += `_ᴍᴇʀᴄɪ sᴇɪɢɴᴇᴜʀ ᴘᴏᴜʀ ᴛᴀ ɢʀᴀᴄᴇ_\n` +
                  `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ  ɢʜᴏsᴛɢ-𝐗*`;
      
      // Localisation de l'image dans le dossier utils
      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      
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
        // Repli en texte si l'image a été supprimée par mégarde
        await sock.sendMessage(extra.from, { 
          text: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      }
      
    } catch (error) {
      console.error('Menu error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};