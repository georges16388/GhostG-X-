/**
 * Uptime Command - AGM System Status
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const config = require('../../config');

/**
 * Formatage ultra-propre pour le design AGM
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + 'ᴅ ' : ''}${h > 0 ? h + 'ʜ ' : ''}${m > 0 ? m + 'ᴍ ' : ''}${s}s`;
}

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (uptime, version) => `╭╼━≪• sʏsᴛᴇᴍ ᴀʟɪᴠᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴏɴʟɪɴᴇ
┃ ᴜᴘᴛɪᴍᴇ : ${uptime} ⏱️
┃ ᴠᴇʀsɪᴏɴ : ${version} 🧬
┃ sᴘᴇᴇᴅ : 🛡️ ᴇʟɪᴛᴇ
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'uptime',
  aliases: ['runtime', 'alive', 'status'],
  category: 'essentials',
  description: 'Show how long the bot has been running',
  usage: '.uptime',
  
  async execute(sock, msg, args, extra) {
    try {
      // Temps de fonctionnement du processus
      const uptimeSeconds = process.uptime();
      const uptimeFormatted = formatUptime(uptimeSeconds);
      const botVersion = 'V1.0.2';
      
      // Réaction de monitoring
      await sock.sendMessage(extra.from, { react: { text: "⏳", key: msg.key } });

      // Envoi du cadre AGM
      await extra.reply(AGM_DESIGN(uptimeFormatted, botVersion));
      
    } catch (error) {
      console.error('Uptime error:', error);
      await extra.reply('❌ *ᴇᴄʜᴇᴄ ᴅᴜ ᴄʜᴀʀɢᴇᴍᴇɴᴛ ᴅᴇs ᴅᴏɴɴéᴇs sʏsᴛèᴍᴇ.*');
    }
  }
};
