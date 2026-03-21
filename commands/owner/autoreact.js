/**
 * Auto-React System - AGM Elite Configuration
 * Optimized for GhostG-X 100ms Response
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (CONFIG STYLE) ---
const AGM_CONFIG = (status, mode) => `╭╼━≪• ᴀɢᴍ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ •≫━╾╮
┃ sᴛᴀᴛᴜs : ${status ? '🟢 ᴇɴᴀʙʟᴇᴅ' : '🔴 ᴅɪsᴀʙʟᴇᴅ'}
┃ ᴍᴏᴅᴇ : ${mode.toUpperCase()} ⚡
┃ sʏsᴛᴇᴍ : ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ ✅
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'autoreact',
  aliases: ['ar', 'react', 'auto-react'],
  category: 'owner',
  description: 'Gérer les réactions automatiques du bot.',
  usage: '.ar on | off | bot | all',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      // On charge la config actuelle (on force la lecture du fichier pour la précision)
      delete require.cache[require.resolve('../../config')];
      const config = require('../../config');
      
      const opt = args.join(' ').toLowerCase();

      if (!opt) {
        const currentMode = config.autoReactMode || 'bot';
        return sock.sendMessage(from, { 
            text: `╭╼━≪• ᴀʀ ᴏᴘᴛɪᴏɴs •≫━╾╮\n` +
                  `┃ ᴄᴜʀʀᴇɴᴛ : ${config.autoReact ? '✅ ON' : '❌ OFF'}\n` +
                  `┃ ᴍᴏᴅᴇ : ${currentMode.toUpperCase()}\n` +
                  `┃ • *on/off* : Activer/Couper\n` +
                  `┃ • *bot* : Réagit aux commandes\n` +
                  `┃ • *all* : Réagit à tout\n` +
                  `╰━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

      let newStatus = config.autoReact;
      let newMode = config.autoReactMode || 'bot';

      // 1. Logique de sélection
      if (opt === 'on') {
        newStatus = true;
      } else if (opt === 'off') {
        newStatus = false;
      } else if (opt === 'bot') {
        newMode = 'bot';
        newStatus = true; // On active si on change le mode
      } else if (opt === 'all') {
        newMode = 'all';
        newStatus = true;
      } else {
        return sock.sendMessage(from, { text: '❌ *ᴏᴘᴛɪᴏɴs : on, off, bot, all*' }, { quoted: msg });
      }

      // 2. Mise à jour physique (config.js)
      updateConfigValue('autoReact', newStatus);
      updateConfigValue('autoReactMode', `'${newMode}'`);

      // 3. Mise à jour Mémoire (Instantanée pour le Handler)
      config.autoReact = newStatus;
      config.autoReactMode = newMode;
      if (global.config) {
          global.config.autoReact = newStatus;
          global.config.autoReactMode = newMode;
      }

      // 4. Réponse Finale
      await sock.sendMessage(from, { text: AGM_CONFIG(newStatus, newMode) }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (err) {
      console.error('[AUTOREACT ERROR]:', err);
      await sock.sendMessage(extra.from, { text: '❌ *ᴇʀʀᴇᴜʀ sʏsᴛéᴍᴇ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ.*' }, { quoted: msg });
    }
  }
};

/**
 * Fonction utilitaire pour modifier le fichier config.js
 */
function updateConfigValue(key, value) {
    try {
        const configPath = path.join(process.cwd(), 'config.js');
        let content = fs.readFileSync(configPath, 'utf8');
        const regex = new RegExp(`(${key}\\s*:\\s*)([^,;\\n}]+)`, 'g');
        
        if (regex.test(content)) {
            content = content.replace(regex, `$1${value}`);
            fs.writeFileSync(configPath, content, 'utf8');
        }
    } catch (e) {
        console.error('Update Config Error:', e);
    }
}
