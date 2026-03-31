/**
 * Support Command - Display project links and developer contact
 */

const config = require('../../config.js');

// Fonction pour le style Small Caps (sécurisée pour le français)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  
  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'sᴜᴘᴘᴏʀᴛ',
  aliases: ['support', 'group', 'aide', 'links', 'liens', 'ᴄᴏɴᴛᴀᴄᴛ'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: 'ᴀғғɪᴄʜᴇ ʟᴇs ʟɪᴇɴs ᴅᴇs sᴀɴᴄᴛᴜᴀɪʀᴇs ᴇᴛ ʟᴇ ᴄᴏɴᴛᴀᴄᴛ ᴅᴜ ᴍᴀɪ̂ᴛʀᴇ',
  usage: '.sᴜᴘᴘᴏʀᴛ',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      // Construction du message avec ton identité visuelle et un ton motivant
      const supportText = 
          `╭╼━≪• *⚡ ɢʜᴏsᴛɢ-x sᴜᴘᴘᴏʀᴛ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🔮 *${toSmallCaps('rejoignez la legende')} !*\n` +
          `┃ *${toSmallCaps('ne restez pas dans lombre')}...* 🌌\n` +
          `┃ *${toSmallCaps('entrez dans nos cercles pour')}*\n` +
          `┃ *${toSmallCaps('maitriser la puissance du bot')} !*\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          
          `╭╼━≪• *🔗 ɴᴏs sᴀɴᴄᴛᴜᴀɪʀᴇs* •≫━╾╮\n` +
          `┃\n` +
          `┃ 📢 *${toSmallCaps('chaine telegram')} :* (⚡ *${toSmallCaps('exclusivites')}*)\n` +
          `┃ 👉 https://t.me/ghostgxbot\n` +
          `┃\n` +
          `┃ 🟢 *${toSmallCaps('chaine whatsapp')} :* (🔥 *${toSmallCaps('mises a jour')}*)\n` +
          `┃ 👉 https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
          `┃\n` +
          `┃ 💬 *${toSmallCaps('groupe dentraide')} :* (🤝 *${toSmallCaps('la famille')}*)\n` +
          `┃ 👉 https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          
          `╭╼━≪• *👑 ʟᴇ ɢʀᴀɴᴅ ᴍᴀɪᴛʀᴇ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 👤 *${toSmallCaps('createur')} :* ɢʜᴏsᴛɢ\n` +
          `┃ 📱 *${toSmallCaps('contact prive')} :* ᴡᴀ.ᴍᴇ/22651622652\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          
          `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      // Envoi du message avec la configuration d'officialisation (Newsletter)
      await sock.sendMessage(chatId, {
        text: supportText,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: 'ɢʜᴏsᴛɢ-𝐗',
            serverMessageId: -1
          }
        }
      }, { quoted: msg });

    } catch (error) {
      // Style d'erreur simple et direct selon tes préférences
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message.toUpperCase()}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`);
    }
  }
};
