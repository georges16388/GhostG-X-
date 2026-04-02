/**
 * Bible Command - GhostG-X Edition
 * Category : ♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../../config');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

// Dictionnaire pour traduire les livres FR en EN pour l'API
const frenchToEnglishBooks = {
  'genese': 'genesis', 'exode': 'exodus', 'levitique': 'leviticus', 'nombres': 'numbers', 'deuteronome': 'deuteronomy',
  'josue': 'joshua', 'juges': 'judges', 'ruth': 'ruth', '1 samuel': '1 samuel', '2 samuel': '2 samuel',
  '1 rois': '1 kings', '2 rois': '2 kings', '1 chroniques': '1 chronicles', '2 chroniques': '2 chronicles',
  'esdras': 'ezra', 'nehemie': 'nehemiah', 'esther': 'esther', 'job': 'job', 'psaumes': 'psalms',
  'proverbes': 'proverbs', 'ecclesiaste': 'ecclesiastes', 'cantique': 'song of solomon', 'esaie': 'isaiah',
  'jeremie': 'jeremiah', 'lamentations': 'lamentations', 'ezekiel': 'ezekiel', 'daniel': 'daniel',
  'osee': 'hosea', 'joel': 'joel', 'amos': 'amos', 'abdias': 'obadiah', 'jonas': 'jonah',
  'michee': 'micah', 'nahum': 'nahum', 'habacuc': 'habakkuk', 'sophonie': 'zephaniah',
  'haggee': 'haggai', 'zacharie': 'zechariah', 'malachie': 'malachi',
  'matthieu': 'matthew', 'marc': 'mark', 'luc': 'luc', 'jean': 'john', 'actes': 'acts',
  'romains': 'romans', '1 corinthiens': '1 corinthians', '2 corinthiens': '2 corinthians',
  'galates': 'galatians', 'ephesiens': 'ephesians', 'philippiens': 'philippians', 'colossiens': 'colossians',
  '1 airssaloniciens': '1 airssalonians', '2 airssaloniciens': '2 airssalonians',
  '1 timothee': '1 timothy', '2 timothee': '2 timothy', 'tite': 'titus', 'philemon': 'philemon',
  'hebreux': 'hebrews', 'jacques': 'james', '1 pierre': '1 peter', '2 pierre': '2 peter',
  '1 jean': '1 john', '2 jean': '2 john', '3 jean': '3 john', 'jude': 'jude', 'apocalypse': 'revelation'
};

// Fonction pour convertir du texte normal en Small Caps GhostG-X
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";
  return text.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

module.exports = {
  name: 'bible',
  aliases: ['ecritures', 'verset', 'saint', 'ᴇᴄʀɪᴛᴜʀᴇs'],
  category: '♰ sᴀɪɴᴛᴇᴛᴇ́ ᴄᴇ́ʟᴇsᴛᴇ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ɢᴇ́ɴᴇ̀ʀᴇ ᴜɴ ᴠᴇʀsᴇᴛ ᴀʟᴇ́ᴀᴛᴏɪʀᴇ ᴏᴜ ʀᴇᴄʜᴇʀᴄʜᴇ ᴜɴ ᴠᴇʀsᴇᴛ sᴘᴇ́ᴄɪғɪǫᴜᴇ ᴇɴ ғʀᴀɴᴄ̧ᴀɪs',
  usage: `${prefix}bible [ʟɪᴠʀᴇ ᴄʜᴀᴘɪᴛʀᴇ:ᴠᴇʀsᴇᴛ]`,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = msg.key.remoteJid;

      // ==========================================
      // OPTION 2 : L'utilisateur fait une recherche
      // ==========================================
      if (args.length > 0) {
        await extra.reply(`⏳ *ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴇ́ᴄʀɪᴛᴜʀᴇs sᴀɪɴᴛes...*`);

        let query = args.join(' ').toLowerCase();
        let apiQuery = query;

        // Traduction du livre FR en EN pour l'API (ex: jean 3:16 -> john 3:16)
        for (const [fr, en] of Object.entries(frenchToEnglishBooks)) {
          if (query.startsWith(fr)) {
            apiQuery = query.replace(fr, en);
            break;
          }
        }

        try {
          const response = await axios.get(`https://bible-api.com/${encodeURIComponent(apiQuery)}?translation=lsg`);

          if (!response.data || !response.data.text) {
             throw new Error("Verset introuvable");
          }

          const textBrut = response.data.text.trim();
          const referenceBrute = response.data.reference;

          // Conversion du texte et de la référence en style GhostG-X
          const textStyle = toSmallCaps(textBrut.toLowerCase());
          const refStyle = toSmallCaps(referenceBrute.toLowerCase());

          let responseMsg = `*╭╼━━━≪• sᴀɪɴᴛᴇs ᴇᴄʀɪᴛᴜʀᴇs •≫━━━╾╮*\n` +
                            `*┃* 🔎 *${toSmallCaps('recherche')} :* ${toSmallCaps(query)}\n\n` +
                            `📖 *${textStyle}*\n\n` +
                            `📜 *${refStyle}* (ᴠᴇʀsɪᴏɴ ɢʜᴏsᴛɢ-𝐗)\n\n` +
                            `_👑 ᴊᴇsᴜs ᴇsᴛ ʀᴏɪ ♛_\n\n` +
                            `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

          return await sock.sendMessage(chatId, { text: responseMsg }, { quoted: msg });

        } catch (apiError) {
          return await extra.reply(`❌ *ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ᴛʀᴏᴜᴠᴇʀ ᴄᴇ ᴠᴇʀsᴇᴛ. ᴠᴇ́ʀɪғɪᴇ ʟ'ᴏʀᴛʜᴏɢʀᴀᴘʜᴇ (ᴇx : ᴊᴇᴀɴ 3:16).*`);
        }
      }

       // ==========================================
      // OPTION 1 : Verset au hasard (JSON Local)
      // ==========================================
      const jsonPath = path.join(__dirname, 'bible.json');

      if (!fs.existsSync(jsonPath)) {
        return await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴅᴇs sᴀɪɴᴛᴇs ᴇ́ᴄʀɪᴛᴜʀᴇs (ʙɪʙʟᴇ.ᴊsᴏɴ) ᴇsᴛ ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ.*`);
      }

      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const verses = JSON.parse(rawData);

      if (!Array.isArray(verses) || verses.length === 0) {
        return await extra.reply(`❌ *ᴇʀʀᴇᴜʀ : ʟᴇ ɢʀɪᴍᴏɪʀᴇ ᴇsᴛ ᴠɪᴅᴇ.*`);
      }

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      await sock.sendMessage(chatId, {
        text: `${randomVerse}\n\n` +
              `_♛ ᴊᴇsᴜs ᴇsᴛ ʀᴏɪ ♛_\n\n` +
              `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      }, { quoted: msg });


    } catch (error) {
      console.error('Bible Command Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *ᴇʀʀᴇᴜʀ sᴘᴇᴄᴛʀᴀʟᴇ :* ${error.message}`
      }, { quoted: msg });
    }
  }
};
