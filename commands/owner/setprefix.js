/**
 * Bot Prefix Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM ---
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
      // 1. Localisation dynamique du fichier config.js
      let configPath = path.join(process.cwd(), 'config.js');
      if (!fs.existsSync(configPath)) {
          configPath = path.join(__dirname, '../../config.js');
      }

      // 2. Rechargement de la config
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      let newPrefix = args[0];

      // Si pas d'argument : Afficher le préfixe actuel
      if (!newPrefix) {
        return sock.sendMessage(from, { 
          text: `📌 *ᴘʀᴇғɪxᴇ ᴀᴄᴛᴜᴇʟ :* [ ${config.prefix} ]\n\n*ᴜsᴀɢᴇ :* ${config.prefix}setprefix #` 
        }, { quoted: msg });
      }

      if (newPrefix.length > 3) {
        return sock.sendMessage(from, { text: '❌ *ʟᴇ ᴘʀéғɪxᴇ ᴅᴏɪᴛ ғᴀɪʀᴇ ᴇɴᴛʀᴇ 1 ᴇᴛ 3 ᴄᴀʀᴀᴄᴛèʀᴇs !*' }, { quoted: msg });
      }

      // 3. Lecture et Modification du fichier (Support process.env inclus)
      let content = fs.readFileSync(configPath, 'utf8');
      const oldPrefix = config.prefix;

      // Regex "Elite" : Remplace la valeur peu importe si c'est process.env ou du texte brut
      const prefixRegex = /(prefix\s*:\s*)(process\.env\.PREFIX\s*\|\|\s*)?(['"`])(.*?)(['"`])/;

      if (prefixRegex.test(content)) {
          // On reconstruit la ligne en injectant le nouveau préfixe dans les guillemets
          const newContent = content.replace(prefixRegex, `$1$2$3${newPrefix}$5`);
          fs.writeFileSync(configPath, newContent, 'utf8');

          // Mise à jour immédiate en mémoire
          config.prefix = newPrefix;
          if (global.config) global.config.prefix = newPrefix;

          await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });
          await sock.sendMessage(from, { text: AGM_CORE(oldPrefix, newPrefix) }, { quoted: msg });
          await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

      } else {
          throw new Error("Format de la clé 'prefix' non reconnu dans config.js");
      }

    } catch (error) {
      console.error('[PREFIX ERROR]:', error);
      await sock.sendMessage(from, { 
        text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};
