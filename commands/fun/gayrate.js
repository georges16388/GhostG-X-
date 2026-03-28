/**
 * Gayrate Command - AGM Elite Edition
 * Mesure le niveau de "fabulousness" avec humour
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps pour le style Prestige
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ',
        'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'û': 'ᴜ', 'ù': 'ᴜ', 'ç': 'ᴄ'
    };
    const capsText = text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

// Design Elite pour le test
const GAY_DESIGN = (target, percent, verdict) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ɢᴀʏ-ᴛᴇsᴛ')} •≫━╾╮*
*┃*\n*┃* 🎯 *${toBoldSmallCaps('ᴄɪʙʟᴇ')}* : @${target.split('@')[0]}\n*┃* 🌈 *${toBoldSmallCaps('sᴄᴏʀᴇ')}* : *${percent}%* 🌈\n*┃* ⚖️ *${toBoldSmallCaps('ᴠᴇʀᴅɪᴄᴛ')}* : ${toBoldSmallCaps(verdict)}\n*┃*\n*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

module.exports = {
  name: 'gayrate',
  aliases: ['gay', 'gaytest'],
  category: 'fun',
  description: 'Calcule le pourcentage de gayitude (humour).',
  usage: '.gayrate @user',

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let targetId = null;

      if (mentioned.length) targetId = mentioned[0];
      else if (ctx.participant) targetId = ctx.participant;
      else targetId = extra.sender;

      await sock.sendMessage(extra.from, { react: { text: '🌈', key: msg.key } });

      // Génération d'un pourcentage aléatoire
      const percent = Math.floor(Math.random() * 101);

      // Système de verdicts drôles selon le score
      let verdict = "";
      if (percent === 0) verdict = "Hétéro pur cristal 🗿";
      else if (percent < 25) verdict = "Un peu suspect mais ça passe 🤔";
      else if (percent < 50) verdict = "Le radar commence à biper 📡";
      else if (percent < 75) verdict = "Porte des chaussettes roses en cachette 🧦";
      else if (percent < 90) verdict = "Prêt pour la Gay Pride 🏳️‍🌈";
      else if (percent < 100) verdict = "Expert certifié en arc-en-ciel 💅";
      else verdict = "ROI DES PAILLETTES ✨👑";

      // Envoi du message avec le design Elite
      await sock.sendMessage(extra.from, { 
        text: GAY_DESIGN(targetId, percent, verdict), 
        mentions: [targetId] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[gayrate] ERROR:', error);
      const errTxt = toBoldSmallCaps("Erreur lors du scan du radar...");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
