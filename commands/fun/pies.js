/**
 * Pies Command - Get random aesthetic images (Africa Edition)
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

// Liste des pays africains que tu as choisis
const VALID_COUNTRIES = ['burkina', 'togo', 'benin', 'niger', 'mali', 'senegal', 'cameroun', 'ghana', 'ivorycoast', 'congo'];

// Design pour la légende des photos
const PIES_DESIGN = (country) => `╭╼━≪• ɢʜᴏsᴛ ᴀғʀɪᴄᴀ •≫━╾╮
┃ ᴘᴀʏs : ${country.toUpperCase()} 🌍
┃ sᴛᴀᴛᴜs : ʀᴇᴀᴅʏ ✨
┃ sᴛʏʟᴇ : ᴀғʀɪᴄᴀɴ ᴀᴇsᴛʜᴇᴛɪᴄ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'pies',
  aliases: VALID_COUNTRIES, // Permet d'utiliser .burkina, .togo, etc.
  category: 'fun',
  desc: 'Get random aesthetic images from African countries',
  usage: 'pies <country>',
  execute: async (sock, msg, args, extra) => {
    try {
      const prefix = extra.prefix || '.';
      
      // Détection du pays via alias ou argument
      const commandName = extra.command.toLowerCase();
      let country = VALID_COUNTRIES.includes(commandName) ? commandName : (args[0] || '').toLowerCase();
      
      // Correction pour la Côte d'Ivoire si l'utilisateur écrit mal
      if (country === 'ci' || country === 'ivoire') country = 'ivorycoast';

      if (!country || !VALID_COUNTRIES.includes(country)) {
        return await extra.reply(
          `╭╼━≪• ᴀғʀɪᴄᴀ sᴇʟᴇᴄᴛᴏʀ •≫━╾╮\n` +
          `┃ ᴘᴀʏs ᴅɪsᴘᴏɴɪʙʟᴇs :\n` +
          `┃ ${VALID_COUNTRIES.join(', ')}\n` +
          `┃ ᴜsᴀɢᴇ : ${prefix}ᴘɪᴇs ʙᴜʀᴋɪɴᴀ\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }

      // Effet visuel : Réaction
      await sock.sendMessage(extra.from, { react: { text: "🌍", key: msg.key } });

      // Note : L'API shizo.top/pies utilise des sources spécifiques. 
      // Si l'API ne supporte pas encore ces pays, on peut rediriger vers une recherche Pinterest automatique.
      const url = `https://api.shizo.top/pies/${country}?apikey=shizo`;
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      });
      
      const imageBuffer = Buffer.from(response.data);
      
      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: PIES_DESIGN(country),
        contextInfo: {
            externalAdReply: {
                title: `GHOST AI - ${country.toUpperCase()} 🇧🇫`,
                body: "Fierté Africaine - Collection Visuelle",
                mediaType: 1,
                thumbnail: imageBuffer,
                renderLargerThumbnail: false
            }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: "✨", key: msg.key } });
      
    } catch (error) {
      console.error('Pies Africa Error:', error);
      // Fallback message si l'API n'a pas encore de photos pour ce pays précis
      await extra.reply(`❌ L'API n'a pas pu trouver d'image pour ${country}. Réessaie plus tard !`);
    }
  }
};
