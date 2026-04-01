/**
 * Uptime Command - Display bot uptime since it was started
 */

const config = require('../../config.js');

// Fonction pour le style Small Caps
function toSmallCaps(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz0123456789";
  const smallCaps = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789";

  const cleanedText = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  return cleanedText.split('').map(c => {
    const index = normal.indexOf(c);
    return index !== -1 ? smallCaps[index] : c;
  }).join('');
}

/**
 * Format time difference into human-readable string
 * @param {number} seconds - Total seconds of uptime
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
  if (seconds <= 0) {
    return toSmallCaps('0 seconde');
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (days > 0) {
    parts.push(`${days} ${toSmallCaps(days === 1 ? 'jour' : 'jours')}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${toSmallCaps(hours === 1 ? 'heure' : 'heures')}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${toSmallCaps(minutes === 1 ? 'minute' : 'minutes')}`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${toSmallCaps(secs === 1 ? 'seconde' : 'secondes')}`);
  }

  return parts.join(', ');
}

module.exports = {
  name: 'ᴇᴠᴇɪʟ',
  aliases: ['runtime', 'uptime', 'alive', 'éveil', 'up', 'eveil'],
  category: '☬ᴄᴏᴅᴇx ᴇᴛ ʀɪᴛᴜᴇʟs',
  description: '**ᴀꜰꜰɪᴄʜᴇ ʟᴇ ᴛᴇᴍᴘꜱ ᴅᴇᴘᴜɪꜱ ʟᴇQᴜᴇʟ ʟᴇ ʙᴏᴛ ᴇꜱᴛ ᴇ́ᴠᴇɪʟʟᴇ́**',
  usage: 'ᴇᴠᴇɪʟ',

  async execute(sock, msg, args, extra) {
    try {
      const prefix = config.prefix || '.';

      // Get process uptime in seconds
      const uptimeSeconds = process.uptime();
      const uptime = formatUptime(uptimeSeconds);

      // Get bot info
      const botName = config.botName || 'ɢʜᴏsᴛɢ-𝐗';
      const botVersion = '1.0.0';

      // Build response message
      let message = 
          `╭╼━≪• *⏳ ᴇɢʀᴇ́ɢᴏʀᴇ ᴅ'ᴇ́ᴠᴇɪʟ* •≫━╾╮\n` +
          `┃\n` +
          `┃ 🤖 *${toSmallCaps('nom')} :* ${toSmallCaps(botName)}\n` +
          `┃ 🧬 *${toSmallCaps('version')} :* ${botVersion}\n` +
          `┃ ⏱️ *${toSmallCaps('eveil')} :* ${uptime}\n` +
          `┃\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `_❤️ ᴊᴇsᴜs ᴛᴀɪᴍᴇ ᴇᴛ ᴛᴇ ʙᴇ́ɴɪssᴇ_ ❤️\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

      await extra.reply(message);

    } catch (error) {
      console.error('Error in uptime command:', error);
      await extra.reply(
        `╭╼━≪• *❌ ᴇᴄʜᴇᴄ ᴅᴇ ʟᴀ sᴏɴᴅᴇ* •≫━╾╮\n` +
        `┃\n` +
        `┃ 🥀 *${toSmallCaps('impossible de lire le temps deveil')}*\n` +
        `┃ ⚠️ *${toSmallCaps('erreur')} :* ${error.message}\n` +
        `┃\n` +
        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );
    }
  }
};
