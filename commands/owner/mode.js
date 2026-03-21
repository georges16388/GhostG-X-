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
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'mode',
  aliases: ['botmode', 'selfmode'],
  category: 'owner',
  description: 'Basculer le bot entre mode privé et public',
  usage: '.mode public/private',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const config = require('../../config');
      const input = args[0]?.toLowerCase();

      if (!input) {
        const current = config.selfMode ? 'private' : 'public';
        return extra.reply(
          `╭╼━≪• ʙᴏᴛ ᴍᴏᴅᴇ •≫━╾╮\n` +
          `┃ ᴄᴜʀʀᴇɴᴛ : ${current.toUpperCase()}\n` +
          `┃ ᴜsᴀɢᴇ : .ᴍᴏᴅᴇ ᴘᴜʙ/ᴘʀɪᴠ\n` +
          `╰━━━━━━━━━━━━━━━╯`
        );
      }

      await sock.sendMessage(extra.from, { react: { text: '⚙️', key: msg.key } });

      if (input === 'private' || input === 'priv') {
        if (config.selfMode) return extra.reply('🔒 *ʟᴇ ʙᴏᴛ ᴇsᴛ ᴅéᴊà ᴇɴ ᴍᴏᴅᴇ ᴘʀɪᴠé.*');
        
        updateConfig('selfMode', true);
        config.selfMode = true;
        return extra.reply(AGM_MODE('private'));
      }
      
      if (input === 'public' || input === 'pub') {
        if (!config.selfMode) return extra.reply('🌐 *ʟᴇ ʙᴏᴛ ᴇsᴛ ᴅéᴊà ᴇɴ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ.*');
        
        updateConfig('selfMode', false);
        config.selfMode = false;
        return extra.reply(AGM_MODE('public'));
      }

      return extra.reply('❌ *ᴏᴘᴛɪᴏɴ ɪɴᴠᴀʟɪᴅᴇ (ᴘᴜʙ/ᴘʀɪᴠ)*');

    } catch (error) {
      console.error('Mode error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ sʏsᴛᴇ̀ᴍᴇ ʟᴏʀs ᴅᴜ ᴄʜᴀɴɢᴇᴍᴇɴᴛ ᴅᴇ ᴍᴏᴅᴇ.*');
    }
  }
};

function updateConfig(key, value) {
  try {
    const configPath = path.join(__dirname, '../../config.js');
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Regex précise pour cibler la clé même si elle est entourée d'espaces
    const regex = new RegExp(`(${key}:\\s*)(true|false)`, 'g');
    content = content.replace(regex, `$1${value}`);
    
    fs.writeFileSync(configPath, content, 'utf8');
    
    // Nettoyage du cache pour que le changement soit immédiat
    delete require.cache[require.resolve('../../config')];
  } catch (e) {
    console.error('Config write error:', e);
  }
}
