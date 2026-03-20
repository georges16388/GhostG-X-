/**
 * List/Help Command - GhostG-X- Control Panel
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const { sendButtons } = require('gifted-btns');

module.exports = {
  name: 'list',
  aliases: ['help', 'menu', 'aide', 'h'],
  description: 'Affiche le panneau de contrôle et la liste des commandes.',
  usage: '.list',
  category: 'essentials',
  
  async execute(sock, msg, args, extra) {
    try {
      const prefix = config.prefix || '.';
      const commands = loadCommands();
      const categories = {};
      
      // Groupement des commandes par catégorie
      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          const category = (cmd.category || 'Autres').toLowerCase();
          if (!categories[category]) categories[category] = [];
          categories[category].push(cmd);
        }
      });
      
      // Design du Header Ghost
      let menu = `╭╼━≪• ɢʜᴏsᴛɢ-x- ᴘᴀɴᴇʟ •≫━╾╮\n`;
      menu += `┃ 👤 ᴜᴛɪʟɪsᴀᴛᴇᴜʀ : ${msg.pushName || 'Ghost'}\n`;
      menu += `┃ ⚡ ᴘʀᴇғɪxᴇ : [ ${prefix} ]\n`;
      menu += `┃ 📂 ᴄᴀᴛᴇɢᴏʀɪᴇs : ${Object.keys(categories).length}\n`;
      menu += `╰━━━━━━━━━━━━━━━╯\n\n`;
      
      const orderedCats = Object.keys(categories).sort();
      
      for (const cat of orderedCats) {
        // Design des sections de catégories
        menu += `┏━━≪ *${cat.toUpperCase()}* ≫━━┓\n`;
        for (const cmd of categories[cat]) {
          menu += `┃ ❯ ${prefix}${cmd.name}\n`;
        }
        menu += `┗━━━━━━━━━━━━━┛\n\n`;
      }
      
      menu += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

      // Envoi avec boutons interactifs (Gifted-Btns)
      await sendButtons(sock, extra.from, {
        title: 'ɢʜᴏsᴛ ᴀɪ sʏsᴛᴇᴍ',
        text: menu.trim(),
        footer: '-ɢʜᴏsᴛɢ 𝐗 ᴇᴅɪᴛɪᴏɴ',
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'ɢɪᴛʜᴜʙ sᴏᴜʀᴄᴇ 📂',
              url: 'https://github.com/georges16388/GhostG-X-'
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'ᴊᴏɪɴ ᴄʜᴀɴɴᴇʟ 📢',
              url: 'https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A'
            })
          }
        ]
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(extra.from, { react: { text: "📜", key: msg.key } });
      
    } catch (err) {
      console.error('list.js error:', err);
      await extra.reply('❌ Erreur lors de la génération du menu.');
    }
  }
};
