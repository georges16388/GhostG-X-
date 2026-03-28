/**
 * Ghost AI - AGM Elite Response
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const axios = require('axios');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// --- FONCTION DE DESIGN AGM (ADAPTIVE TEXT) ---
const AGM_DESIGN = (responseText) => {
  // On convertit TOUT le texte de l'IA en SmallCaps
  const styledText = toStyledCaps(responseText);
  
  return `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛ ᴀɪ ʀᴇsᴘᴏɴsᴇ')} •≫━╾╮*
*┃*
*┃* ${styledText.split('\n').join('\n*┃* ')}
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

      await sock.sendMessage(extra.from, { react: { text: '🧠', key: msg.key } });

      // Appel à ton API AI habituelle
      const response = await axios.get(`https://api.vreden.my.id/api/gpt?query=${encodeURIComponent(query)}`);
      const aiResult = response.data.result || response.data.reply;

      if (!aiResult) throw new Error('AI_EMPTY');

      // Envoi de la réponse formatée
      await sock.sendMessage(extra.from, {
        text: AGM_DESIGN(aiResult),
        contextInfo: {
          externalAdReply: {
            title: "ɢʜᴏsᴛ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ",
            body: toStyledCaps("reponse generee avec succes"),
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

      await sock.sendMessage(extra.from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('AI Error:', error);
      await extra.reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ɢᴇɴᴇʀᴀᴛɪᴏɴ')}*`);
    }
  }
};
