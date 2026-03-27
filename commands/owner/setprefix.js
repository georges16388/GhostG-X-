/**
 * Set Prefix Command - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- DESIGN AGM ---
const AGM_PREFIX = (oldP, newP) => `╭╼━≪• ᴘʀᴇꜰɪx sʏsᴛᴇᴍ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴏʟᴅ : [ ${oldP} ]
┃ ɴᴇᴡ : [ ${newP} ] ⚡
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'changeprefix'],
  category: 'owner',
  description: 'Changer le préfixe des commandes du bot.',
  usage: '.setprefix <nouveau_prefix>',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react, prefix }) {
    const config = require('../../config');
    const configPath = path.join(process.cwd(), 'config.js');

    try {
      const newPrefix = args[0];

      // --- AFFICHAGE ÉTAT ACTUEL ---
      if (!newPrefix) {
        return reply(`📌 *ᴘʀᴇ́ꜰɪxᴇ ᴀᴄᴛᴜᴇʟ :* [ ${config.prefix || prefix} ]\n\n*ᴜsᴀɢᴇ :* .setprefix <symbole>`);
      }

      // Sécurité : Limite de longueur
      if (newPrefix.length > 3) {
        return reply('❌ *Le préfixe doit faire entre 1 et 3 caractères !*');
      }

      await react('⚙️');

      const oldPrefix = config.prefix || prefix;

      // --- MISE À JOUR PHYSIQUE (config.js) ---
      const success = updatePrefixFile(configPath, newPrefix);

      if (success) {
        // Mise à jour de la mémoire vive (Runtime)
        config.prefix = newPrefix;
        if (global.config) global.config.prefix = newPrefix;

        await react('✅');
        return reply(AGM_PREFIX(oldPrefix, newPrefix));
      } else {
        throw new Error("Clé 'prefix' introuvable dans config.js");
      }

    } catch (error) {
      console.error('[PREFIX ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};

/**
 * Fonction d'écriture sécurisée pour le préfixe
 */
function updatePrefixFile(filePath, newPrefix) {
  try {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex qui capture prefix: '...' ou prefix: "..." ou prefix: `...`
    const regex = /(prefix\s*:\s*)(['"`])(.*)(['"`])/i;

    if (regex.test(content)) {
      // On remplace en conservant le type de guillemets d'origine
      const newContent = content.replace(regex, `$1$2${newPrefix}$4`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      // Nettoyage du cache pour synchroniser le prochain require
      delete require.cache[require.resolve(filePath)];
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
