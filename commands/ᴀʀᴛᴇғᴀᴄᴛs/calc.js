/**
 * Calculator Command - Perform math calculations
 */

module.exports = {
    name: 'ᴀʟɢᴇ̀ʙʀᴇ',
    aliases: ['algebre', 'calc', 'calculate', 'calcul', 'math'],
    category: '⚒ ᴀʀᴛᴇғᴀᴄᴛs',
    description: 'ʀᴇ́sᴏᴜᴛ ᴅᴇs ᴀʀᴄᴀɴᴇs ᴇᴛ ᴇxᴘʀᴇssɪᴏɴs ᴍᴀᴛʜᴇ́ᴍᴀᴛɪǫᴜᴇs',
    usage: '.ᴀʟɢᴇ̀ʙʀᴇ <ᴇxᴘʀᴇssɪᴏɴ>',
    
    async execute(sock, msg, args, extra) {
      try {
        if (args.length === 0) {
          return extra.reply('*〆 ᴍᴜʀᴍᴜʀᴇ ᴜɴᴇ ᴇxᴘʀᴇssɪᴏɴ ᴍᴀᴛʜᴇ́ᴍᴀᴛɪǫᴜᴇ !*\n\n*ᴇxᴇᴍᴘʟᴇ : .ᴀʟɢᴇ̀ʙʀᴇ 5 + 3 * 2*');
        }
        
        const expression = args.join(' ');
        
        // Basic safety check
        if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
          return extra.reply('*〆 ᴇxᴘʀᴇssɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ ! sᴇᴜʟs ʟᴇs ᴄʜɪғғʀᴇs ᴇᴛ ʟᴇs ᴏᴘᴇ́ʀᴀᴛᴇᴜʀs (+, -, *, /, ᴘᴀʀᴇɴᴛʜᴇ̀sᴇs) sᴏɴᴛ ᴀᴜᴛᴏʀɪsᴇ́s.*');
        }
        
        try {
          const result = eval(expression);
          
          let text = `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴍᴀᴛʜᴇ́ᴍᴀᴛɪǫᴜᴇs •≫━━━╾╮*\n`;
          text += `*┃ 📝 ᴇxᴘʀᴇssɪᴏɴ : ${expression}*\n`;
          text += `*┃ ✅ ʀᴇ́sᴜʟᴛᴀᴛ : ${result}*\n`;
          text += `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n`;
          text += `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
          
          await extra.reply(text);
        } catch (evalError) {
          await extra.reply('*〆 ʟ\'ᴇxᴘʀᴇssɪᴏɴ ᴍᴀᴛʜᴇ́ᴍᴀᴛɪǫᴜᴇ ᴇsᴛ ɪɴᴄᴏʜᴇ́ʀᴇɴᴛᴇ !*');
        }
        
      } catch (error) {
        await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
      }
    }
  };
  