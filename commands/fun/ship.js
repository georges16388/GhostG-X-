/**
 * Ship Command - Test de compatibilité amoureuse
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const SHIP_DESIGN = (user1, user2, percent, bar, verdict) => `╭╼━≪• ɢʜᴏsᴛ ʟᴏᴠᴇ ᴛᴇsᴛ •≫━╾╮
┃ ᴄɪʙʟᴇ 1 : @${user1.split('@')[0]}
┃ ᴄɪʙʟᴇ 2 : @${user2.split('@')[0]}
┃ 
┃ sᴄᴏʀᴇ : ${percent}%
┃ ᴊᴀᴜɢᴇ : [${bar}]
┃ 
┃ ᴠᴇʀᴅɪᴄᴛ : ${verdict}
> ┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

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
      let a, b;

      // Logique de sélection des cibles
      if (mentioned.length >= 2) {
        [a, b] = [mentioned[0], mentioned[1]];
      } else if (mentioned.length === 1) {
        a = mentioned[0];
        b = extra.sender;
      } else if (ctx.participant) {
        a = ctx.participant;
        b = extra.sender;
      } else {
        // Sélection aléatoire dans le groupe
        const participants = extra.groupMetadata.participants
          .map(p => p.id)
          .filter(id => id !== sock.user.id);
        
        if (participants.length < 2) return extra.reply('❌ Pas assez de membres !');
        const shuffled = participants.sort(() => Math.random() - 0.5);
        [a, b] = [shuffled[0], shuffled[1]];
      }

      // Calcul du pourcentage (plus stable)
      const percent = Math.floor(Math.random() * 101);
      
      // Création de la barre de progression
      const progress = Math.round(percent / 10);
      const bar = "❤️".repeat(progress) + "🖤".repeat(10 - progress);

      // Verdicts drôles et variés
      let verdict = "";
      if (percent < 10) verdict = "C'est le désert total... 🌵";
      else if (percent < 30) verdict = "Juste bons à se dire 'Bonjour'. 🧊";
      else if (percent < 50) verdict = "Il y a une petite étincelle, ou c'est un court-circuit ? ⚡";
      else if (percent < 75) verdict = "Ça commence à chauffer ! Prévoyez la dot. 💍";
      else if (percent < 90) verdict = "Un couple de légende en devenir. 😍";
      else if (percent <= 100) verdict = "MARIAGE DIRECT ! C'est écrit dans les étoiles. ✨👑";

      // Effet de chargement
      await sock.sendMessage(extra.from, { react: { text: "💖", key: msg.key } });

      await sock.sendMessage(extra.from, { 
        text: SHIP_DESIGN(a, b, percent, bar, verdict), 
        mentions: [a, b] 
      }, { quoted: msg });

    } catch (error) {
      console.error('[ship] ERROR:', error);
      await extra.reply('❌ Le radar amoureux est en panne...');
    }
  }
};
