/**
 * SSWeb - AGM Screenshot Edition
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const APIs = require('../../utils/api');

// --- FONCTION DE DESIGN AGM ADAPTÉE ---
const AGM_DESIGN = (url) => {
  // On raccourcit l'URL pour ne pas casser le cadre
  const cleanUrl = url.replace('https://', '').replace('http://', '');
  const displayUrl = cleanUrl.length > 20 ? cleanUrl.substring(0, 17) + '...' : cleanUrl;
  
  return `╭╼━≪• ᴡᴇʙ sᴄʀᴇᴇɴsʜᴏᴛ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴄᴀᴘᴛᴜʀᴇᴅ
┃ ᴛᴀʀɢᴇᴛ : ${displayUrl}
┃ ᴍᴏᴅᴇ : sʏsᴛᴇᴍ ⚡
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;
};

module.exports = {
  name: 'ssweb',
  aliases: ['screenshot', 'ss', 'webss'],
  category: 'utility',
  description: 'Take a screenshot of a website',
  usage: '.ssweb <url>',
  
  async execute(sock, msg, args, extra) {
    try {
      if (args.length === 0) {
        return extra.reply('⚠️ *ᴠᴇᴜɪʟʟᴇᴢ sᴘéᴄɪғɪᴇʀ ʟ\'ᴜʀʟ ᴅ\'ᴜɴ sɪᴛᴇ ᴡᴇʙ.*');
      }
      
      let url = args.join(' ');
      
      // Auto-fix URL si le préfixe manque
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Réaction de chargement
      await sock.sendMessage(extra.from, {
        react: { text: '📸', key: msg.key }
      });
      
      // Capture via ton utilitaire API
      const screenshotBuffer = await APIs.screenshotWebsite(url);
      
      if (!screenshotBuffer) throw new Error('Buffer vide');

      await sock.sendMessage(extra.from, {
        image: screenshotBuffer,
        caption: AGM_DESIGN(url)
      }, { quoted: msg });
      
      // Réaction de succès
      await sock.sendMessage(extra.from, {
        react: { text: '✅', key: msg.key }
      });

    } catch (error) {
      console.error('SSWeb command error:', error);
      await extra.reply(`❌ ᴇʀʀᴇᴜʀ : ${error.message}`);
    }
  }
};
