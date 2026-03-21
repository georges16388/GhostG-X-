/**
 * Joke Command - Send random jokes
 * Custom Design by -ɢʜᴏsᴛɢ 𝐗
 */

const APIs = require('../../utils/api');

// Design pour la blague
const JOKE_DESIGN = (setup, punchline) => `╭╼━≪• ɢʜᴏsᴛ ʜᴜᴍᴏʀ •≫━╾╮
┃ 
┃ ǫᴜᴇsᴛɪᴏɴ : ${setup} 🤔
┃ 
┃ ʀᴇᴘᴏɴsᴇ : ${punchline} 😂
┃ 
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'joke',
  aliases: ['jokes', 'blague'],
  category: 'fun',
  description: 'Get random joke',
  usage: '.joke',
  
  async execute(sock, msg, args, extra) {
    try {
      // Récupération de la blague via ton utilitaire API
      const joke = await APIs.getJoke();
      
      // Extraction des composants (setup et punchline)
      const setup = joke.setup || joke.question || "Why did the chicken cross the road?";
      const punchline = joke.punchline || joke.answer || "To get to the other side!";
      
      // Envoi avec le design signature
      await sock.sendMessage(extra.from, {
        text: JOKE_DESIGN(setup, punchline)
      }, { quoted: msg });
      
    } catch (error) {
      console.error('Joke Error:', error);
      await extra.reply(`❌ Humour Error: ${error.message}`);
    }
  }
};
