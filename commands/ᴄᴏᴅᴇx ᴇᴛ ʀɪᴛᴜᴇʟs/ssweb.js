/**
 * SSWeb - Screenshot Website Command
 */

const APIs = require('../../utils/api');

// Fonction pour le style Small Caps (sécurisée pour le français)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  // On passe en minuscule et on retire les accents pour une conversion propre
  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss', 'capture'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴘʀᴇɴᴅ ᴜɴᴇ ᴄᴀᴘᴛᴜʀᴇ ᴅ\'ᴇ́ᴄʀᴀɴ ᴅ\'ᴜɴ ꜱᴀɴᴄᴛᴜᴀɪʀᴇ ᴡᴇʙ**',
  usage: 'ssweb',

  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(
          `╭╼━≪• *⚠️ ᴇᴄʜᴇᴄ ᴅᴇ ʟɪɴᴠᴏᴄᴀᴛɪᴏɴ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('indique ladresse dun sanctuaire web')} !*\n` +
          `┃ 💡 *${toSmallCaps('exemple')} :* .ssweb google.com\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      let url = args.join(' ');

      // Auto-fix : Ajoute https:// si l'utilisateur l'oublie
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      await sock.sendMessage(extra.from, {
        react: { text: '📸', key: msg.key }
      });

      const screenshotBuffer = await APIs.screenshotWebsite(url);

      const captionText = 
          `╭╼━≪• *🖼️ ᴠɪsɪᴏɴ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🌐 *${toSmallCaps('source')} :* ${url}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      
 `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(extra.from, {
        image: screenshotBuffer,
        caption: captionText
      }, { quoted: msg });

    } catch (error) {
      console.error('SSWeb command error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${toSmallCaps('impossible de capturer ce sanctuaire')}`);
    }
  }
};
