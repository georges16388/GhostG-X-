/**
 * Bot Mode Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN ---
const AGM_MODE = (mode) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴍᴏᴅᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴍᴏᴅᴇ : ${mode === 'private' ? '🔒 ᴘʀɪᴠᴀᴛᴇ' : '🌐 ᴘᴜʙʟɪᴄ'}
┃ ᴀᴄᴄᴇss : ${mode === 'private' ? 'ᴏᴡɴᴇʀ ᴏɴʟʏ' : 'ᴇᴠᴇʀʏᴏɴᴇ'}
╰━━━━━━━━━━━━━━━╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗*`;

// --- FONCTION D'ÉCRITURE ---
function updateConfigFile(filePath, key, value) {
  try {
    if (!fs.existsSync(filePath)) return false;
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex améliorée pour cibler la valeur après les deux-points
    // Elle s'arrête à la première virgule ou fin de ligne
    const regex = new RegExp(`(\\b${key}\\b\\s*:\\s*)([^,\\n]+)`, 'i');

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

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'selfmode', 'public', 'private'],
  category: 'owner',
  description: 'Basculer le bot entre mode privé (Owner) et public (Tous).',
  usage: '.mode public/private',
  ownerOnly: true,

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    let configPath = path.join(process.cwd(), 'config.js');

    try {
      // 1. Détection du chemin
      if (!fs.existsSync(configPath)) {
          configPath = path.join(__dirname, '../../config.js');
      }

      // 2. Lecture de la config actuelle via le cache
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);

      let input = args[0]?.toLowerCase();

      // État actuel
      if (!input) {
        const current = (global.config?.selfMode || config.selfMode) ? 'PRIVATE 🔒' : 'PUBLIC 🌐';
        return sock.sendMessage(from, { 
          text: `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n┃ ᴄᴜʀʀᴇɴᴛ : ${current}\n┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n╰━━━━━━━━━━━━━━━╯\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗` 
        }, { quoted: msg });
      }

      let targetMode;
      if (['private', 'priv', 'self'].includes(input)) targetMode = true;
      else if (['public', 'pub'].includes(input)) targetMode = false;
      else return sock.sendMessage(from, { text: '❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*' }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

      // 3. Mise à jour physique
      const success = updateConfigFile(configPath, 'selfMode', targetMode);

      if (success) {
        // Mise à jour de la mémoire pour éviter le redémarrage
        if (global.config) global.config.selfMode = targetMode;
        
        await sock.sendMessage(from, { text: AGM_MODE(targetMode ? 'private' : 'public') }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
      } else {
        throw new Error("Impossible de modifier la clé dans config.js");
      }

    } catch (error) {
      console.error('[MODE ERROR]:', error);
      await sock.sendMessage(from, { text: `❌ *ᴇʀʀᴇᴜʀ :* ${error.message}` }, { quoted: msg });
    }
  }
};
