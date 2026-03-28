/**
 * Set Prefix Command - AGM System Core (V5.2)
 * Dual Update: Config + ENV
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- DESIGN AGM ---
const AGM_PREFIX = (oldP, newP) => `╭╼━≪• *ᴘʀᴇꜰɪx sʏsᴛᴇᴍ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ *ᴏʟᴅ* : [ ${oldP} ]
┃ *ɴᴇᴡ* : [ ${newP} ] ⚡
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'changeprefix'],
  category: 'owner',
  description: 'Changer le préfixe des commandes du bot.',
  usage: '.setprefix <nouveau_prefix>',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react, prefix }) {
    // On utilise la config globale ou locale
    const config = global.config || require('../../config');

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

      // --- MISE À JOUR PHYSIQUE (config.js + .env) ---
      const success = updatePrefixSystem(newPrefix);

      if (success) {
        // Mise à jour immédiate de la mémoire vive (Runtime)
        config.prefix = newPrefix;
        if (global.config) global.config.prefix = newPrefix;

        await react('✅');
        return reply(AGM_PREFIX(oldPrefix, newPrefix));
      } else {
        throw new Error("Impossible de modifier les fichiers de configuration.");
      }

    } catch (error) {
      console.error('[PREFIX ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};

/**
 * Fonction d'écriture sécurisée (Dual-Path : Config + ENV)
 */
function updatePrefixSystem(newPrefix) {
  const configPath = path.join(process.cwd(), 'config.js');
  const envPath = path.join(process.cwd(), '.env');

  try {
    // 1. Mise à jour de config.js
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      const configRegex = /(prefix\s*:\s*)(['"`])(.*)(['"`])/i;
      
      if (configRegex.test(configContent)) {
        configContent = configContent.replace(configRegex, `$1$2${newPrefix}$4`);
        fs.writeFileSync(configPath, configContent, 'utf8');
        // On vide le cache pour que le prochain require() lise la nouvelle version
        delete require.cache[require.resolve(configPath)];
      }
    }

    // 2. Mise à jour du fichier .env (Persistence Katabump)
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const envRegex = /^PREFIX\s*=\s*.*/m;
      
      if (envRegex.test(envContent)) {
        // Si PREFIX existe déjà, on le remplace
        envContent = envContent.replace(envRegex, `PREFIX=${newPrefix}`);
      } else {
        // Sinon, on l'ajoute à la fin
        envContent += `\nPREFIX=${newPrefix}`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
    
    return true;
  } catch (e) {
    console.error("Critical Write Error:", e);
    return false;
  }
}
