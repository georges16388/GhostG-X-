/**
 * Mode Command - GhostG-X Edition
 * Toggle bot between private and public mode
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ᴅᴏᴍᴀɪɴᴇ',
  aliases: ['domaine', 'botmode', 'privatemode', 'publicmode', 'mode'],
  description: 'ʙᴀsᴄᴜʟᴇ ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴇɴᴛʀᴇ ʟᴇ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́ ᴇᴛ ᴘᴜʙʟɪᴄ',
  usage: '.ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>',
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
  const prefix = config.prefix || '.'; 
    try {
      if (!args[0]) {
        const currentMode = config.selfMode ? 'ᴘʀɪᴠᴇ́' : 'ᴘᴜʙʟɪᴄ';
        const description = config.selfMode 
          ? 'sᴇᴜʟ ʟᴇ sᴜᴘʀᴇ̂ᴍᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ ᴘᴇᴜᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs'
          : 'ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs ᴘᴇᴜᴠᴇɴᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs';
        
        return extra.reply(
          `*╭╼━━━≪• ᴇ́ᴛᴀᴛ ᴅᴜ ᴅᴏᴍᴀɪɴᴇ •≫━━━╾╮*\n` +
          `*┃ 🔮 ᴍᴏᴅᴇ ᴀᴄᴛᴜᴇʟ : ${currentMode}*\n` +
          `*┃ 📜 sᴛᴀᴛᴜᴛ : ${description}*\n` +
          `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
          `*☬ ᴜsᴀɢᴇ :*\n` +
          `  *• ${prefix}ᴅᴏᴍᴀɪɴᴇ ᴘʀɪᴠᴇ - sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴀ ʟᴇ ᴘᴏᴜᴠᴏɪʀ*\n` +
          `  *• ${prefix}ᴅᴏᴍᴀɪɴᴇ ᴘᴜʙʟɪᴄ - ʟᴇs ᴘᴏʀᴛᴇs sᴏɴᴛ ᴏᴜᴠᴇʀᴛᴇs*\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }
      
      const mode = args[0].toLowerCase();
      
      if (mode === 'private' || mode === 'priv' || mode === 'privé' || mode === 'prive') {
        if (config.selfMode) {
          return extra.reply('*🔒 ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ sᴄᴇʟʟᴇ́ ᴇɴ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
        }
        
        // Update config
        updateConfig('selfMode', true);
        config.selfMode = true; // Update runtime config
        return extra.reply('*🔒 ʟᴇ ᴅᴏᴍᴀɪɴᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘʀɪᴠᴇ́.*\n*sᴇᴜʟ ʟᴇ sᴜᴘʀᴇ̂ᴍᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ ᴀ ʟᴇ ᴘᴏᴜᴠᴏɪʀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      }
      
      if (mode === 'public' || mode === 'pub') {
        if (!config.selfMode) {
          return extra.reply('*🌐 ʟᴇ sᴀɴᴄᴛᴜᴀɪʀᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴏᴜᴠᴇʀᴛ ᴇɴ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
        }
        
        // Update config
        updateConfig('selfMode', false);
        config.selfMode = false; // Update runtime config
        return extra.reply('*🌐 ʟᴇ ᴅᴏᴍᴀɪɴᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘᴜʙʟɪᴄ.*\n*ʟᴇs ᴘᴏʀᴛᴇs sᴏɴᴛ ᴏᴜᴠᴇʀᴛᴇs ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*');
      }
      
      return extra.reply('*〆 ᴍᴏᴅᴇ ɪɴᴠᴀʟɪᴅᴇ ! ᴜᴛɪʟɪsᴇ : .ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>*');
      
    } catch (error) {
      console.error('Mode command error:', error);
      await extra.reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ᴇ̂ᴍᴘᴇ̂ᴄʜᴇ́ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ᴅᴏᴍᴀɪɴᴇ.*');
    }
  }
};

function updateConfig(key, value) {
  try {
    const configPath = path.join(__dirname, '..', '..', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the value
    const regex = new RegExp(`(${key}:\\s*)(true|false)`, 'g');
    configContent = configContent.replace(regex, `$1${value}`);
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    // Reload config
    delete require.cache[require.resolve('../../config')];
  } catch (error) {
    console.error('Error saving config:', error);
  }
}
