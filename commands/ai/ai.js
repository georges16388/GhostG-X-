/**
 * AI Chat Command - ChatGPT-style responses
 */

const APIs = require('../../utils/api');

// Design pour la réponse de l'IA
const AI_DESIGN = (answer) => `╭╼━≪• ɢʜᴏsᴛ ᴀɪ ʀᴇsᴘᴏɴsᴇ •≫━╾╮
┃ 
┃ ${answer.replace(/\n/g, '\n┃ ')}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'ai',
  aliases: ['gpt', 'chatgpt', 'ask'],
  category: 'ai',
  description: 'Chat with AI (ChatGPT-style)',
  usage: '.ai <question>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(
          `╭╼━≪• ᴀɪ ᴀssɪsᴛᴀɴᴛ •≫━╾╮\n` +
          `┃ ᴜsᴀɢᴇ : .ᴀɪ <ǫᴜᴇsᴛɪᴏɴ>\n` +
          `┃ ᴇx : .ᴀɪ ʜᴇʟʟᴏ ᴡᴏʀʟᴅ!\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }
      
      const question = args.join(' ');
      
      // Petit message d'attente pour plus de réalisme
      // await extra.reply('⏳ *Ghost AI is thinking...*');

      const response = await APIs.chatAI(question);
      
      // Extraction de la réponse brute
      const rawAnswer = response.response || response.msg || response.data?.msg || response;
      
      // Envoi de la réponse formatée dans le design
      await sock.sendMessage(extra.from, {
        text: AI_DESIGN(rawAnswer)
      }, { quoted: msg });
      
    } catch (error) {
      console.error('AI Command Error:', error);
      await extra.reply(`❌ AI Error: ${error.message}`);
    }
  }
};
