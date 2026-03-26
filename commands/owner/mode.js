/**
 * Bot Mode Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (SYSTEM CORE) ---
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
    try {
      const from = extra.from;
      // Rechargement frais de la config
      delete require.cache[require.resolve('../../config')];
      const config = require('../../config');
      
      let input = args[0]?.toLowerCase();

      // Si pas d'argument, on affiche l'état actuel
      if (!input) {
        const current = config.selfMode ? 'private' : 'public';
        return sock.sendMessage(from, { 
          text: `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n┃ ᴄᴜʀʀᴇɴᴛ : ${current.toUpperCase()}\n┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n╰━━━━━━━━━━━━━━━╯` 
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) {
        targetMode = true;
      } else if (['public', 'pub'].includes(input)) {
        targetMode = false;
      } else {
        return sock.sendMessage(from, { text: '❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*' }, { quoted: msg });
      }

      // Vérification si déjà dans ce mode
      if (config.selfMode === targetMode) {
        return sock.sendMessage(from, { 
          text: `ℹ️ *ʟᴇ ʙᴏᴛ ᴇsᴛ ᴅéᴊà ᴇɴ ᴍᴏᴅᴇ ${targetMode ? 'ᴘʀɪᴠé' : 'ᴘᴜʙʟɪᴄ'}.*` 
        }, { quoted: msg });
      }

      // Mise à jour Physique et Mémoire
      updateConfig('selfMode', targetMode);
      config.selfMode = targetMode;
      
      // Sécurité : mise à jour d'une éventuelle variable globale utilisée par le handler
      if (global.config) global.config.selfMode = targetMode;

      await sock.sendMessage(from, { 
        text: AGM_MODE(targetMode ? 'private' : 'public') 
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
      console.error('Mode error:', error);
      await sock.sendMessage(extra.from, { text: '❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ ʟᴏʀs ᴅᴜ ᴄʜᴀɴɢᴇᴍᴇɴᴛ.*' }, { quoted: msg });
    }
  }
};

/**
 * Met à jour le fichier config.js de manière sécurisée
 */
function updateConfig(key, value) {
  try {
    // Vérifie bien que le chemin remonte au bon niveau (dépend de ton architecture)
    const configPath = path.join(__dirname, '../../config.js'); 
    if (!fs.existsSync(configPath)) {
        console.error("❌ Fichier config.js introuvable à :", configPath);
        return;
    }

    let content = fs.readFileSync(configPath, 'utf8');

    // Cette Regex est plus flexible pour capturer la valeur avant la virgule
    const regex = new RegExp(`(${key}\\s*:\\s*)(true|false|['"].*?['"]|[0-9]+)`, 'g');

    if (regex.test(content)) {
      content = content.replace(regex, `$1${value}`);
      fs.writeFileSync(configPath, content, 'utf8');
      
      // Nettoyage critique du cache pour que le bot "voit" le changement immédiatement
      delete require.cache[require.resolve('../../config.js')];
      console.log(`✅ Config mise à jour : ${key} -> ${value}`);
    } else {
      console.error(`❌ Impossible de trouver la clé "${key}" dans config.js`);
    }
  } catch (e) {
    console.error('Config write error:', e);
  }
}
