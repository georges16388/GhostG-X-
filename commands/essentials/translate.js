/**
 * Translate Command - GhostG-X MD (Hybrid Edition)
 * Fusion: Reply Detection + Direct Input
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

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
  aliases: ['tr', 'traduire'],
  category: 'essentials',
  description: 'Traduire un texte (Direct ou en Réponse).',
  usage: '.tr <texte> | <lang> OU répondez à un message avec .tr',

  async execute(sock, msg, args, { from, react, reply }) {
    try {
      let textToTranslate = "";
      let targetLang = "fr"; // Défaut : Français

      // 🔹 1. VÉRIFICATION SI C'EST UNE RÉPONSE (QUOTED)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quoted) {
        // On récupère le texte du message cité
        textToTranslate = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || "";
        // Si l'utilisateur a précisé une langue dans sa réponse (ex: .tr en)
        if (args[0]) targetLang = args[0].toLowerCase();
      } else {
        // 🔹 2. COMMANDE DIRECTE
        if (args.length === 0) {
            return reply(`*⚠️ ${toStyledCaps('veuillez fournir un texte ou repondre a un message')}*`);
        }

        const fullArgs = args.join(' ');
        if (fullArgs.includes('|')) {
          const parts = fullArgs.split('|');
          textToTranslate = parts[0].trim();
          targetLang = parts[1].trim().toLowerCase();
        } else {
          // Si pas de |, on vérifie si le dernier mot est un code langue
          const lastWord = args[args.length - 1].toLowerCase();
          if (lastWord.length <= 3) {
            targetLang = lastWord;
            textToTranslate = args.slice(0, -1).join(' ');
          } else {
            textToTranslate = fullArgs;
            targetLang = "fr";
          }
        }
      }

      if (!textToTranslate || textToTranslate.trim() === "") {
        return reply(`*⚠️ ${toStyledCaps('aucun texte detecte a traduire')}*`);
      }

      await react('🌐');

      // Appel API
      const result = await APIs.translate(textToTranslate, targetLang);
      const translation = result.translation || result.text || result;
      const sourceLang = result.from || "unknown";

      // --- DESIGN PRESTIGE ---
      let resText = `*╭╼━≪•*ɢʜᴏsᴛɢ ᴛʀᴀɴsʟᴀᴛᴏʀ* •≫━╾╮*\n`;
      resText += `*┃* 🌐 *${toStyledCaps('ᴛᴏ')}* : *${toStyledCaps(targetLang)}*\n`;
      resText += `*┃* 📝 *${toStyledCaps('ᴛᴇxᴛ')}* : *${toStyledCaps(translation)}*\n`;
      resText += `*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴛʀᴀɴsʟᴀᴛᴇᴅ')}*\n`;
      resText += `*┃* 🌍 *${toStyledCaps('ғʀᴏᴍ')}* : *${toStyledCaps(sourceLang)}*\n`;
      resText += `*╰━━━━━━━━━━━━━━━╯*\n\n`;
      resText += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(from, { 
        text: resText,
        contextInfo: {
          externalAdReply: {
            title: toStyledCaps("ɢʜᴏsᴛɢ-x ᴛʀᴀɴsʟᴀᴛᴏʀ"),
            body: toStyledCaps("ᴛʀᴀᴅᴜᴄᴛɪᴏɴ ᴇʟɪᴛᴇ ᴇꜰꜰᴇᴄᴛᴜᴇᴇ"),
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/2fmwpu.jpg",
            showAdAttribution: false
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error(error);
      reply(`❌ *${toStyledCaps('erreur lors de la traduction')}*`);
    }
  }
};
