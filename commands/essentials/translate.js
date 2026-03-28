/**
 * Translate Command - GhostG-X MD
 * Style requested by User (Full SmallCaps Edition)
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

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

module.exports = {
  name: 'translate',
  aliases: ['tr', 'traduire', 'trans'],
  category: 'essentials',
  description: 'Traduire un texte dans une autre langue.',
  usage: '.tr <texte> <lang>',

  async execute(sock, msg, args, { from, react, reply }) {
    try {
      // --- DESIGN AIDE / USAGE ---
      if (args.length < 2) {
        let helpText = `*╭╼━≪• ${toStyledCaps('ᴀɢᴍ ᴛʀᴀɴsʟᴀᴛᴏʀ')} •≫━╾╮*\n`;
        helpText += `*┃* 📖 *${toStyledCaps('ᴜsᴀɢᴇ')}* : *.ᴛʀ <ᴛᴇxᴛᴇ> <ʟᴀɴɢ>*\n`;
        helpText += `*┃* 💡 *${toStyledCaps('ᴇxᴇᴍᴘʟᴇ')}* : *.ᴛʀ ʜᴇʟʟᴏ ғʀ*\n`;
        helpText += `*╰━━━━━━━━━━━━━━━╯*\n`;
        helpText += `*${toStyledCaps('ᴄᴏᴅᴇs')} :* *ғʀ, ᴇɴ, ᴇs, ᴀʀ, ᴊᴀ, ʀᴜ...*\n\n`;
        helpText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
        return sock.sendMessage(from, { text: helpText }, { quoted: msg });
      }

      const targetLang = args[args.length - 1].toLowerCase();
      const textToTranslate = args.slice(0, args.length - 1).join(' ');

      await react('🌐');

      // Appel API (Supposons que result contient aussi la langue source 'from')
      const result = await APIs.translate(textToTranslate, targetLang);
      const translation = result.translation || result.text || result;
      const sourceLang = result.from || "unknown"; 

      if (!translation) throw new Error("ᴇᴄʜᴇᴄ");

      // --- DESIGN RESULTAT (FULL SMALLCAPS GRAS) ---
      let resText = `*╭╼━≪• ${toStyledCaps('ɢʜᴏsᴛɢ-x ᴛʀᴀɴsʟᴀᴛᴏʀ')} •≫━╾╮*\n`;
      resText += `*┃* 🌐 *${toStyledCaps('ᴛᴏ ʟᴀɴɢ')}* : *${targetLang.toUpperCase()}*\n`;
      
      // Texte traduit converti en SmallCaps et mis en Gras
      const styledTranslation = toStyledCaps(translation);
      const lines = styledTranslation.split('\n');
      resText += `*┃* 📝 *${toStyledCaps('ᴛᴇxᴛ')}* : *${lines.map((l, i) => i === 0 ? l : `\n*┃* ${l}`).join('')}*\n`;
      
      resText += `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴛʀᴀɴsʟᴀᴛᴇᴅ')}*\n`;
      resText += `*┃* 🌍 *${toStyledCaps(`ᴛʀᴀɴsʟᴀᴛᴇᴅ ғʀᴏᴍ ${sourceLang}`)}*\n`;
      resText += `*╰━━━━━━━━━━━━━━━╯*\n\n`;
      resText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(from, { 
        text: resText,
        contextInfo: {
          externalAdReply: {
            title: toStyledCaps("ɢʜᴏsᴛɢ-x ᴛʀᴀɴsʟᴀᴛᴏʀ"),
            body: toStyledCaps("traduction effectuee"),
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error(error);
      reply(`❌ *${toStyledCaps('ᴇʀʀᴇᴜʀ sʏsᴛᴇᴍᴇ')}*`);
    }
  }
};
