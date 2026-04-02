/**
 * Set Oracle Name Command - GhostG-X Edition
 * Modifie le nom de l'Oracle dans la configuration de **ʟ'ᴏʀᴀᴄʟᴇ**
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ',
  aliases: ['apparence_systeme', 'setbotname', 'setname', 'botname', 'nom'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴍᴏᴅɪғɪᴇ ʟᴇ ɴᴏᴍ ᴅᴇ ʙᴀᴘᴛᴇ̂ᴍᴇ ᴅᴇ ʟ\'ᴀᴠᴀᴛᴀʀ ᴅᴀɴs ʟ\'ᴏʀᴀᴄʟᴇ',
  usage: `${prefix}ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ> ᴏᴜ ᴇɴ ʀᴇ́ᴘᴏɴsᴇ ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ`,

  async execute(sock, msg, args, extra) {
    const { isOwner, reply } = extra;

    try {
      // 🔥 LE FIX : On passe par isOwner défini via le .env
      if (!isOwner) {
        return reply('*〆 ᴛᴜ ɴ\'ᴀs ᴘᴀs ʟ\'ᴀᴜᴛᴏʀɪsᴀᴛɪᴏɴ sᴜᴘʀᴇ̂ᴍᴇ ᴘᴏᴜʀ ɪɴᴠᴏǫᴜᴇʀ ᴄᴇᴛᴛᴇ ᴘᴜɪssᴀɴᴄᴇ.*');
      }

      let newOracleName = '';

      // 2. EXTRACTION DU TEXTE (Si réponse ou arguments)
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quotedMsg) {
        const quotedText = quotedMsg.conversation || 
                          quotedMsg.extendedTextMessage?.text || 
                          quotedMsg.imageMessage?.caption ||
                          quotedMsg.videoMessage?.caption ||
                          '';
        newOracleName = quotedText.trim();
      } else {
        newOracleName = args.join(' ').trim();
      }

      // 3. VALIDATIONS
      if (!newOracleName) {
        return reply(
          `*╭╼━━━≪• ᴀᴘᴘᴀʀᴇɴᴄᴇ ᴅᴜ sʏsᴛᴇᴍᴇ •≫━━━╾╮*\n` +
          `*┃ 🔮 ɴᴏᴍ ᴀᴄᴛᴜᴇʟ : ${config.botName || 'ɢʜᴏsᴛɢ-x'}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• ${prefix}ᴀᴘᴘᴀʀᴇɴᴄᴇ_sʏsᴛᴇᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ>*\n` +
          `  *• ᴏᴜ ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴜɴ ᴍᴇssᴀɢᴇ ᴀᴠᴇᴄ ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ*\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      if (newOracleName.length > 50) {
        return reply('*〆 ʟᴇ ɴᴏᴍ ᴅᴇ ʟ\'ᴀᴠᴀᴛᴀʀ ɴᴇ ᴘᴇᴜᴛ ᴇxᴄᴇ́ᴅᴇʀ 50 ᴄᴀʀᴀᴄᴛᴇ̀ʀᴇs !*');
      }

      // Mise à jour de la configuration en mémoire vive
      config.botName = newOracleName;

      // 4. ÉCRITURE PHYSIQUE DANS LE FICHIER CONFIG.JS
      const configPath = path.join(__dirname, '../../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');

      // On cible toute la ligne qui commence par botName
      // et on remplace tout ce qu'il y a entre les guillemets.
      const oracleNameRegex = /(botName\s*:\s*['"`]).*?(['"`])/;

      if (oracleNameRegex.test(configContent)) {
         configContent = configContent.replace(oracleNameRegex, `$1${newOracleName.replace(/'/g, "\\'")}$2`);
         fs.writeFileSync(configPath, configContent, 'utf-8');
      } else {
         return reply('*〆 ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ sɪɢɴᴇʀ ʟᴇ ɢʀɪᴍᴏɪʀᴇ. ʟɪɢɴᴇ "ʙᴏᴛɴᴀᴍᴇ" ɪɴᴛʀᴏᴜᴠᴀʙʟᴇ ᴅᴀɴs ᴄᴏɴғɪɢ.ᴊs.*');
      }

      // Purge du cache de configuration
      delete require.cache[require.resolve('../../config')];

      await reply(`*✅ ʟ\'ᴀᴘᴘᴀʀᴇɴᴄᴇ ᴀ ᴇ́ᴛᴇ́ ᴛʀᴀɴsᴍᴜᴛᴇ́ᴇ : ${newOracleName}*\n*ᴄᴇ sᴄᴇᴀᴜ sᴇʀᴀ ᴅᴇ́sᴏʀᴍᴀɪs ᴀғғɪᴄʜᴇ́ sᴜʀ ʟᴇs ᴍᴇɴᴜs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (error) {
      console.error('Setbotname command error:', error);
      await reply(`*〆 ʟ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀ ᴇ́ᴄʜᴏᴜᴇ́ : ${error.message}*`);
    }
  }
};
