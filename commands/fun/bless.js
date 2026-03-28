/**
 * Divine Blessing Command - Glorifier Dieu et Jésus
 * Custom Elite Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Bold Small Caps pour le style visuel Prestige
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ',
        'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'û': 'ᴜ', 'ù': 'ᴜ', 'ç': 'ᴄ',
        "'": "'" // On garde l'apostrophe normale
    };
    const capsText = text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`; // On entoure de gras
};

// Design Elite pour la bénédiction divine
const BLESS_DESIGN = (content) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ʙʟᴇssɪɴɢ')} •≫━╾╮*
*┃*\n*┃* 🕊️ *${toBoldSmallCaps('ᴍsɢ')}* : ${content}\n*┃* 🤲 *${toBoldSmallCaps('ᴛʏᴘᴇ')}* : *${toBoldSmallCaps('ɢʟᴏɪʀᴇ ᴀ ᴅɪᴇᴜ')}* 🙌\n*┃* 🛡️ *${toBoldSmallCaps('ғʀᴏᴍ')}* : *${toBoldSmallCaps('ɢʜᴏsᴛ ᴀɪ')}* 🕊️\n*┃*\n*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

module.exports = {
    name: 'bless',
    aliases: ['compliment', 'grace', 'amen', 'benir'],
    category: 'faith',
    desc: 'Envoyer une bénédiction divine glorifiant Dieu',
    usage: '.bless [@user]',
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
          "Sois béni(e) au nom du Seigneur pour la pureté de ton soul. 🌈",
          "Le Seigneur a fait de grandes choses pour toi, réjouis-toi ! 😊",
          "Tu es précieu(x/se) aux yeux de Dieu, Il t'aime infiniment. ❤️",
          "Que la paix de Christ, qui surpasse toute intelligence, garde ton cœur. 🛡️"
        ];

        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const chatId = extra.from;

        await sock.sendMessage(chatId, { react: { text: '🙏', key: msg.key } });

        // Sélection aléatoire et conversion de la bénédiction en Bold Small Caps
        const rawBlessing = blessings[Math.floor(Math.random() * blessings.length)];
        const styledBlessing = toBoldSmallCaps(rawBlessing);

        let finalContent = styledBlessing;
        let mentionsList = mentioned;

        // Ciblage automatique (Mention, Réponse ou Soi-même)
        if (mentioned.length > 0) {
            // Mention directe (@user)
            finalContent = `@${mentioned[0].split('@')[0]} : ${styledBlessing}`;
        } else if (ctxInfo?.participant) {
            // Réponse à un message
            const responder = ctxInfo.participant;
            finalContent = `@${responder.split('@')[0]} : ${styledBlessing}`;
            if (!mentionsList.includes(responder)) mentionsList.push(responder);
        } else {
            // Sans cible : s'adresse à l'envoyeur
            const sender = msg.key.participant || msg.key.remoteJid;
            finalContent = `@${sender.split('@')[0]} : ${styledBlessing}`;
            if (!mentionsList.includes(sender)) mentionsList.push(sender);
        }

        await sock.sendMessage(chatId, {
          text: BLESS_DESIGN(finalContent),
          mentions: mentionsList
        }, { quoted: msg });

      } catch (error) {
        console.error('Blessing Error:', error);
        const errorMsg = toBoldSmallCaps(`Erreur Divine : ${error.message}`);
        await extra.reply(`❌ ${errorMsg}`);
      }
    }
  };
