/**
 * Pies Command - Images esthétiques (Africa Edition)
 * Custom Design & UX by -ɢʜᴏsᴛɢ 𝐗
 */

const axios = require('axios');

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const VALID_COUNTRIES = ['burkina', 'togo', 'benin', 'niger', 'mali', 'senegal', 'cameroun', 'ghana', 'ivorycoast', 'congo'];

// Design pour la légende
const PIES_DESIGN = (country) => `╭╼━≪• *ɢʜᴏsᴛ ᴀғʀɪᴄᴀ* •≫━╾╮
┃ ${toSmallCaps('ᴘᴀʏs')} : ${country.toUpperCase()} 🌍
┃ ${toSmallCaps('sᴛᴀᴛᴜs')} : ${toSmallCaps('ᴘʀᴇᴛ')} ✨
┃ ${toSmallCaps('sᴛʏʟᴇ')} : ${toSmallCaps('ᴀғʀɪᴄᴀɴ ᴀᴇsᴛʜᴇᴛɪᴄ')}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'pies',
  aliases: VALID_COUNTRIES,
  category: 'fun',
  desc: 'Obtenir des images esthétiques de pays africains',
  usage: 'pies <pays>',
  execute: async (sock, msg, args, extra) => {
    try {
      const commandName = extra.command.toLowerCase();
      let country = VALID_COUNTRIES.includes(commandName) ? commandName : (args[0] || '').toLowerCase();

      // Corrections de saisie
      if (country === 'ci' || country === 'ivoire') country = 'ivorycoast';

      if (!country || !VALID_COUNTRIES.includes(country)) {
        const list = VALID_COUNTRIES.map(c => toSmallCaps(c)).join(', ');
        return await extra.reply(
          `╭╼━≪• *ᴀғʀɪᴄᴀ sᴇʟᴇᴄᴛᴏʀ* •≫━╾╮\n` +
          `┃ ${toSmallCaps('ᴘᴀʏs ᴅɪsᴘᴏɴɪʙʟᴇs')} :\n` +
          `┃ ${list}\n` +
          `┃ ${toSmallCaps('ᴜsᴀɢᴇ')} : .${toSmallCaps('ᴘɪᴇs burkina')}\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }

      await sock.sendMessage(extra.from, { react: { text: "🌍", key: msg.key } });

      // Tentative via l'API Shizo ou Fallback via Unsplash pour garantir une image
      let imageUrl = `https://api.shizo.top/pies/${country}?apikey=shizo`;
      
      // On teste d'abord si l'image existe, sinon on utilise une source alternative esthétique
      let imageBuffer;
      try {
        const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 5000 });
        imageBuffer = Buffer.from(res.data);
      } catch (e) {
        // Fallback : Recherche d'image esthétique sur Unsplash si l'API Shizo échoue
        const fallbackRes = await axios.get(`https://source.unsplash.com/featured/?${country},aesthetic,culture`, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(fallbackRes.data);
      }

      await sock.sendMessage(extra.from, {
        image: imageBuffer,
        caption: PIES_DESIGN(country),
        contextInfo: {
            externalAdReply: {
                title: `ɢʜᴏsᴛ ᴀɪ - ${country.toUpperCase()} 🌍`,
                body: toSmallCaps("fierte africaine - collection visuelle"),
                mediaType: 1,
                thumbnail: imageBuffer,
                showAdAttribution: true,
                renderLargerThumbnail: false
            }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: "✨", key: msg.key } });

    } catch (error) {
      console.error('Pies Africa Error:', error);
      await extra.reply(`❌ ${toSmallCaps('ᴇʀʀᴇᴜʀ')} : ${toSmallCaps("impossible de charger l'image")}`);
    }
  }
};
