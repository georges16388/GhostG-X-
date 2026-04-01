/**
 * Anti-Call Command - GhostG-X Edition
 * Active ou désactive le rejet automatique des appels
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config'); // Importation de la configuration

module.exports = {
  name: 'ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs',
  aliases: ['rejet_appels', 'anticall', 'anti-call', 'rejeter'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  description: '*『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴀᴄᴛɪᴠᴇ ᴏᴜ ᴅᴇ́sᴀᴄᴛɪᴠᴇ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ*',
  usage: (prefix) => `${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ/ᴏғғ/sᴛᴀᴛᴜs`,

  async execute(sock, msg, args, extra) {
    const configPath = path.join(__dirname, '../../config.js');
    const prefix = config.prefix || '.'; // Utilisation du préfixe de la config
    
    if (!args[0]) {
      return extra.reply(`*ᴜsᴀɢᴇ : ${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ / ᴏғғ / sᴛᴀᴛᴜs*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }

    const option = args[0].toLowerCase();
    
    try {
      // Lecture du fichier de configuration actuel
      let configFile = fs.readFileSync(configPath, 'utf8');
      
      // Vérification de l'état actuel
      const isCurrentlyEnabled = /anticall:\s*true/.test(configFile);

      // Traitement de l'option "status"
      if (option === 'status') {
        const statusText = isCurrentlyEnabled 
          ? '*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴀᴄᴛɪᴠᴇ́.*' 
          : '*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*';
        return extra.reply(`${statusText}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (!['on', 'off'].includes(option)) {
        return extra.reply(`*ᴜsᴀɢᴇ : ${prefix}ʀᴇᴊᴇᴛ_ᴀᴘᴘᴇʟs ᴏɴ / ᴏғғ / sᴛᴀᴛᴜs*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      const enable = option === 'on';

      // Évite de réécrire le fichier inutilement si l'état est déjà le bon
      if (enable === isCurrentlyEnabled) {
        return extra.reply(enable 
          ? '*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴀᴄᴛɪᴠᴇ́.*' 
          : '*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴅᴇ́sᴀᴄᴛɪᴠᴇ́.*'
        );
      }

      // Transmutation des paramètres
      if (enable) {
        configFile = configFile.replace(/anticall\s*:\s*false/g, 'anticall: true');
      } else {
        configFile = configFile.replace(/anticall\s*:\s*true/g, 'anticall: false');
      }

      // Écriture de la configuration mise à jour
      fs.writeFileSync(configPath, configFile, 'utf8');

      // Purge du cache
      delete require.cache[require.resolve('../../config')];

      const successMessage = enable
        ? `*🛡️ ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴇsᴛ ᴀᴄᴛɪᴠᴇ́. ᴛᴏᴜᴛᴇ ɪɴᴛʀᴜsɪᴏɴ ᴠᴏᴄᴀʟᴇ sᴇʀᴀ ʀᴇᴊᴇᴛᴇ́ᴇ ᴇᴛ sᴄᴇʟʟᴇ́ᴇ.*`
        : `*🔓 ʟᴇ ʙᴏᴜᴄʟɪᴇʀ ᴀɴᴛɪ-ᴀᴘᴘᴇʟs ᴀ ᴇ́ᴛᴇ́ ᴅɪssɪᴘᴇ́. ʟᴇs ᴀᴘᴘᴇʟs sᴏɴᴛ ᴀ̀ ɴᴏᴜᴠᴇᴀᴜ ᴀᴜᴛᴏʀɪsᴇ́s.*`;

      await extra.reply(successMessage + `\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);

    } catch (err) {
      console.error('[anticall cmd] error:', err);
      extra.reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ɪɴᴛᴇʀʀᴏᴍᴘᴜ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ʙᴏᴜᴄʟɪᴇʀ.*');
    }
  }
};
