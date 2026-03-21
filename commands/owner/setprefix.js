/**
 * Bot Prefix Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const AGM_CORE = (oldP, newP, type) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} ⚡
┃ ᴏʟᴅ : [ ${oldP} ]
┃ ɴᴇᴡ : [ ${newP} ]
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'setpref'],
  category: 'owner',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const config = require('../../config');
      const configPath = path.resolve(__dirname, '../../config.js');
      
      let newPrefix = args[0];
      let isSticker = false;

      // 1. Détection de réponse à un sticker
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
                     msg.message?.stickerMessage; 
      
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
          // Note: Utiliser un sticker comme préfixe global est complexe. 
          // On va rester sur du texte pour la stabilité du handler.
          return extra.reply("⚠️ *ʟᴇ ᴘʀᴇꜰɪxᴇ ᴘᴀʀ sᴛɪᴄᴋᴇʀ ɴ'ᴇsᴛ ᴘᴀs ᴇɴᴄᴏʀᴇ sᴜᴘᴘᴏʀᴛé ᴘᴀʀ ʟᴇ ʜᴀɴᴅʟᴇʀ.*");
      }

      if (!newPrefix) {
        return extra.reply(`📌 *ᴄᴜʀʀᴇɴᴛ ᴘʀᴇғɪx :* [ ${config.prefix} ]\n\n*ᴜsᴀɢᴇ :* .sᴇᴛᴘʀᴇғɪx <sʏᴍʙᴏʟᴇ>`);
      }

      // 2. Mise à jour physique du fichier config.js
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Regex amélioré pour capturer prefix même s'il y a process.env
      const regex = /prefix:\s*(process\.env\.PREFIX\s*\|\|\s*)?['"`]([^'"`]*)['"`]/;
      
      if (regex.test(content)) {
          content = content.replace(regex, `prefix: '${newPrefix}'`);
          fs.writeFileSync(configPath, content, 'utf8');
      } else {
          // Si le regex échoue, on tente une approche plus brutale mais sûre
          content = content.replace(/prefix:.*,/, `prefix: '${newPrefix}',`);
          fs.writeFileSync(configPath, content, 'utf8');
      }

      // 3. Update mémoire
      const oldPrefix = config.prefix;
      config.prefix = newPrefix;
      
      // Flush cache pour tous les modules qui importent config
      delete require.cache[require.resolve('../../config')];

      await extra.react('⚙️');
      await extra.reply(AGM_CORE(oldPrefix, newPrefix, 'text'));

    } catch (error) {
      console.error('Prefix Error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ sʏsᴛéᴍᴇ ʟᴏʀs ᴅᴜ ᴄʜᴀɴɢᴇᴍᴇɴᴛ.*');
    }
  }
};
