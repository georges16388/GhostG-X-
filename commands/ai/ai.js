/**
 * Ghost AI - AGM Elite Response
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ',
    'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
    'q': 'ǫ', 'r': 'ʀ', 's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
    'y': 'ʏ', 'z': 'ᴢ',
    // Maintien des accents français pour ne pas casser la police
    'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'ä': 'ᴀ',
    'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'ö': 'ᴏ', 'ù': 'ᴜ', 'û': 'ᴜ', 'ü': 'ᴜ', 'ç': 'ᴄ'
  };
  
  return String(text)
    .toLowerCase()
    .split('')
    .map(c => fonts[c] || c)
    .join('');
};

// --- FONCTION DE DESIGN AGM (ADAPTIVE TEXT) ---
const AGM_DESIGN = (responseText) => {
  const styledText = toStyledCaps(responseText);

  // Évite les lignes vides inutiles au tout début ou à la fin de la réponse
  const formattedText = styledText
    .trim()
    .split('\n')
    .map(line => `*┃* ${line.trim()}`)
    .join('\n');

  return `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ᴀɪ ʀᴇsᴘᴏɴsᴇ')} •≫━╾╮*
*┃*
${formattedText}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
};

module.exports = {
  name: 'ai',
  aliases: ['gpt', 'ghost'],
  category: 'ai',
  description: 'Poser une question à l\'intelligence GhostG-X',
  usage: '.ai <votre question>',

  async execute(sock, msg, args, extra) {
    try {
      const query = args.join(' ');
      if (!query) return extra.reply(`⚠️ *${toStyledCaps('ᴘᴏsᴇᴢ ᴜɴᴇ ǫᴜᴇsᴛɪᴏɴ')}*`);

      // Réaction de chargement
      await sock.sendMessage(extra.from, { react: { text: '🧠', key: msg.key } });

      // Appel à l'API
      const response = await axios.get(`https://api.vreden.my.id/api/gpt?query=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      
      const aiResult = response.data.result || response.data.reply || response.data.message;

      if (!aiResult) throw new Error('AI_EMPTY_RESPONSE');

      // Envoi de la réponse formatée
      await sock.sendMessage(extra.from, {
        text: AGM_DESIGN(aiResult),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ",
            body: toStyledCaps("réponse générée avec succès"),
            mediaType: 1,
            // J'ai remis une miniature par défaut pour éviter que WhatsApp 
            // n'affiche un rectangle vide moche. Tu peux changer l'URL.
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg", 
            renderLargerThumbnail: true, 
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      // Réaction de succès
      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('AI Error:', error.message);
      
      // En cas d'erreur, on remplace le cerveau par une croix
      await sock.sendMessage(extra.from, { react: { text: '❌', key: msg.key } });
      await extra.reply(`❌ *${toStyledCaps('erreur de génération. l\'api est peut-être hors ligne.')}*`);
    }
  }
};
