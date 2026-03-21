module.exports = {
  name: 'reload',
  aliases: ['refresh'],
  category: 'owner',
  ownerOnly: true,
  execute: async (sock, msg, args, { reply, react }) => {
    await react('⏳');
    const { loadCommands } = require('../../utils/commandLoader');
    global.commands = loadCommands(); // On recharge la Map globale
    await react('✅');
    await reply('✨ *ᴛᴏᴜᴛᴇꜱ ʟᴇꜱ ᴄᴏᴍᴍᴀɴᴅᴇꜱ ᴏɴᴛ éᴛé ᴍɪꜱᴇꜱ à ᴊᴏᴜʀ !*');
  }
};
