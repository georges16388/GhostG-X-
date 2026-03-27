const fs = require('fs');
const path = require('path');

const AGM_NAME = (oldName, newName) => `╭╼━≪• ᴀɢᴍ ɪᴅᴇɴᴛɪᴛʏ •≫━╾╮
┃ ᴏʟᴅ : ${oldName}
┃ ɴᴇᴡ : ${newName} ✨
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇʙʀᴀɴᴅᴇᴅ
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setbotname',
  aliases: ['setname', 'botname'],
  category: 'owner',
  description: 'Changer le nom du bot dynamiquement',
  usage: '.setbotname <nom>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      // On recharge la config actuelle
      const configPath = path.resolve(process.cwd(), 'config.js');
      let config = require(configPath);

      let newName = args.join(' ').trim();

      // Gestion du message cité (Quoted)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted && !newName) {
        newName = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || "";
      }

      if (!newName) {
        return extra.reply(`📝 *ᴄᴜʀʀᴇɴᴛ ɴᴀᴍᴇ :* ${config.botName}\n\n*ᴜsᴀɢᴇ :* .sᴇᴛɴᴀᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ>`);
      }

      if (newName.length > 30) return extra.reply('❌ *ɴᴏᴍ ᴛʀᴏᴘ ʟᴏɴɢ (ᴍᴀx 30 ᴄʜᴀʀ).*');

      const oldName = config.botName;

      // --- MISE À JOUR PHYSIQUE DU FICHIER ---
      let content = fs.readFileSync(configPath, 'utf8');
      
      // Regex améliorée pour capturer botName peu importe le format
      const nameRegex = /(\bbotName\s*:\s*)(['"`])(.*?)\2/i;
      
      if (nameRegex.test(content)) {
          content = content.replace(nameRegex, `$1'${newName.replace(/'/g, "\\ text'")}'`);
          fs.writeFileSync(configPath, content, 'utf8');

          // --- MISE À JOUR MÉMOIRE ---
          // On met à jour l'objet config chargé et la globale
          config.botName = newName;
          if (global.config) global.config.botName = newName;
          
          // Nettoyage du cache Node.js
          delete require.cache[require.resolve(configPath)];

          await extra.react('✍️');
          await extra.reply(AGM_NAME(oldName, newName));
      } else {
          throw new Error("Clé 'botName' non trouvée dans config.js");
      }

    } catch (error) {
      console.error('SetName Error:', error);
      await extra.reply(`❌ *ᴇʀʀᴇᴜʀ :* ${error.message}`);
    }
  }
};
