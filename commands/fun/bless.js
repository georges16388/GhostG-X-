/**
 * Divine Blessing Command - Glorifier Dieu et Jésus
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps pour le style visuel
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

// Design pour la bénédiction divine
const BLESS_DESIGN = (text) => `╭╼━≪• *ɢʜᴏsᴛ ʙʟᴇssɪɴɢ* •≫━╾╮
┃ ${toSmallCaps('ᴍsɢ')} : ${text}
┃ ${toSmallCaps('ᴛʏᴘᴇ')} : ${toSmallCaps('ɢʟᴏɪʀᴇ ᴀ ᴅɪᴇᴜ')} 🙌
┃ ${toSmallCaps('ғʀᴏᴍ')} : ${toSmallCaps('ɢʜᴏsᴛ ᴀɪ')} 🕊️
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
    name: 'bless',
    aliases: ['compliment', 'grace', 'amen', 'benir'],
    category: 'faith',
    desc: 'Envoyer une bénédiction divine glorifiant Dieu',
    usage: 'bless [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const blessings = [
          "Dieu soit loué d'avoir fait de toi une si belle créature ! ✨",
          "Que la grâce du Seigneur Jésus repose sur ta vie aujourd'hui. 🕊️",
          "Tu es un chef-d'œuvre merveilleux entre les mains du Créateur ! 🎨",
          "Que l'amour de Dieu illumine ton visage et ton cœur. 💖",
          "En te voyant, on voit la bonté infinie du Seigneur. 🙌",
          "Tu es une bénédiction que Dieu a envoyée dans ce monde ! 🌟",
          "Que Jésus-Christ guide chacun de tes pas vers la lumière. 🕯️",
          "Dieu a mis en toi une étincelle unique de Sa gloire ! 💎",
          "Sois béni(e) au nom du Seigneur pour la pureté de ton âme. 🌈",
          "Le Seigneur a fait de grandes choses pour toi, réjouis-toi ! 😊",
          "Tu es précieu(x/se) aux yeux de Dieu, Il t'aime infiniment. ❤️",
          "Que la paix de Christ, qui surpasse toute intelligence, garde ton cœur. 🛡️"
        ];

        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        
        // Sélection aléatoire et conversion de la bénédiction en Small Caps
        const rawBlessing = blessings[Math.floor(Math.random() * blessings.length)];
        const styledBlessing = toSmallCaps(rawBlessing);

        const chatId = extra.from;
        let finalMessage = styledBlessing;

        // Ciblage automatique (Mention ou Réponse)
        if (mentioned.length > 0) {
            finalMessage = `@${mentioned[0].split('@')[0]}, ${styledBlessing}`;
        } else if (ctxInfo?.participant) {
            const responder = ctxInfo.participant;
            finalMessage = `@${responder.split('@')[0]}, ${styledBlessing}`;
            if (!mentioned.includes(responder)) mentioned.push(responder);
        }

        await sock.sendMessage(chatId, {
          text: BLESS_DESIGN(finalMessage),
          mentions: mentioned
        }, { quoted: msg });

      } catch (error) {
        console.error('Blessing Error:', error);
        const errorMsg = toSmallCaps(`Erreur Divine : ${error.message}`);
        await extra.reply(`❌ ${errorMsg}`);
      }
    }
  };
