/**
 * Flirt Command - AGM Elite Edition
 * Get a random pickup line with Smooth Style
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
        'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'û': 'ᴜ', 'ù': 'ᴜ', 'ç': 'ᴄ',
        '?': '?', '!': '!', '.': '.', ',': ',', "'": "'"
    };
    const capsText = text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

// Design Elite pour le flirt
const FLIRT_DESIGN = (content) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ғʟɪʀᴛ')} •≫━╾╮*
*┃*\n*┃* 😏 *${toBoldSmallCaps('ᴍsɢ')}* : ${content}\n*┃* ✨ *${toBoldSmallCaps('ᴛʏᴘᴇ')}* : *${toBoldSmallCaps('ᴅʀᴀɢᴜᴇ')}* ✨\n*┃* 😏 *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : *${toBoldSmallCaps('sᴍᴏᴏᴛʜ...')}* 😏\n*┃*\n*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

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

module.exports = {
    name: 'flirt',
    aliases: ['drague', 'pickup'],
    category: 'fun',
    desc: 'Obtenir une phrase de drague aléatoire (Smooth Edition)',
    usage: '.flirt [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const chatId = extra.from;
        await sock.sendMessage(chatId, { react: { text: '😏', key: msg.key } });

        const rawText = flirtPhrases[Math.floor(Math.random() * flirtPhrases.length)];
        const styledFlirt = toBoldSmallCaps(rawText);

        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];

        let finalContent = styledFlirt;
        let mentionsList = [...mentioned];

        // Ciblage automatique (Mention, Réponse ou Soi-même)
        if (mentioned.length > 0) {
            finalContent = `@${mentioned[0].split('@')[0]} : ${styledFlirt}`;
        } else if (ctxInfo?.participant) {
            const target = ctxInfo.participant;
            finalContent = `@${target.split('@')[0]} : ${styledFlirt}`;
            if (!mentionsList.includes(target)) mentionsList.push(target);
        } else {
            const sender = msg.key.participant || msg.key.remoteJid;
            finalContent = `@${sender.split('@')[0]} : ${styledFlirt}`;
            if (!mentionsList.includes(sender)) mentionsList.push(sender);
        }

        await sock.sendMessage(chatId, {
          text: FLIRT_DESIGN(finalContent),
          mentions: mentionsList
        }, { quoted: msg });

      } catch (error) {
        console.error('Flirt Error:', error);
        const errorMsg = toBoldSmallCaps(`Erreur Smooth : ${error.message}`);
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ ${errorMsg}` }, { quoted: msg });
      }
    }
};
