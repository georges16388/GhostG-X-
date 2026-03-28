/**
 * Joke Command - AGM Elite Edition
 * Envoyer des blagues avec style Prestige
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

// Fonction de conversion en Bold Small Caps (incluant accents et ponctuation)
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

// Design Elite pour l'humour
const JOKE_DESIGN = (setup, punchline) => `*╭╼━≪• ${toBoldSmallCaps('ɢʜᴏsᴛ ʜᴜᴍᴏʀ')} •≫━╾╮*
*┃*
*┃* 🤔 *${toBoldSmallCaps('ǫᴜᴇsᴛɪᴏɴ')}* : ${setup}
*┃*
*┃* 😂 *${toBoldSmallCaps('ʀᴇᴘᴏɴsᴇ')}* : ${punchline}
*┃*
*╰━━━━━━━━━━━━━━━╯*
> ***${toBoldSmallCaps('ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x')}***`;

const frenchJokes = [
    { q: "Pourquoi les plongeurs plongent-ils toujours en arrière ?", r: "Parce que sinon ils tombent dans le bateau." },
    { q: "Qu'est-ce qui est petit, rond, vert et qui monte et qui descend ?", r: "Un petit pois dans un ascenseur." },
    { q: "Quel est le comble pour un électricien ?", r: "De ne pas être au courant." },
    { q: "Pourquoi les oiseaux volent-ils vers le sud en hiver ?", r: "Parce que c'est trop loin pour y aller à pied." },
    { q: "Comment appelle-t-on un boomerang qui ne revient pas ?", r: "Un bâton." },
    { q: "Quel est le sport le plus silencieux ?", r: "Le para-chuuuut !" },
    { q: "Pourquoi les boulangers sont-ils toujours de bonne humeur ?", r: "Parce qu'ils ont du pain sur la planche." },
    { q: "Que dit un citron qui fait un braquage ?", r: "Pas un zeste, je suis pressé !" },
    { q: "Comment appelle-t-on un chien qui fait de la magie ?", r: "Un Abracadabrador." }
];

module.exports = {
  name: 'joke',
  aliases: ['jokes', 'blague'],
  category: 'fun',
  description: 'Obtenir une blague aléatoire (Elite Style)',
  usage: '.joke',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      
      // Réaction pour l'ambiance
      await sock.sendMessage(chatId, { react: { text: '🤣', key: msg.key } });

      const randomJoke = frenchJokes[Math.floor(Math.random() * frenchJokes.length)];

      // Conversion des textes en Bold Small Caps
      const setup = toBoldSmallCaps(randomJoke.q);
      const punchline = toBoldSmallCaps(randomJoke.r);

      await sock.sendMessage(chatId, {
        text: JOKE_DESIGN(setup, punchline)
      }, { quoted: msg });

    } catch (error) {
      console.error('Joke Error:', error);
      const errorMsg = toBoldSmallCaps(`Erreur Humour : ${error.message}`);
      await extra.reply(`❌ ${errorMsg}`);
    }
  }
};
