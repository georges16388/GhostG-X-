/**
 * Set Prefix Command - GhostG-X Edition
 * Modifie le préfixe d'invocation des commandes du bot
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');
const prefix = config.prefix ||'.';
module.exports = {
  name: 'sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ',
  aliases: ['signe_commande', 'setprefix', 'prefix', 'prefixe'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴛʀᴀɴsᴍᴜᴛᴇ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs**',
  usage: `${prefix}sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ <ɴᴏᴜᴠᴇᴀᴜ ᴘʀᴇ́ғɪxᴇ>`,
  ownerOnly: true, // Reste accessible uniquement aux owners déclarés du bot
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply(
          `*╭╼━━━≪• sɪɢɴᴇ ᴀᴄᴛᴜᴇʟ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴘʀᴇ́ғɪxᴇ : ${config.prefix}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ : ${prefix}sɪɢɴᴇ_ᴄᴏᴍᴍᴀɴᴅᴇ <ɴᴏᴜᴠᴇᴀᴜ ᴘʀᴇ́ғɪxᴇ>*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const newPrefix = args[0];
      
      if (newPrefix.length > 3) {
        return extra.reply('*〆 ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴅᴏɪᴛ ᴄᴏᴍᴘʀᴇɴᴅʀᴇ ᴇɴᴛʀᴇ 1 ᴇᴛ 3 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs !*');
      }
      
      // Mise à jour de la configuration en mémoire vive
      config.prefix = newPrefix;
      
      // Écriture physique dans le fichier config.js
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');
      configContent = configContent.replace(/prefix: '.*'/, `prefix: '${newPrefix}'`);
      fs.writeFileSync(configPath, configContent);
      
      await extra.reply(
        `*✅ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ : ${newPrefix}*\n` +
        `_ʟᴇs ᴀʀᴄᴀɴᴇs s'ᴇ́ᴠᴇɪʟʟᴇʀᴏɴᴛ ᴅᴇ́sᴏʀᴍᴀɪs sᴏᴜs ʟᴀ ғᴏʀᴍᴇ : ${newPrefix}ᴄᴏᴍᴍᴀɴᴅᴇ_\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );
      
    } catch (error) {
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
