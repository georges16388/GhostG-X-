/**
 * Ship Command - Test de compatibilité amoureuse
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps pour l'esthétique Ghost
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toString().toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const SHIP_DESIGN = (user1, user2, percent, bar, verdict) => `╭╼━≪• *ɢʜᴏsᴛ ʟᴏᴠᴇ ᴛᴇsᴛ* •≫━╾╮
┃ 
┃ ❤️ ${toSmallCaps('ᴄɪʙʟᴇ')} 1 : @${user1.split('@')[0]}
┃ 💙 ${toSmallCaps('ᴄɪʙʟᴇ')} 2 : @${user2.split('@')[0]}
┃ 
┃ ${toSmallCaps('sᴄᴏʀᴇ')} : ${percent}%
┃ ${toSmallCaps('ᴊᴀᴜɢᴇ')} : [${bar}]
┃ 
┃ ${toSmallCaps('ᴠᴇʀᴅɪᴄᴛ')} : ${toSmallCaps(verdict)}
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'ship',
  aliases: ['love', 'match', 'couple'],
  category: 'fun',
  description: 'Teste la compatibilité entre deux membres du groupe.',
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
        // Sélection aléatoire dans le groupe
        const groupData = await sock.groupMetadata(extra.from);
        const participants = groupData.participants
          .map(p => p.id)
          .filter(id => id !== sock.user.id);

        if (participants.length < 2) return extra.reply(`❌ ${toSmallCaps('ᴘᴀs ᴀssez ᴅᴇ ᴍᴇᴍʙʀᴇs')}`);
        const shuffled = participants.sort(() => Math.random() - 0.5);
        [a, b] = [shuffled[0], shuffled[1]];
      }

      // Calcul du pourcentage
      const percent = Math.floor(Math.random() * 101);

      // Création de la barre de progression (Emoji Coeur)
      const progress = Math.round(percent / 10);
      const bar = "❤️".repeat(progress) + "🖤".repeat(10 - progress);

      // Verdicts en français
      let verdict = "";
      if (percent < 10) verdict = "le desert total... 🌵";
      else if (percent < 30) verdict = "juste bons a se dire bonjour. 🧊";
      else if (percent < 50) verdict = "une petite etincelle, ou un court-circuit ? ⚡";
      else if (percent < 75) verdict = "ca commence a chauffer ! prevoyez la dot. 💍";
      else if (percent < 90) verdict = "un couple de legende en devenir. 😍";
      else verdict = "mariage direct ! c'est ecrit dans les etoiles. ✨👑";

      // Réaction Love
      await sock.sendMessage(extra.from, { react: { text: "💖", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: SHIP_DESIGN(a, b, percent, bar, verdict), 
        mentions: [a, b] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[ship] ERROR:', error);
      const errTxt = toSmallCaps("le radar amoureux est en panne");
      await extra.reply(`❌ ${errTxt}`);
    }
  }
};
