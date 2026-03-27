/**
 * Bot Mode Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- DESIGN AGM ---
const AGM_MODE = (mode) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴍᴏᴅᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴍᴏᴅᴇ : ${mode === 'private' ? '🔒 ᴘʀɪᴠᴀᴛᴇ' : '🌐 ᴘᴜʙʟɪᴄ'}
┃ ᴀᴄᴄᴇss : ${mode === 'private' ? 'ᴏᴡɴᴇʀ ᴏɴʟʏ' : 'ᴇᴠᴇʀʏᴏɴᴇ'}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'selfmode', 'public', 'private'],
  category: 'owner',
  description: 'Basculer le bot entre mode privé (Owner) et public (Tous).',
  usage: '.mode public/private',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    const config = require('../../config');
    const configPath = path.join(process.cwd(), 'config.js');

    try {
      let input = args[0]?.toLowerCase();

      // --- AFFICHAGE ÉTAT ACTUEL ---
      if (!input) {
        const current = config.selfMode ? 'PRIVATE 🔒' : 'PUBLIC 🌐';
        return reply(
          `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n` +
          `┃ ᴄᴜʀʀᴇɴᴛ : ${current}\n` +
          `┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n` +
          `╰━━━━━━━━━━━━━━━╯\n` +
          `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`
        );
      }

      await react('⚙️');

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) targetMode = true;
      else if (['public', 'pub'].includes(input)) targetMode = false;
      else return reply('❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*');

      // Vérification si déjà dans ce mode
      if (config.selfMode === targetMode) {
        return reply(`⚠️ *Le bot est déjà en mode ${targetMode ? 'PRIVE' : 'PUBLIC'}.*`);
      }

      // --- MISE À JOUR PHYSIQUE (config.js) ---
      const success = updateConfigFile(configPath, 'selfMode', targetMode);

      if (success) {
        // Mise à jour de la mémoire (Runtime)
        config.selfMode = targetMode;
        if (global.config) global.config.selfMode = targetMode;

        await react('✅');
        return reply(AGM_MODE(targetMode ? 'private' : 'public'));
      } else {
        throw new Error("Clé 'selfMode' introuvable dans config.js");
      }

    } catch (error) {
      console.error('[MODE ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};

/**
 * Fonction d'écriture Robuste
 * Remplace la valeur de la clé sans détruire le formatage du fichier
 */
function updateConfigFile(filePath, key, value) {
  try {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex qui cible la clé et remplace sa valeur booléenne
    const regex = new RegExp(`(\\b${key}\\b\\s*:\\s*)(true|false|process\\.env\\.[A-Z_]+(?:\\s*\\|\\|\\s*(?:true|false))?)`, 'i');

    if (regex.test(content)) {
      const newContent = content.replace(regex, `$1${value}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      // Nettoyage du cache pour le prochain require
      delete require.cache[require.resolve(filePath)];
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
