/**
 * Anti-Call System - AGM Security Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (SECURITY STYLE) ---
const AGM_SECURITY = (status) => `╭╼━≪• ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ •≫━╾╮
┃ sʏsᴛᴇᴍ : ᴀɴᴛɪ-ᴄᴀʟʟ 🛡️
┃ sᴛᴀᴛᴜs : ${status === 'on' ? '🟢 ᴀᴄᴛɪᴠᴀᴛᴇᴅ' : '🔴 ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ'}
┃ ᴘᴏʟɪᴄʏ : ᴀᴜᴛᴏ-ʙʟᴏᴄᴋ 🚫
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'anticall',
  aliases: ['anticall'],
  category: 'owner',
  description: 'Activer ou désactiver le système Anti-Appel',
  usage: '.anticall on/off',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const option = args[0]?.toLowerCase();

      if (!option || !['on', 'off'].includes(option)) {
        return extra.reply('⚠️ *ᴜsᴀɢᴇ : .ᴀɴᴛɪᴄᴀʟʟ ᴏɴ/ᴏғғ*');
      }

      const isEnabling = option === 'on';
      const configPath = path.join(__dirname, '../../config.js');
      
      // Lecture du fichier config
      let configContent = fs.readFileSync(configPath, 'utf8');

      // Mise à jour de la valeur via Regex
      if (isEnabling) {
        configContent = configContent.replace(/anticall:\s*(false|true)/g, 'anticall: true');
      } else {
        configContent = configContent.replace(/anticall:\s*(false|true)/g, 'anticall: false');
      }

      // Sauvegarde
      fs.writeFileSync(configPath, configContent);

      // Rafraîchissement du cache de configuration
      delete require.cache[require.resolve('../../config')];

      // Réaction de confirmation
      await sock.sendMessage(extra.from, { 
        react: { text: isEnabling ? '🛡️' : '🔓', key: msg.key } 
      });

      // Message final avec Design AGM
      const response = AGM_SECURITY(option);
      await extra.reply(response);

    } catch (err) {
      console.error('[ANTICALL ERROR]:', err);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴇ ʟᴀ ᴍɪsᴇ à ᴊᴏᴜʀ ᴅᴜ sʏsᴛᴇ̀ᴍᴇ sᴇᴄᴜʀɪᴛʏ.*');
    }
  }
};
