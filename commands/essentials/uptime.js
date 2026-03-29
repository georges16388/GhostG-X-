/**
 * Uptime Command - AGM System Status
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

// --- FONCTION DE CONVERSION EN SMALL CAPS ---
const toStyledCaps = (text) => {
  if (!text) return "";
  const fonts = {
    'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
    'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
    'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
    'y':'ʏ','z':'ᴢ'
  };
  return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

/**
 * Formatage ultra-propre pour le design AGM (SmallCaps)
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  let result = "";
  if (d > 0) result += `${d}ᴅ `;
  if (h > 0) result += `${h}ʜ `;
  if (m > 0) result += `${m}ᴍ `;
  result += `${s}s`;
  return result;
}

// --- FONCTION DE DESIGN AGM PRESTIGE (GRAS) ---
const AGM_DESIGN = (uptime, version) => {
  return `*╭╼━≪• ${toStyledCaps('sʏsᴛᴇᴍ ᴀʟɪᴠᴇ')} •≫━╾╮*
*┃* ✅ *${toStyledCaps('sᴛᴀᴛᴜs')}* : 🟢 *${toStyledCaps('ᴏɴʟɪɴᴇ')}*
*┃* ⏳ *${toStyledCaps('ᴜᴘᴛɪᴍᴇ')}* : *${uptime}*
*┃* 🧬 *${toStyledCaps('ᴠᴇʀsɪᴏɴ')}* : *${toStyledCaps(version)}*
*┃* 🛡️ *${toStyledCaps('sᴘᴇᴇᴅ')}* : *${toStyledCaps('ᴇʟɪᴛᴇ')}*
*╰━━━━━━━━━━━━━━━╯*`;
};

module.exports = {
  name: 'uptime',
  aliases: ['runtime', 'alive', 'status'],
  category: 'essentials',
  description: 'Afficher le temps de fonctionnement du bot',
  usage: '.uptime',

  async execute(sock, msg, args, extra) {
    try {
      // Temps de fonctionnement du processus
      const uptimeSeconds = process.uptime();
      const uptimeFormatted = formatUptime(uptimeSeconds);
      const botVersion = '1.0.0 ᴍᴅ';

      // Réaction de monitoring
      await sock.sendMessage(extra.from, { react: { text: "⏳", key: msg.key } });

      // Envoi du cadre AGM uniquement (Sans externalAdReply)
      await sock.sendMessage(extra.from, {
        text: AGM_DESIGN(uptimeFormatted, botVersion)
      }, { quoted: msg });

    } catch (error) {
      console.error('Uptime error:', error);
      await extra.reply(`❌ *${toStyledCaps("ᴇᴄʜᴇᴄ ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇs ᴅᴏɴɴᴇᴇs")}*`);
    }
  }
};
