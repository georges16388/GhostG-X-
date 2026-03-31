/**
 * AI Chat Command - ChatGPT-style responses
 */

const APIs = require('../../utils/api');
const config = require ('../../config.js');
module.exports = {
  name: 'ᴏʀᴀᴄʟᴇ',
  aliases: ['gpt', 'chatgpt', 'ask', 'ai', 'oracle'],
  category: '‎⍟ ᴏʀᴀᴄʟᴇ & ᴀʀᴄᴀɴᴇs',
  description: 'Chat with AI (ChatGPT-style)',
  usage: '.ᴏʀᴀᴄʟᴇ <question>',
  
  async execute(sock, msg, args, extra) {
    try {
    const prefix = config.prefix || '^';
      if (args.length === 0) {
        return extra.reply(`*╭╼━━━≪• ᴏʀᴀᴄʟᴇ ᴅᴇs ᴀʀᴄᴀɴᴇs •≫━━━╾╮*\n` +
  `*┃ 🔮 ᴜsᴀɢᴇ : ${prefix}ᴏʀᴀᴄʟᴇ <ᴍᴜʀᴍᴜʀᴇ>*\n` +
  `*┃ 📜 ᴇxᴇᴍᴘʟᴇ : ${prefix}ᴏʀᴀᴄʟᴇ ǫᴜᴇʟʟᴇ ᴇsᴛ ʟᴀ ᴄᴀᴘɪᴛᴀʟᴇ ᴅᴇ ʟᴀ ғʀᴀɴᴄᴇ ?*\n` +
  `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
  `*⍟ ʟ'ᴏʀᴀᴄʟᴇ ᴅɪғғᴜsᴇ ʟᴀ ᴄᴏɴɴᴀɪssᴀɴᴄᴇ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ʀᴇ́ᴘᴏɴᴅʀᴇ ᴀ̀ ᴛᴏᴜᴛᴇs ᴠᴏs ɪɴᴛᴇʀʀᴏɢᴀᴛɪᴏɴs.*\n\n` +
  `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
);
      }
      
      const question = args.join(' ');
      
      const response = await APIs.chatAI(question);
      
      // Send only the answer without labels
      const answer = response.response || response.msg || response.data?.msg || response;
      await extra.reply(answer);
      
    } catch (error) {
      await extra.reply(`❌ AI Error: ${error.message}`);
    }
  }
};
