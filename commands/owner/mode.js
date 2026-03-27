/**
 * Bot Mode Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 * Role : ᴅᴇᴠᴇʟᴏᴘᴘᴇʀ ⚡
 */

const fs = require('fs');
const path = require('path');
// ... (garder les imports fs et path)

async execute(sock, msg, args, extra) {
    const from = msg.key.remoteJid;
    let input = args[0]?.toLowerCase();

    // Utiliser la variable globale pour vérifier l'état actuel
    // On suppose que ton bot charge la config dans global.config au démarrage
    if (!input) {
        const current = global.config.selfMode ? 'PRIVATE 🔒' : 'PUBLIC 🌐';
        return sock.sendMessage(from, { text: `*État actuel : ${current}*` });
    }

    let targetMode = ['private', 'priv', 'self'].includes(input);
    
    // 1. Mise à jour immédiate en mémoire (pour que le bot réagisse de suite)
    global.config.selfMode = targetMode;

    // 2. Mise à jour du fichier pour le prochain redémarrage
    const configPath = path.join(process.cwd(), 'config.js');
    updateConfigFile(configPath, 'selfMode', targetMode);

    await sock.sendMessage(from, { text: AGM_MODE(targetMode ? 'private' : 'public') });
}

function updateConfigFile(filePath, key, value) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // Regex plus précise pour cibler uniquement la clé exacte
        const regex = new RegExp(`(\\b${key}\\b\\s*:\\s*)([^,\\n]+)`, 'i');
        if (regex.test(content)) {
            const newContent = content.replace(regex, `$1${value}`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            return true;
        }
    } catch (e) { return false; }
}


// --- FONCTION DE DESIGN AGM ---
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

    try {
      // 1. Localisation dynamique du fichier config.js
      let configPath = path.join(process.cwd(), 'config.js');
      if (!fs.existsSync(configPath)) {
          configPath = path.join(__dirname, '../../config.js');
      }

      // 2. Rechargement de la config pour lecture actuelle
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      let input = args[0]?.toLowerCase();

      // Si pas d'argument : afficher l'état actuel avec le design
      if (!input) {
        const current = config.selfMode ? 'PRIVATE 🔒' : 'PUBLIC 🌐';
        return sock.sendMessage(from, { 
          text: `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n┃ ᴄᴜʀʀᴇɴᴛ : ${current}\n┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n╰━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗` 
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) targetMode = true;
      else if (['public', 'pub'].includes(input)) targetMode = false;
      else return sock.sendMessage(from, { text: '❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*' }, { quoted: msg });

      // 3. Mise à jour du fichier physique avec la Regex Robuste
      const success = updateConfigFile(configPath, 'selfMode', targetMode);

      if (success) {
        // Mise à jour immédiate de la mémoire vive
        config.selfMode = targetMode;
        if (global.config) global.config.selfMode = targetMode;

        await sock.sendMessage(from, { text: AGM_MODE(targetMode ? 'private' : 'public') }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      } else {
          throw new Error("Clé 'selfMode' introuvable dans config.js");
      }

    } catch (error) {
      console.error('[MODE ERROR]:', error);
      await sock.sendMessage(from, { 
        text: `❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ :* ${error.message}` 
      }, { quoted: msg });
    }
  }
};

/**
 * Fonction d'écriture Robuste (AGM Core)
 * Remplace la valeur de la clé peu importe le format (process.env ou brut)
 */
function updateConfigFile(filePath, key, value) {
  try {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex qui capture tout après ":" jusqu'à la virgule ou fin de ligne
    const regex = new RegExp(`(${key}\\s*:\\s*)([^,\\n]+)`, 'i');

    if (regex.test(content)) {
      const newContent = content.replace(regex, `$1${value}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
