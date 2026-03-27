/**
 * List Command - AGM System Core
 * Style requested by User (Ghost Menu)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const { sendButtons } = require('gifted-btns');

module.exports = {
  name: 'list',
  aliases: ['menu', 'help', 'commands', 'all'],
  category: 'general',
  description: 'Afficher la liste complète des commandes disponibles.',
  usage: '.list',

  async execute(sock, msg, args, { from, prefix, react }) {
    try {
      await react('📜');
      
      const commands = loadCommands();
      const categories = {};

      // Organisation des commandes par catégorie
      commands.forEach((cmd) => {
        // On ne traite que la commande principale, pas les alias
        if (!categories[cmd.category]) {
          categories[cmd.category] = new Set();
        }
        categories[cmd.category].add(cmd);
      });

      // --- CONSTRUCTION DU DESIGN GHOST ---
      let menu = `╭╼━≪• *ɢʜᴏsᴛɢ 𝐗 - ᴍᴇɴᴜ* •≫━╾╮\n`;
      menu += `┃ 👤 *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ :* @${msg.key.participant ? msg.key.participant.split('@')[0] : from.split('@')[0]}\n`;
      menu += `┃ ⚡ *ᴘʀᴇ́ꜰɪxᴇ :* [ ${prefix} ]\n`;
      menu += `┃ 📁 *ᴄᴀᴛᴇ́ɢᴏʀɪᴇs :* ${Object.keys(categories).length}\n`;
      menu += `┃ 🤖 *ᴠᴇʀsɪᴏɴ :* 3.0.0 (MD)\n`;
      menu += `╰━━━━━━━━━━━━━━━╯\n\n`;

      const sortedCats = Object.keys(categories).sort();

      for (const cat of sortedCats) {
        menu += `╭╼━≪• *${cat.toUpperCase()}* •≫━╾╮\n`;
        const catCmds = Array.from(categories[cat]);
        
        catCmds.forEach((cmd) => {
          menu += `┃ ❯ \`${prefix}${cmd.name}\`\n`;
        });
        menu += `╰━━━━━━━━━━━━━━━╯\n\n`;
      }

      menu += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

      // Envoi du menu avec Boutons Interactifs
      await sendButtons(sock, from, {
        title: '',
        text: menu,
        footer: `© 2026 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ`,
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Suivre la Chaîne 💎',
              url: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'GhostG GitHub 💻',
              url: 'https://github.com/georges16388/GhostG-X-'
            })
          }
        ]
      }, { 
        quoted: msg,
        mentions: [msg.key.participant || from]
      });

    } catch (err) {
      console.error('[LIST ERROR]:', err);
      sock.sendMessage(from, { text: '❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴜ ᴍᴇɴᴜ.*' });
    }
  }
};
