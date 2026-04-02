/**
 * Adoration - GhostG-X Edition
 * Diffuse un cantique d'adoration aléatoire depuis les archives
 */

const fs = require('fs');
const path = require('path');
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

      // Définition du chemin vers le dossier utils
      const audioDir = path.join(__dirname, '../../utils');
      
      // Génération d'un nombre aléatoire entre 1 et 10
      const randomNum = Math.floor(Math.random() * 10) + 1;
      const audioFileName = `adoration${randomNum}.mp3`;
      const audioPath = path.join(audioDir, audioFileName);

      // Vérification si le fichier existe bien avant l'envoi
      if (!fs.existsSync(audioPath)) {
        return reply(`*❌ ${toSmallCaps('le cantique')} ${audioFileName} ${toSmallCaps('est introuvable dans le codex')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

      const audioBuffer = fs.readFileSync(audioPath);

      // Envoi du fichier audio (ptt: false pour l'envoyer en tant que fichier audio et non message vocal)
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${audioFileName}`,
        ptt: true
      }, { quoted: msg });

      // Envoi du message textuel d'accompagnement
      await reply(`*♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);

    } catch (error) {
      console.error('Error in adoration command:', error);
      await reply(`*❌ ${toSmallCaps('une erreur est survenue lors du rituel')}...*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
