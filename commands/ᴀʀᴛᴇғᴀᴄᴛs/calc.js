/**
 * Calculator Command - Perform math calculations
 * GhostG-X Edition
 */

const config = require('../../config.js');

// Fonction pour le style Small Caps (Cohérence visuelle du sanctuaire)
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

const prefix = config.prefix || '.';

module.exports = {
  name: 'algebre',
  aliases: ['algebre', 'calc', 'calculate', 'calcul', 'math'],
  category: '⚒ ᴀʀᴛᴇғᴀᴄᴛs',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʀᴇsᴏᴜᴛ ᴅᴇs ᴀʀᴄᴀɴᴇs ᴇᴛ ᴇxᴘʀᴇssɪᴏɴs ᴍᴀᴛʜᴇᴍᴀᴛɪǫᴜᴇs**',
  usage: `${prefix}algebre <expression>`,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;

    try {
      if (args.length === 0) {
        return reply(`*〆 ${toSmallCaps('murmure une expression mathematique')} !*\n\n*ᴇxᴇᴍᴘʟᴇ :* \`${prefix}algebre 5 + 3 * 2\``);
      }

      const expression = args.join(' ');

      // Basic safety check
      if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
        return reply(`*〆 ${toSmallCaps('expression invalide')} ! ${toSmallCaps('seuls les chiffres et les operateurs')} (+, -, *, /, ()) ${toSmallCaps('sont autorises')}.*`);
      }

      try {
        // eslint-disable-next-line no-eval
        const result = eval(expression);

        let text = `╭╼━━━≪• *ᴀʀᴄᴀɴᴇs ᴍᴀᴛʜᴇ́ᴍᴀᴛɪǫᴜᴇs* •≫━━━╾╮\n`;
        text += `┃ 📝 *ᴇxᴘʀᴇssɪᴏɴ :* ${expression}\n`;
        text += `┃ ✅ *ʀᴇ́sᴜʟᴛᴀᴛ :* ${result}\n`;
        text += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        text += `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`;

        await reply(text);
        
      } catch (evalError) {
        await reply(`*〆 ${toSmallCaps('l expression mathematique est incoherente')} !*`);
      }

    } catch (error) {
      console.error('Algebre command error:', error);
      await reply(`*〆 ${toSmallCaps('l invocation a echoue')} : ${error.message}*`);
    }
  }
};
