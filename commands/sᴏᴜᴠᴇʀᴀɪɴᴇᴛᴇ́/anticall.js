/**
 * Anti-Call Command - GhostG-X Edition
 * Active ou désactive le rejet automatique des appels
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs',
  aliases: ['rejet_appels', 'anticall', 'anti-call', 'rejeter'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: 'ᴀᴄᴛɪᴠᴇ ᴏᴜ ᴅᴇ́sᴀᴄᴛɪᴠᴇ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: '.ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ',

  async execute(sock, msg, args, extra) {
    if (!args[0]) {
      return extra.reply('*ᴜsᴀɢᴇ : .ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    }

    const option = args[0].toLowerCase();

    if (!['on', 'off'].includes(option)) {
      return extra.reply('*ᴜsᴀɢᴇ : .ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
    }

    const enabled = option === 'on';
    const configPath = path.join(__dirname, '../../config.js');
    
    try {
      // Lecture du fichier de configuration actuel
      let configFile = fs.readFileSync(configPath, 'utf8');
      
      // Transmutation des paramètres de configuration
      if (enabled) {
        configFile = configFile.replace(/anticall:\s*false/g, 'anticall: true');
      } else {
        configFile = configFile.replace(/anticall:\s*true/g, 'anticall: false');
      }
      
      // Écriture de la configuration mise à jour
      fs.writeFileSync(configPath, configFile);
      
      // Purge du cache pour charger immédiatement la nouvelle loi
      delete require.cache[require.resolve('../../config')];
      
      const successMessage = enabled
        ? `*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴀᴄᴛɪᴠᴇ́. ᴛᴏᴜᴛᴇ ɪɴᴛʀᴜsɪᴏɴ ᴠᴏᴄᴀʟᴇ sᴇʀᴀ ʀᴇᴊᴇᴛᴇ́ᴇ ᴇᴛ sᴄᴇʟʟᴇ́ᴇ.*`
        : `*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴀ ᴇ́ᴛᴇ́ ᴅɪssɪᴘᴇ́. ʟᴇs ᴀᴘᴘᴇʟs sᴏɴᴛ ᴀ̀ ɴᴏᴜᴠᴇᴀᴜ ᴀᴜᴛᴏʀɪsᴇ́s.*`;

      await extra.reply(successMessage + `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      
    } catch (err) {
      console.error('[anticall cmd] error:', err);
      extra.reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ɪɴᴛᴇʀʀᴏᴍᴘᴜ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ʙᴏᴜᴄʟɪᴇʀ.*');
    }
  }
};
