/**
 * Joke Command - Envoyer des blagues aléatoires
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

// Base de données locale de blagues (Question / Réponse)
const frenchJokes = [
    { q: "Pourquoi les plongeurs plongent-ils toujours en arrière ?", r: "Parce que sinon ils tombent dans le bateau." },
    { q: "Qu'est-ce qui est petit, rond, vert et qui monte et qui descend ?", r: "Un petit pois dans un ascenseur." },
    { q: "Quel est le comble pour un électricien ?", r: "De ne pas être au courant." },
    { q: "Pourquoi les oiseaux volent-ils vers le sud en hiver ?", r: "Parce que c'est trop loin pour y aller à pied." },
    { q: "Comment appelle-t-on un boomerang qui ne revient pas ?", r: "Un bâton." },
    { q: "Qu'est-ce qu'une Cindy Sanders qui fait du ski ?", r: "Une avalanche de papillons." },
    { q: "Quel est le sport le plus silencieux ?", r: "Le para-chuuuut !" },
    { q: "Pourquoi les boulangers sont-ils toujours de bonne humeur ?", r: "Parce qu'ils ont du pain sur la planche." },
    { q: "Que dit un citron qui fait un braquage ?", r: "Pas un zeste, je suis pressé !" },
    { q: "Comment appelle-t-on un chien qui fait de la magie ?", r: "Un Abracadabrador." }
];

// Design pour la blague
const JOKE_DESIGN = (setup, punchline) => `╭╼━≪• *ɢʜᴏsᴛ ʜᴜᴍᴏʀ* •≫━╾╮
┃ 
┃ ${toSmallCaps('ǫᴜᴇsᴛɪᴏɴ')} : ${setup} 🤔
┃ 
┃ ${toSmallCaps('ʀᴇᴘᴏɴsᴇ')} : ${punchline} 😂
┃ 
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'joke',
  aliases: ['jokes', 'blague'],
  category: 'fun',
  description: 'Obtenir une blague aléatoire en français',
  usage: '.joke',

  async execute(sock, msg, args, extra) {
    try {
      // Sélection aléatoire d'une blague française
      const randomJoke = frenchJokes[Math.floor(Math.random() * frenchJokes.length)];

      // Conversion des textes en Small Caps
      const setup = toSmallCaps(randomJoke.q);
      const punchline = toSmallCaps(randomJoke.r);

      // Envoi avec le design signature
      await sock.sendMessage(extra.from, {
        text: JOKE_DESIGN(setup, punchline)
      }, { quoted: msg });

    } catch (error) {
      console.error('Joke Error:', error);
      const errorMsg = toSmallCaps(`Erreur Humour : ${error.message}`);
      await extra.reply(`❌ ${errorMsg}`);
    }
  }
};
