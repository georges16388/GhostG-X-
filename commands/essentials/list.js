/**
 * List/Help Command - GhostG-X- Control Panel
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
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
    const chatId = msg.key.remoteJid;
    
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

      // --- DESIGN PRESTIGE GHOSTG 𝐗 ---
      let menu = `╭╼━≪• ɢʜᴏsᴛɢ-x- ᴘᴀɴᴇʟ •≫━╾╮\n`;
      menu += `┃ 👤 ᴜᴛɪʟɪsᴀᴛᴇᴜʀ : ${msg.pushName || 'ᴜsᴇʀ'}\n`;
      menu += `┃ ⚡ ᴘʀᴇғɪxᴇ : [ ${prefix} ]\n`;
      menu += `┃ 📂 ᴄᴀᴛᴇɢᴏʀɪᴇs : ${Object.keys(categories).length}\n`;
      menu += `╰━━━━━━━━━━━━━━━╯\n\n`;

      const orderedCats = Object.keys(categories).sort();

      for (const cat of orderedCats) {
        // Design des sections avec l'esthétique AGM
        menu += `┏━━≪ *${cat.toUpperCase()}* ≫━━┓\n`;
        for (const cmd of categories[cat]) {
          menu += `┃ ❯ ${prefix}${cmd.name}\n`;
        }
        menu += `┗━━━━━━━━━━━━━┛\n\n`;
      }

      menu += `📖 _“ ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ ”_\n`;
      menu += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

      // --- ENVOI AVEC BOUTONS INTERACTIFS (GIFTED-BTNS) ---
      await sendButtons(sock, chatId, {
        title: 'ɢʜᴏsᴛɢ 𝐗 ᴘʀᴇsᴛɪɢᴇ',
        text: menu.trim(),
        footer: 'ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ : ɢʜᴏsᴛɢ 𝐗 ⚡',
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
              url: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'
            })
          }
        ]
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(chatId, { react: { text: "📜", key: msg.key } });

    } catch (err) {
      console.error('list.js error:', err);
      // Fallback si les boutons échouent
      await sock.sendMessage(chatId, { text: '❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ* : Impossible de générer le menu.' }, { quoted: msg });
    }
  }
};
