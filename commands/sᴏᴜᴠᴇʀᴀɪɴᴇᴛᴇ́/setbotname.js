/**
 * Set Bot Name Command - GhostG-X Edition
 * Modifie le nom du bot dans la configuration du sanctuaire
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ',
  aliases: ['apparence_systeme', 'setbotname', 'setname', 'botname', 'nom'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ᴍᴏᴅɪғɪᴇ ʟᴇ ɴᴏᴍ ᴅᴇ ʙᴀᴘᴛᴇ̂ᴍᴇ ᴅᴇ ʟ\'ᴀᴠᴀᴛᴀʀ ᴅᴀɴs ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: '.ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ> ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      // Sécurité absolue : Liaison avec le Maître Suprême défini dans le .env
      const supremeOwner = config.supremeOwner || '22651622652@s.whatsapp.net';
      if (extra.sender !== supremeOwner) {
        return extra.reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      let newBotName = '';
      
      // Vérification si le message est une réponse (citation)
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg) {
        // Extraction du texte cité
        const quotedText = quotedMsg.conversation || 
                          quotedMsg.extendedTextMessage?.text || 
                          quotedMsg.imageMessage?.caption ||
                          quotedMsg.videoMessage?.caption ||
                          '';
        newBotName = quotedText.trim();
      } else {
        // Extraction depuis les arguments de la commande
        newBotName = args.join(' ').trim();
      }
      
      // Validation du nouveau nom
      if (!newBotName) {
        return extra.reply(
          `*╭╼━━━≪• ᴀᴘᴘᴀʀᴇɴᴄᴇ ᴅᴜ sʏsᴛᴇᴍᴇ •≫━━━╾╮*\n` +
          `*┃ 🔮 ɴᴏᴍ ᴀᴄᴛᴜᴇʟ : ${config.botName || 'ɢʜᴏsᴛɢ-x'}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• .ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ>*\n` +
          `  *• ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀᴠᴇᴄ ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      if (newBotName.length > 50) {
        return extra.reply('*〆 ʟᴇ ɴᴏᴍ ᴅᴇ ʟ\'ᴀᴠᴀᴛᴀʀ ɴᴇ ᴘᴇᴜᴛ ᴇxᴄᴇ́ᴅᴇʀ 50 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs !*');
      }
      
      // Mise à jour de la configuration en mémoire vive
      config.botName = newBotName;
      
      // Écriture physique dans le fichier config.js
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');
      
      // Remplacement propre du paramètre botName
      configContent = configContent.replace(
        /botName:\s*['"`]([^'"`]*)['"`]/,
        `botName: '${newBotName.replace(/'/g, "\\'")}'`
      );
      
      fs.writeFileSync(configPath, configContent, 'utf-8');
      
      // Purge du cache de configuration
      delete require.cache[require.resolve('../../config')];
      
      await extra.reply(`*✅ ʟ\'ᴀᴘᴘᴀʀᴇɴᴄᴇ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ᴇ : ${newBotName}*\n*ᴄᴇ sᴄᴇᴀᴜ sᴇʀᴀ ᴅᴇ́sᴏʀᴍᴀɪs ᴀғғɪᴄʜᴇ́ sᴜʀ ʟᴇs ᴍᴇɴᴜs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      
    } catch (error) {
      console.error('Setbotname command error:', error);
      await extra.reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
