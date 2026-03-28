/**
 * Bot Mode Controller - AGM System Core (V5.2)
 * Dual Update: Config + ENV (Persistence)
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- DESIGN AGM ---
const AGM_MODE = (mode) => `╭╼━≪• *ᴀɢᴍ sʏsᴛᴇᴍ ᴍᴏᴅᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜs* : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ *ᴍᴏᴅᴇ* : ${mode === 'private' ? '🔒 ᴘʀɪᴠᴀᴛᴇ' : '🌐 ᴘᴜʙʟɪᴄ'}
┃ *ᴀᴄᴄᴇss* : ${mode === 'private' ? 'ᴏᴡɴᴇʀ ᴏɴʟʏ' : 'ᴇᴠᴇʀʏᴏɴᴇ'}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'selfmode', 'public', 'private'],
  category: 'owner',
  description: 'Basculer le bot entre mode privé (Owner) et public (Tous).',
  usage: '.mode public/private',
  ownerOnly: true,

  async execute(sock, msg, args, { reply, react }) {
    // On utilise la config globale pour la synchronisation immédiate
    const config = global.config || require('../../config');

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
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`
        );
      }

      await react('⚙️');

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) targetMode = true;
      else if (['public', 'pub'].includes(input)) targetMode = false;
      else return reply('❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*');

      // --- MISE À JOUR PHYSIQUE (config.js + .env) ---
      const success = updateModeSystem(targetMode);

      if (success) {
        // Mise à jour de la mémoire vive (Runtime)
        config.selfMode = targetMode;
        if (global.config) global.config.selfMode = targetMode;

        await react('✅');
        return reply(AGM_MODE(targetMode ? 'private' : 'public'));
      } else {
        throw new Error("Impossible de modifier les fichiers de configuration.");
      }

    } catch (error) {
      console.error('[MODE ERROR]:', error);
      reply(`❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}`);
    }
  }
};

/**
 * Fonction d'écriture Robuste (Dual-Update : Config + ENV)
 */
function updateModeSystem(value) {
  const configPath = path.join(process.cwd(), 'config.js');
  const envPath = path.join(process.cwd(), '.env');

  try {
    // 1. Mise à jour de config.js (Regex améliorée pour les booléens)
    if (fs.existsSync(configPath)) {
      let configContent = fs.readFileSync(configPath, 'utf8');
      const configRegex = /(\bselfMode\b\s*:\s*)(true|false|process\.env\.SELF_MODE(?:\s*===\s*'true'|'true'|true)?(?:\s*\|\|\s*(?:true|false))?)/i;
      
      if (configRegex.test(configContent)) {
        configContent = configContent.replace(configRegex, `$1${value}`);
        fs.writeFileSync(configPath, configContent, 'utf8');
        delete require.cache[require.resolve(configPath)];
      }
    }

    // 2. Mise à jour du fichier .env (Persistence Katabump)
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const envRegex = /^SELF_MODE\s*=\s*.*/m;
      
      if (envRegex.test(envContent)) {
        envContent = envContent.replace(envRegex, `SELF_MODE=${value}`);
      } else {
        envContent += `\nSELF_MODE=${value}`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
    
    return true;
  } catch (e) {
    console.error("Critical Write Error:", e);
    return false;
  }
}
