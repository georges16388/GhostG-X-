/**
 * Flirt - Obtenir un message de drague aléatoire
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

// Fonction de conversion en Small Caps
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
};

const flirtPhrases = [
    "Est-ce que tu as un plan ? Je me suis perdu dans tes yeux.",
    "Ton père est un voleur, il a pris toutes les étoiles du ciel pour les mettre dans tes yeux.",
    "On ne s'est pas déjà vu quelque part ? Tu ressembles énormément à ma prochaine petite amie.",
    "Est-ce que tu crois au coup de foudre au premier regard ou je dois repasser une deuxième fois ?",
    "Si j'étais un chat, je passerais mes 9 vies avec toi.",
    "Ton prénom c'est Google ? Parce que je trouve en toi tout ce que je recherche.",
    "Est-ce que tu as un pansement ? Je me suis écorché le genou en tombant amoureux de toi.",
    "Tu n'as pas mal aux pieds à force de courir dans mes pensées toute la journée ?",
    "Si embrasser était un crime, je passerais ma vie en prison pour toi.",
    "Je ne suis pas photographe, mais je peux très bien nous imaginer ensemble."
];

const FLIRT_DESIGN = (text) => `╭╼━≪• *ɢʜᴏsᴛ ғʟɪʀᴛ* •≫━╾╮
┃ *ᴍsɢ* : ${text}
┃ *ᴛʏᴘᴇ* : ${toSmallCaps('ᴅʀᴀɢᴜᴇ')} ✨
┃ *sᴛᴀᴛᴜs* : ${toSmallCaps('sᴍᴏᴏᴛʜ')}... 😏
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
    name: 'flirt',
    aliases: ['drague', 'pickup'],
    category: 'fun',
    desc: 'Obtenir une phrase de drague aléatoire en français',
    usage: 'flirt [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const rawText = flirtPhrases[Math.floor(Math.random() * flirtPhrases.length)];
        // Conversion de la phrase de drague en Small Caps
        const flirtText = toSmallCaps(rawText);
        
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const chatId = extra.from;
        
        let finalMessage = flirtText;

        if (mentioned.length > 0) {
            finalMessage = `@${mentioned[0].split('@')[0]}, ${flirtText}`;
        } else if (ctxInfo?.participant) {
            const responder = ctxInfo.participant;
            finalMessage = `@${responder.split('@')[0]}, ${flirtText}`;
            if (!mentioned.includes(responder)) mentioned.push(responder);
        }

        await sock.sendMessage(chatId, {
          text: FLIRT_DESIGN(finalMessage),
          mentions: mentioned
        }, { quoted: msg });

      } catch (error) {
        console.error('Flirt Error:', error);
        await extra.reply(`❌ ${toSmallCaps('ᴇʀʀᴇᴜʀ')} : ${error.message}`);
      }
    }
};
