/**
 * List Command - AGM System Core (Prestige Edition)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { loadCommands } = require('../../utils/commandLoader');
const { sendButtons } = require('gifted-btns');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

module.exports = {
  name: 'list',
  aliases: ['l', 'help', 'commands', 'all'],
  category: 'general',
  description: 'Afficher la liste complète des commandes.',
  usage: '.list',

  async execute(sock, msg, args, { from, prefix, react }) {
    try {
      await react('📜');

      const commands = loadCommands();
      const categories = {};

      // Organisation des commandes par catégorie
      commands.forEach((cmd) => {
        const cat = cmd.category || 'others';
        if (!categories[cat]) {
          categories[cat] = new Set();
        }
        categories[cat].add(cmd.name);
      });

      // --- LOGIQUE DE NOM D'UTILISATEUR (PUSHNAME) ---
      // On récupère le pushName (ex: Truth Devices) ou on met "Utilisateur" par défaut
      const pushName = msg.pushName || 'ᴜsᴇʀ';
      const senderJid = msg.key.participant || msg.key.remoteJid;

      // --- EN-TÊTE DU MENU ---
      let menu = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛɢ 𝐗 - ᴍᴇɴᴜ')} •≫━╾╮*\n`;
      // Ici on affiche le nom de profil (pushName)
      menu += `*┃* 👤 *${toStyledCaps('ᴜᴛɪʟɪsᴀᴛᴇᴜʀ')} :* ${pushName}\n`;
      menu += `*┃* ⚡ *${toStyledCaps('ᴘʀᴇ́ꜰɪxᴇ')} :* [ ${prefix} ]\n`;
      menu += `*┃* 🤖 *${toStyledCaps('ᴠᴇʀsɪᴏɴ')} :* *1.0.0 (ᴍᴅ)*\n`;
      menu += `*╰━━━━━━━━━━━━━━━╯*\n\n`;

      const sortedCats = Object.keys(categories).sort();

      // --- GÉNÉRATION DES CATÉGORIES ---
      for (const cat of sortedCats) {
        menu += `*╭╼━≪• ${toStyledCaps(cat)} •≫━╾╮*\n`;
        const catCmds = Array.from(categories[cat]).sort();

        catCmds.forEach((cmdName) => {
          menu += `*┃* ➽ *${toStyledCaps(cmdName)}*\n`;
        });
        menu += `*╰━━━━━━━━━━━━━━━╯*\n\n`;
      }

      menu += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

      // Envoi du menu avec Boutons Interactifs
      await sendButtons(sock, from, {
        title: '',
        text: menu,
        footer: `*®ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs*`,
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '*sᴜɪᴠʀᴇ ʟᴀ ᴄʜᴀɪɴᴇ 💎*',
              url: 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '*ɢʜᴏsᴛɢ ɢɪᴛʜᴜʙ 💻*',
              url: 'https://github.com/georges16388/GhostG-X-'
            })
          }
        ]
      }, { 
        quoted: msg,
        mentions: [senderJid], // On garde la mention dans les métadonnées pour le tag silencieux
        contextInfo: {
            externalAdReply: {
                title: "ɢʜᴏꜱᴛɢ-x ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ",
                body: "sʏsᴛᴇᴍᴇ ᴅ'ᴀᴜᴛᴏᴍᴀᴛɪsᴀᴛɪᴏɴ ᴇʟɪᴛᴇ",
                mediaType: 1,
                thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
                showAdAttribution: false
            }
        }
      });

    } catch (err) {
      console.error('[LIST ERROR]:', err);
      sock.sendMessage(from, { text: `❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴜ ᴍᴇɴᴜ')}*` });
    }
  }
};
