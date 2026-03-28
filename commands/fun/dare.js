/**
 * Dare Command - AGM Elite Edition
 * Get a random dare challenge with Prestige Style
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps pour le style Prestige
const toBoldSmallCaps = (text) => {
    if (!text) return "";
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 
        'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm':'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 
        'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 
        'y': 'ʏ', 'z': 'ᴢ',
        'é': 'ᴇ', 'è': 'ᴇ', 'ê': 'ᴇ', 'ë': 'ᴇ', 'à': 'ᴀ', 'â': 'ᴀ', 'î': 'ɪ', 'ï': 'ɪ', 'ô': 'ᴏ', 'û': 'ᴜ', 'ù': 'ᴜ', 'ç': 'ᴄ'
    };
    const capsText = text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('');
    return `*${capsText}*`;
};

// Design Elite pour le défi
const DARE_DESIGN = (content) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ᴅᴀʀᴇ')} •≫━╾╮*
*┃*\n*┃* 🔥 *${toBoldSmallCaps('ᴅᴇғɪ')}* : ${content}\n*┃* 🎭 *${toBoldSmallCaps('ᴛʏᴘᴇ')}* : *${toBoldSmallCaps('ᴀᴄᴛɪᴏɴ')}* 🔥\n*┃* ⏳ *${toBoldSmallCaps('sᴛᴀᴛᴜs')}* : *${toBoldSmallCaps('ᴘᴇɴᴅɪɴɢ...')}* ⏳\n*┃*\n*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗')}***`;

module.exports = {
    name: 'dare',
    aliases: ['action', 'defi'],
    category: 'fun',
    desc: 'Recevoir un défi aléatoire (Action)',
    usage: '.dare [@user]',
    execute: async (sock, msg, args, extra) => {
      try {
        const dares = [
          "Envoie une capture d'écran de ta galerie ! 📸",
          "Laisse quelqu'un d'autre écrire ton statut WhatsApp ! ✍️",
          "Appelle un contact au hasard et chante-lui une chanson ! 🎤",
          "Poste un selfie embarrassant ! 🤳",
          "Envoie un message à ton crush et confesse tes sentiments ! ❤️",
          "Fais 20 pompes et envoie la vidéo ! 💪",
          "Change ta photo de profil par un truc moche pendant 24h ! 🤡",
          "Envoie une note vocale en chantant l'alphabet ! 🎶",
          "Laisse le groupe choisir ton statut pour la journée ! 📝",
          "Raconte au groupe ton moment le plus embarrassant ! 😳",
          "Partage tes 5 dernières recherches Google ! 🔍",
          "Danse devant tout le monde pendant 1 minute ! 💃",
          "Imite quelqu'un du groupe du mieux que tu peux ! 🎭",
          "Parle avec un accent bizarre pendant les 10 prochaines minutes ! 🗣️",
          "Poste une story disant 'J'ai perdu un pari' pendant 24h ! 📉",
          "Laisse quelqu'un fouiller ton téléphone pendant 2 minutes ! 📱",
          "Envoie un message dragueur à un contact au hasard ! 😏",
          "Fais 50 jumping jacks (sauts écarts) ! 🏃",
          "Raconte une blague, si personne ne rit, recommence un défi ! 😂",
          "Enregistre-toi en faisant une danse TikTok ! 🕺"
        ];

        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctxInfo?.mentionedJid || [];
        const chatId = msg.key.remoteJid;

        await sock.sendMessage(chatId, { react: { text: '🔥', key: msg.key } });

        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        const styledDare = toBoldSmallCaps(randomDare);

        let finalContent = styledDare;
        let mentionsList = [...mentioned];

        // Ciblage automatique (Mention, Réponse ou Soi-même)
        if (mentioned.length > 0) {
            finalContent = `@${mentioned[0].split('@')[0]} : ${styledDare}`;
        } else if (ctxInfo?.participant) {
            const target = ctxInfo.participant;
            finalContent = `@${target.split('@')[0]} : ${styledDare}`;
            if (!mentionsList.includes(target)) mentionsList.push(target);
        } else {
            const sender = msg.key.participant || msg.key.remoteJid;
            finalContent = `@${sender.split('@')[0]} : ${styledDare}`;
            if (!mentionsList.includes(sender)) mentionsList.push(sender);
        }

        await sock.sendMessage(chatId, {
          text: DARE_DESIGN(finalContent),
          mentions: mentionsList
        }, { quoted: msg });

      } catch (error) {
        console.error('Dare Error:', error);
        const errorMsg = toBoldSmallCaps(`Erreur Action : ${error.message}`);
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ ${errorMsg}` }, { quoted: msg });
      }
    }
  };
