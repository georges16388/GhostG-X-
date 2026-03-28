/**
 * Ship Command - AGM Elite Edition
 * Test de compatibilité amoureuse avec Prestige Style
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps (Style Prestige Intégral)
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', 
        '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'à': 'ᴀ', 'ç': 'ᴄ'
    };
    const capsText = text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

// Design Elite pour le test amoureux
const SHIP_DESIGN = (user1, user2, percent, bar, verdict) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ʟᴏᴠᴇ ᴛᴇsᴛ')} •≫━╾╮*
*┃*
*┃* ❤️ *${toBoldSmallCaps('ᴄɪʙʟᴇ')}* ₁ : @${user1.split('@')[0]}
*┃* 💙 *${toBoldSmallCaps('ᴄɪʙʟᴇ')}* ₂ : @${user2.split('@')[0]}
*┃*
*┃* 📊 *${toBoldSmallCaps('sᴄᴏʀᴇ')}* : ${toBoldSmallCaps(percent.toString())}%
*┃* 📏 *${toBoldSmallCaps('ᴊᴀᴜɢᴇ')}* : [${bar}]
*┃*
*┃* ⚖️ *${toBoldSmallCaps('ᴠᴇʀᴅɪᴄᴛ')}* : ${toBoldSmallCaps(verdict)}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x')}***`;

module.exports = {
  name: 'ship',
  aliases: ['love', 'match', 'couple'],
  category: 'fun',
  description: 'Teste la compatibilité entre deux membres (Elite Style).',
  usage: '.ship @user1 @user2',
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      const sender = extra.sender;
      let a, b;

      // Logique de sélection intelligente
      if (mentioned.length >= 2) {
        [a, b] = [mentioned[0], mentioned[1]];
      } else if (mentioned.length === 1) {
        a = mentioned[0];
        b = sender;
      } else if (ctx.participant) {
        a = ctx.participant;
        b = sender;
      } else {
        const groupData = await sock.groupMetadata(extra.from);
        const participants = groupData.participants
          .map(p => p.id)
          .filter(id => id !== sock.user.id);

        if (participants.length < 2) {
            const noMem = toBoldSmallCaps("pas assez de membres");
            return extra.reply(`❌ ${noMem}`);
        }
        const shuffled = participants.sort(() => Math.random() - 0.5);
        [a, b] = [shuffled[0], shuffled[1]];
      }

      // Calcul du pourcentage
      const percent = Math.floor(Math.random() * 101);

      // Création de la barre de progression (Emoji Coeur)
      const progress = Math.round(percent / 10);
      const bar = "❤️".repeat(progress) + "🖤".repeat(10 - progress);

      // Verdicts Elite
      let verdict = "";
      if (percent < 10) verdict = "le désert total... 🌵";
      else if (percent < 30) verdict = "juste bons à se dire bonjour. 🧊";
      else if (percent < 50) verdict = "une petite étincelle, ou un court-circuit ? ⚡";
      else if (percent < 75) verdict = "ça commence à chauffer ! prévoyez la dot. 💍";
      else if (percent < 90) verdict = "un couple de légende en devenir. 😍";
      else verdict = "mariage direct ! c'est écrit dans les étoiles. ✨👑";

      // Réaction Love
      await sock.sendMessage(extra.from, { react: { text: "💖", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: SHIP_DESIGN(a, b, percent, bar, verdict), 
        mentions: [a, b] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[ship] ERROR:', error);
      const errTxt = toBoldSmallCaps("le radar amoureux est en panne");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
