/**
 * Auto-React Configuration Manager - AGM Config-Sync
 * Typographie : ꜱᴍᴀʟʟ ᴄᴀᴘꜱ ᴘʀᴇᴍɪᴜᴍ
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.js');

/**
 * Charge la configuration actuelle du bot
 */
function load() {
    try {
        // Purge du cache pour lire la version la plus récente sur le disque
        delete require.cache[require.resolve('../config.js')];
        const config = require('../config.js');
        
        return {
            enabled: config.autoReact || false,
            mode: config.autoReactMode || 'all',
            supreme: config.supremeNumber || '22651622652'
        };
    } catch (err) {
        console.error('⚠️ [ᴀɢᴍ_ʟᴏᴀᴅ_ᴇʀʀᴏʀ] :', err.message);
        return { enabled: false, mode: 'all' };
    }
}

/**
 * Sauvegarde les modifications directement dans config.js
 */
function save(data) {
    try {
        let content = fs.readFileSync(CONFIG_PATH, 'utf8');
        
        // Mise à jour de autoReact (true/false)
        if (content.includes('autoReact:')) {
            content = content.replace(/autoReact:\s*(true|false)/, `autoReact: ${data.enabled}`);
        }

        // Mise à jour ou ajout de autoReactMode ('all'/'bot')
        if (content.includes('autoReactMode:')) {
            content = content.replace(/autoReactMode:\s*['"]\w+['"]/, `autoReactMode: '${data.mode}'`);
        } else {
            // Insertion intelligente après autoReact
            content = content.replace(/(autoReact:.*,)/, `$1\n    autoReactMode: '${data.mode}',`);
        }

        fs.writeFileSync(CONFIG_PATH, content, 'utf8');
        
        // Nettoyage immédiat du cache pour que le bot applique le changement sans redémarrer
        delete require.cache[require.resolve('../config.js')];
        
        console.log(`╭╼━≪• ᴀɢᴍ ᴄᴏɴꜰɪɢ ᴜᴘᴅᴀᴛᴇ •≫━╾╮\n┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ꜱʏɴᴄᴇᴅ\n┃ ᴍᴏᴅᴇ : ${data.mode.toUpperCase()}\n╰━━━━━━━━━━━━━━━╯`);
        
    } catch (err) {
        console.error('❌ [ᴀɢᴍ_ꜱᴀᴠᴇ_ᴇʀʀᴏʀ] :', err.message);
    }
}

module.exports = { load, save };
