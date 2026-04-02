/**
 * Adoration - GhostG-X Edition
 * Diffuse un cantique d'adoration aléatoire depuis les archives (Zéro-Footprint)
 */

const config = require('../../config');

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
  name: 'adoration',
  aliases: ['adore', 'christiansong', 'cs'],
  category: '‎⌘ ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: `『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅɪғғᴜsᴇ ᴜɴ ᴄᴀɴᴛɪᴄᴜᴇ ᴅ'ᴀᴅᴏʀᴀᴛɪᴏɴ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴀ ʟ'ᴇᴛᴇʀɴᴇʟ ᴅᴇs ᴀʀᴍᴇᴇs`,
  usage: `${config.prefix || '.'}adoration`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const { reply } = { reply: async (text) => await sock.sendMessage(chatId, { text }, { quoted: msg }) };

    try {
      // Réaction avec l'orbe spirituel
      await sock.sendMessage(chatId, {
        react: { text: '✝️', key: msg.key }
      });

      // 1. Dictionnaire des cantiques hébergés sur Catbox
      const adorationLinks = {
        1: "https://files.catbox.moe/2rmu2h.mp3",
        2: "https://files.catbox.moe/jvwqui.mp3",
        3: "https://files.catbox.moe/99kb9g.mp3",
        4: "https://files.catbox.moe/ow2tyh.mp3",
        5: "https://files.catbox.moe/vorx59.mp3",
        6: "https://files.catbox.moe/msoi1h.mp3",
        7: "https://files.catbox.moe/4pya7m.mp3",
        8: "https://files.catbox.moe/l82me4.mp3",
        9: "https://files.catbox.moe/567ocl.mp3",
        10: "https://files.catbox.moe/qo1g64.mp3",
        11: "https://files.catbox.moe/99kb9g.mp3",
        12: "https://files.catbox.moe/ow2tyh.mp3",
        13: "https://files.catbox.moe/gzyxt5.mp3",
        14: "https://files.catbox.moe/msoi1h.mp3",
        15: "https://files.catbox.moe/ow2tyh.mp3"
      };

      // Génération d'un nombre aléatoire entre 1 et 15
      const randomNum = Math.floor(Math.random() * 15) + 1;
      const selectedAudioUrl = adorationLinks[randomNum];

      // 2. Envoi du fichier audio (ptt: true pour l'envoyer comme un message vocal)
      await sock.sendMessage(chatId, {
        audio: { url: selectedAudioUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: msg });

      // 3. Envoi du message textuel d'accompagnement
      await reply(`*♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

    } catch (error) {
      console.error('Error in adoration command:', error);
      await reply(`*❌ ${toSmallCaps('une erreur est survenue lors du rituel')}...*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
