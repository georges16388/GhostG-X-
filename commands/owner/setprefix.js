/**
 * Bot Prefix Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const AGM_CORE = (oldP, newP) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴛʏᴘᴇ : TEXT ⚡
┃ ᴏʟᴅ : [ ${oldP} ]
┃ ɴᴇᴡ : [ ${newP} ]
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'setpref'],
  category: 'owner',
  description: 'Changer le préfixe du bot de façon permanente.',
  usage: '.setprefix <nouveau_prefixe>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const from = msg.key.remoteJid;

    try {
      // 1. Localisation dynamique et robuste de config.js
      let configPath = path.join(process.cwd(), 'config.js');
      if (!fs.existsSync(configPath)) {
          configPath = path.join(__dirname, '../../config.js');
      }

      // 2. Rechargement propre de la config
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      let newPrefix = args[0];

      // Si pas d'argument : Afficher le préfixe actuel
      if (!newPrefix) {
        return sock.sendMessage(from, { 
          text: `📌 *ᴘʀᴇғɪxᴇ ᴀᴄᴛᴜᴇʟ :* [ ${config.prefix} ]\n\n*ᴜsᴀɢᴇ :* ${config.prefix}setprefix #` 
        }, { quoted: msg });
      }

      // 3. Lecture et Modification du fichier
      let content = fs.readFileSync(configPath, 'utf8');

      // Regex améliorée : capture "prefix", peu importe les espaces ou les guillemets
      const prefixRegex = /(prefix\s*:\s*)(['"`])(.*?)(['"`])/;

      if (prefixRegex.test(content)) {
          const oldPrefix = config.prefix;

          // Remplacement en gardant le même type de guillemets
          const newContent = content.replace(prefixRegex, `$1$2${newPrefix}$4`);
          fs.writeFileSync(configPath, newContent, 'utf8');

          // Mise à jour en mémoire
          config.prefix = newPrefix;
          if (global.config) global.config.prefix = newPrefix;

          await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });
          await sock.sendMessage(from, { text: AGM_CORE(oldPrefix, newPrefix) }, { quoted: msg });
          await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

      } else {
          throw new Error("Clé 'prefix' introuvable dans config.js");
      }

    } catch (error) {
      console.error('[PREFIX ERROR]:', error);
      await sock.sendMessage(from, { 
        text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
