/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - System Command Reloader (AGM Global Core)
 * Instant Refresh Without Restart
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const path = require('path');
const fs = require('fs');

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

const AGM_RELOAD_DESIGN = (count) => `*╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ʀᴇғʀᴇsʜ •≫━╾╮*
*┃*
*┃* ⚙️ *${toSmallCaps('sᴛᴀᴛᴜs')}* : 🟢 ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs
*┃* ⚡ *${toSmallCaps('ᴀᴄᴛɪᴏɴ')}* : ᴄᴀᴄʜᴇ ᴘᴜʀɢᴇᴅ
*┃* 📦 *${toSmallCaps('ᴄᴏᴜɴᴛ')}* : *${count}* ${toSmallCaps('ᴄᴍᴅs')}
*┃* ✅ *${toSmallCaps('ʀᴇsᴜʟᴛ')}* : sʏɴᴄ ᴄᴏᴍᴘʟᴇᴛᴇ
*┃*
*╰━━━━━━━━━━━━━━━╯*
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'reload',
  aliases: ['refresh', 'updatecmd', 'r'],
  category: 'owner',
  description: 'Recharge les commandes à chaud',
  ownerOnly: true,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      await react('⏳');

      const commandsPath = path.join(process.cwd(), 'commands');

      // 1. PURGE SÉLECTIVE DU CACHE NODE.JS
      // On ne supprime que ce qui se trouve dans le dossier commands
      Object.keys(require.cache).forEach((key) => {
        if (key.startsWith(commandsPath)) {
            delete require.cache[key];
        }
      });

      // 2. RECHARGEMENT DU LOADER
      // On purge aussi le loader lui-même pour prendre en compte ses modifs
      const loaderPath = path.resolve(process.cwd(), 'utils/commandLoader.js');
      if (require.cache[loaderPath]) delete require.cache[loaderPath];
      
      const { loadCommands } = require('../utils/commandLoader');

      // 3. MISE À JOUR DE LA MÉMOIRE GLOBALE
      global.commands = loadCommands();
      const cmdCount = global.commands.size;

      await react('✅');
      return reply(AGM_RELOAD_DESIGN(cmdCount));

    } catch (error) {
      console.error('[RELOAD ERROR]:', error);
      await react('❌');
      return reply(`❌ *${toSmallCaps("erreur lors du rafraichissement")}* :\n${error.message}`);
    }
  }
};
