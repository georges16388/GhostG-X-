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
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'setpref'],
  category: 'owner',
  description: 'Changer le préfixe du bot de façon permanente.',
  usage: '.setprefix <nouveau_prefixe>',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      const configPath = path.resolve(__dirname, '../../config.js');
      
      // On recharge la config pour être sûr d'avoir la dernière valeur
      delete require.cache[require.resolve('../../config')];
      const config = require('../../config');

      let newPrefix = args[0];

      if (!newPrefix) {
        return sock.sendMessage(from, { 
          text: `📌 *ᴘʀᴇғɪxᴇ ᴀᴄᴛᴜᴇʟ :* [ ${config.prefix} ]\n\n*ᴜsᴀɢᴇ :* ${config.prefix}setprefix #` 
        }, { quoted: msg });
      }

      // 1. Lecture du fichier config.js
      let content = fs.readFileSync(configPath, 'utf8');

      // 2. Regex ultra-flexible pour trouver "prefix: '...'" ou 'prefix: "..."'
      // Elle cherche "prefix:" suivi de n'importe quel espace et n'importe quel type de guillemet
      const prefixRegex = /prefix\s*:\s*['"`](.*?)['"`]/;

      if (prefixRegex.test(content)) {
          const oldPrefix = config.prefix;
          
          // Remplacement physique dans le fichier
          const newContent = content.replace(prefixRegex, `prefix: '${newPrefix}'`);
          fs.writeFileSync(configPath, newContent, 'utf8');

          // 3. Mise à jour immédiate de la mémoire (pour éviter le redémarrage)
          config.prefix = newPrefix;
          global.prefix = newPrefix; // Si ton handler utilise global.prefix

          await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });
          await sock.sendMessage(from, { text: AGM_CORE(oldPrefix, newPrefix) }, { quoted: msg });

      } else {
          throw new Error("Impossible de localiser la variable 'prefix' dans config.js");
      }

    } catch (error) {
      console.error('Prefix Error:', error);
      await sock.sendMessage(extra.from, { 
        text: `❌ *ᴇʀʀᴇᴜʀ :* Le format de ton fichier config.js ne permet pas l'auto-modification.` 
      }, { quoted: msg });
    }
  }
};
