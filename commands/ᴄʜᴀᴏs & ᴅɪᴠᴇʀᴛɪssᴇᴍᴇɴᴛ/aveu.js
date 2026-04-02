/**
 * Aveu Command - GhostG-X Edition
 * Récupère une question de vérité aléatoire et la traduit en français
 */

const { truth } = require('@bochilteam/scraper');
const { translate } = require('@vitalets/google-translate-api');
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

const prefix = config.prefix || '.';

module.exports = {
  name: 'aveu',
  aliases: ['truth', 'verite', 'confession'],
  category: '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɪɴᴠᴏǫᴜᴇ ᴜɴᴇ sᴇɴᴛᴇɴᴄᴇ ᴅᴇ ᴠᴇʀɪᴛᴇ ᴀʟᴇᴀᴛᴏɪʀᴇ ᴘᴏᴜʀ ᴜɴ ᴍᴇᴍʙʀᴇ',
  usage: `${prefix}aveu`,
  groupOnly: false,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      // Extraction de la vérité depuis le scraper
      const question = await truth();

      // Traduction directe en français pour le sanctuaire
      const res = await translate(question, { to: 'fr' });

      // Construction du message stylisé aux arcanes de GhostG-X
      const finalMessage = `*╭╼━━━≪• ʟ'ᴀᴜᴅɪᴇɴᴄᴇ ᴅᴇ ʟ'ᴀᴠᴇᴜ •≫━━━╾╮*\n` +
                           `*┃ 📜 ${toSmallCaps('ta sentence')} :*\n` +
                           `*┃ ${res.text}*\n` +
                           `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
                           `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

      await reply(finalMessage);

    } catch (error) {
      console.error('Truth (Aveu) Error:', error);
      await reply(`*❌ ${toSmallCaps('l\'expiation a echoue, l\'oracle reste muet')} : ${error.message}*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
    }
  }
};
