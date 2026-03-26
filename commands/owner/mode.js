const fs = require('fs');
const path = require('path');

const AGM_MODE = (mode) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴍᴏᴅᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴍᴏᴅᴇ : ${mode === 'private' ? '🔒 ᴘʀɪᴠᴀᴛᴇ' : '🌐 ᴘᴜʙʟɪᴄ'}
┃ ᴀᴄᴄᴇss : ${mode === 'private' ? 'ᴏᴡɴᴇʀ ᴏɴʟʏ' : 'ᴇᴠᴇʀʏᴏɴᴇ'}
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'selfmode', 'public', 'private'],
  category: 'owner',
  description: 'Basculer le bot entre mode privé (Owner) et public (Tous).',
  usage: '.mode public/private',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const from = msg.key.remoteJid;
    console.log(`[MODE] Commande lancée par ${msg.pushName}`);

    try {
      // 1. Localisation dynamique du fichier config.js
      // On teste deux chemins courants : racine ou dossier parent
      let configPath = path.join(process.cwd(), 'config.js');
      if (!fs.existsSync(configPath)) {
          configPath = path.join(__dirname, '../../config.js');
      }

      // 2. Rechargement manuel de la config
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      let input = args[0]?.toLowerCase();

      // Si pas d'argument : afficher l'état
      if (!input) {
        const current = config.selfMode ? 'private' : 'public';
        return sock.sendMessage(from, { 
          text: `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n┃ ᴄᴜʀʀᴇɴᴛ : ${current.toUpperCase()}\n┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n╰━━━━━━━━━━━━━━━╯` 
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) targetMode = true;
      else if (['public', 'pub'].includes(input)) targetMode = false;
      else return sock.sendMessage(from, { text: '❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*' }, { quoted: msg });

      // 3. Mise à jour du fichier physique
      const success = updateConfigFile(configPath, 'selfMode', targetMode);

      if (success) {
        // Mise à jour en mémoire immédiate
        config.selfMode = targetMode;
        if (global.config) global.config.selfMode = targetMode;

        await sock.sendMessage(from, { text: AGM_MODE(targetMode ? 'private' : 'public') }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      } else {
          throw new Error("Échec de l'écriture dans config.js");
      }

    } catch (error) {
      console.error('[MODE ERROR]:', error);
      await sock.sendMessage(from, { text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ* : ${error.message}` }, { quoted: msg });
    }
  }
};

/**
 * Fonction d'écriture ultra-robuste
 */
function updateConfigFile(filePath, key, value) {
  try {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, 'utf8');

    // CETTE REGEX EST LA SOLUTION :
    // Elle cherche la clé (ex: selfMode) et remplace TOUT ce qui suit 
    // jusqu'à la virgule ou la fin de la ligne.
    const regex = new RegExp(`(${key}\\s*:\\s*)([^,\\n]+)`, 'i');

    if (regex.test(content)) {
      // On remplace la valeur trouvée par la nouvelle (true ou false)
      const newContent = content.replace(regex, `$1${value}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

