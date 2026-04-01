/**
 * Support Command - Display project links and developer contact
 * GhostG-X Edition
 */

const config = require('../../config.js');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
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
  name: 'support',
  aliases: ['group', 'aide', 'links', 'liens', 'contact'],
  category: '☬ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀғғɪᴄʜᴇ ʟᴇs ʟɪᴇɴs ᴅᴇs sᴀɴᴄᴛᴜᴀɪʀᴇs ᴇᴛ ʟᴇ ᴄᴏɴᴛᴀᴄᴛ ᴅᴜ ᴍᴀɪᴛʀᴇ**',
  usage: `${config.prefix || '.'}support`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;

    try {
      // Construction du message avec ton identité visuelle et un ton motivant
      const supportText = 
          `╭╼━≪• *⚡ ɢʜᴏsᴛɢ 𝐗 sᴜᴘᴘᴏʀᴛ* •≫━╾╮\n` +
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
          `┃ 👉🏾 https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
          `┃\n` +
          `┃ 💬 *${toSmallCaps('groupe dentraide')} :* (🤝 *${toSmallCaps('la famille')}*)\n` +
          `┃ 👉 https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf?mode=gi_t\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +

          `╭╼━≪• *👑 ʟᴇ ɢʀᴀɴᴅ ᴍᴀɪᴛʀᴇ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 👤 *${toSmallCaps('createur')} :* ᴛʀᴜᴛʜ ᴅᴇᴠɪᴄᴇs\n` +
          `┃ 📱 *${toSmallCaps('contact prive')} :* https://wa.me/22651622652\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +

          `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`;

      // Envoi du message avec la configuration d'officialisation (Newsletter)
      await sock.sendMessage(chatId, {
        text: supportText,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363425540434745@newsletter',
            newsletterName: 'ɢʜᴏsᴛɢ 𝐗',
            serverMessageId: -1
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Support command error:', error);
      await reply(`*❌ ${toSmallCaps('les liens du sanctuaire sont inaccessibles')} : ${error.message}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ 𝐗*`);
    }
  }
};
