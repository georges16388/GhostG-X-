// commands/fun/ship.js
module.exports = {
  name: 'ᴅᴇsᴛɪɴ',
  aliases: ['destin', 'match', 'ship', 'lier'],
  category: '♞ ᴄʜᴀᴏs & ᴅɪᴠᴇʀᴛɪssᴇᴍᴇɴᴛ',
  description: 'ʟɪᴇ ᴅᴇᴜx ᴀ̂ᴍᴇs ᴀᴜ ʜᴀsᴀʀᴅ ᴏᴜ sᴘᴇ́ᴄɪғɪǫᴜᴇs ᴘᴏᴜʀ ᴠᴏɪʀ ʟᴇᴜʀ ᴅᴇsᴛɪɴ.',
  usage: '.ᴅᴇsᴛɪɴ (ᴀʟᴇ́ᴀᴛᴏɪʀᴇ) ᴏᴜ .ᴅᴇsᴛɪɴ @ᴜsᴇʀ1 @ᴜsᴇʀ2 ᴏᴜ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀᴠᴇᴄ .ᴅᴇsᴛɪɴ',
  groupOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = ctx.mentionedJid || [];
      let a = null;
      let b = null;

      // Si deux mentions -> les utiliser
      if (mentioned.length >= 2) {
        a = mentioned[0];
        b = mentioned[1];
      } else if (mentioned.length === 1) {
        // Une seule mention : lier la personne citée avec l'auteur
        a = mentioned[0];
        b = extra.sender;
      } else if (ctx.participant) {
        // Réponse à un message : lier la personne citée avec l'auteur
        a = ctx.participant;
        b = extra.sender;
      } else {
        // Aucune mention ni réponse : sélection de 2 membres au hasard
        const participants = extra.participants || [];
        const validParticipants = participants
          .map(p => p.id)
          .filter(id => id !== sock.user.id); // Exclure le bot
        
        if (validParticipants.length >= 2) {
          const shuffled = validParticipants.sort(() => Math.random() - 0.5);
          a = shuffled[0];
          b = shuffled[1];
        } else {
          return extra.reply('*〆 ᴘᴀs ᴀssᴇᴢ ᴅᴇ ᴍᴇᴍʙʀᴇs ᴅᴀɴs ᴄᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ !*');
        }
      }

      // Formatage du tag
      const nameOf = id => `@${id.split('@')[0]}`;

      // Création d'un pourcentage déterministe basé sur les IDs
      const seed = (a + b).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const love = Math.abs((seed * 7) % 101); // 0-100

      const hearts = ['💖', '💕', '💘', '💞', '💓'];
      const heart = hearts[Math.floor(Math.random() * hearts.length)];
      
      // Les oracles du destin
      const phrases = [
        `*🔮 ʟ'ᴀʟᴄʜɪᴍɪᴇ ᴀ ᴘᴀʀʟᴇ́ :*\n\n` +
        `*⚡ ${nameOf(a)} + ${nameOf(b)} = ${love}% ${heart}*\n\n` +
        `*ʟᴇᴜʀs ᴀᴜʀᴀs sᴇᴍʙʟᴇɴᴛ s'ᴀᴄᴄᴏʀᴅᴇʀ !*`,
        
        `*🔮 ᴠɪsɪᴏɴ ᴅᴇs ᴀʙʏsᴇs :*\n\n` +
        `*⚡ ${nameOf(a)} x ${nameOf(b)} = ${love}%*\n\n` +
        `*ʟᴇs sᴄᴇᴀᴜx sᴏɴᴛ ᴇɴ ᴛʀᴀɪɴ ᴅᴇ sᴇ ᴍᴇ̂ʟᴇʀ...* 😉`,
        
        `*🔮 ᴏʀᴀᴄʟᴇ ᴅᴇs ᴀ̂ᴍᴇs :*\n\n` +
        `*⚡ ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛᴇ́ : ${love}% ᴇɴᴛʀᴇ ${nameOf(a)} ᴇᴛ ${nameOf(b)}*\n\n` +
        `*📜 sᴇɴᴛᴇɴᴄᴇ :* ${love > 75 ? '*ᴜɴᴇ ʟɪᴀɪsᴏɴ sᴀᴄʀᴇ́ᴇ ❤️*' : love > 40 ? '*ᴜɴ ᴘᴀᴄᴛᴇ ᴘᴏssɪʙʟᴇ 🤝*' : '*ᴜɴ ᴘᴜʀ ᴄʜᴀᴏs 😂*'}`
      ];

      const out = phrases[Math.floor(Math.random() * phrases.length)];
      const finalMessage = out + `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await sock.sendMessage(extra.from, { text: finalMessage, mentions: [a, b] }, { quoted: msg });
    } catch (error) {
      console.error('[ship] ERROR:', error);
      await extra.reply('*〆 ʟᴇ ᴅᴇsᴛɪɴ ᴀ ᴇ́ᴛᴇ́ sᴄᴏʟʟᴇ́ ᴘᴀʀ ᴜɴᴇ ᴇʀʀᴇᴜʀ.*');
    }
  }
};
