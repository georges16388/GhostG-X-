/**
 * System Command Reloader - AGM Global Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const path = require('path');

const AGM_RELOAD = `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ʀᴇғʀᴇsʜ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs
┃ ᴀᴄᴛɪᴏɴ : ᴄᴀᴄʜᴇ ᴘᴜʀɢᴇᴅ ⚡
┃ ʀᴇsᴜʟᴛ : sʏɴᴄ ᴄᴏᴍᴘʟᴇᴛᴇ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'reload',
  aliases: ['refresh', 'updatecmd'],
  category: 'owner',
  description: 'Recharge toutes les commandes sans redémarrer le bot.',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

      // 1. Localiser le dossier des commandes
      const commandsDir = path.join(process.cwd(), 'commands');

      // 2. VIDER LE CACHE DE NODE.JS
      // C'est l'étape magique : on supprime les anciens fichiers de la mémoire
      Object.keys(require.cache).forEach((key) => {
        if (key.includes(commandsDir)) {
          delete require.cache[key];
        }
      });

      // 3. Recharger la logique de chargement
      const { loadCommands } = require('../../utils/commandLoader');
      
      // On met à jour la variable globale (ou celle du handler)
      // Note: Assure-toi que ton handler utilise bien global.commands
      global.commands = loadCommands();

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      await sock.sendMessage(from, { text: AGM_RELOAD }, { quoted: msg });

    } catch (error) {
      console.error('Reload Error:', error);
      await sock.sendMessage(extra.from, { 
          text: `❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ʀᴀғʀᴀîᴄʜɪssᴇᴍᴇɴᴛ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
