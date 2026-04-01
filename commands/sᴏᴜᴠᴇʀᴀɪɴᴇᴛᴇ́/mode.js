/**
 * Mode Command - GhostG-X Edition
 * Toggle bot between private and public mode
 */

const config = require('../../config');
const fs = require('fs');
const path = require('path');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'ᴅᴏᴍᴀɪɴᴇ',
  aliases: ['domaine', 'botmode', 'privatemode', 'publicmode', 'mode'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Sécurité : Toi seul peux l'utiliser
  description: `**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʙᴀsᴄᴜʟᴇ ʟ'ᴏʀᴀᴄʟᴇ ᴇɴᴛʀᴇ ʟᴇ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́ ᴇᴛ ᴘᴜʙʟɪᴄ**`,
  usage: `${prefix}ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>`,

  async execute(sock, msg, args, extra) {
    const { reply, isOwner } = extra;

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ sᴄᴇʟʟᴇʀ ʟᴇ ᴅᴏᴍᴀɪɴᴇ.*');

    try {
      if (!args[0]) {
        const currentMode = config.selfMode ? 'ᴘʀɪᴠᴇ́' : 'ᴘᴜʙʟɪᴄ';
        const description = config.selfMode 
          ? `*sᴇᴜʟ ʟᴇ ᴄᴏᴍᴍᴀɴᴅᴇᴜʀ ᴅᴇ ʟ'ᴏʀᴀᴄʟᴇ ᴘᴇᴜᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs*`
          : '*ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs ᴘᴇᴜᴠᴇɴᴛ ɪɴᴠᴏǫᴜᴇʀ ʟᴇs ᴀʀᴄᴀɴᴇs*';

        return reply(
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
          return reply(`*🔒 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ sᴄᴇʟʟᴇ́ ᴇɴ ᴍᴏᴅᴇ ᴘʀɪᴠᴇ́.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // Update config
        updateConfig('selfMode', true);
        config.selfMode = true; // Update runtime config
        return reply(`*🔒 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘʀɪᴠᴇ́.*\n*sᴇᴜʟ ʟᴇ sᴜᴘʀᴇ̂ᴍᴇ ᴄʀᴇ́ᴀᴛᴇᴜʀ ᴀ ʟᴇ ᴘᴏᴜᴠᴏɪʀ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      if (mode === 'public' || mode === 'pub') {
        if (!config.selfMode) {
          return reply(`*🌐 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́ᴊᴀ̀ ᴏᴜᴠᴇʀᴛ ᴇɴ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
        }

        // Update config
        updateConfig('selfMode', false);
        config.selfMode = false; // Update runtime config
        return reply(`*🌐 ʟ'ᴏʀᴀᴄʟᴇ ᴇsᴛ ᴅᴇ́sᴏʀᴍᴀɪs ᴘᴜʙʟɪᴄ.*\n*ʟᴇs ᴘᴏʀᴛᴇs sᴏɴᴛ ᴏᴜᴠᴇʀᴛᴇs ᴀ̀ ᴛᴏᴜᴛᴇs ʟᴇs ᴀ̂ᴍᴇs.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
      }

      return reply(`*〆 ᴍᴏᴅᴇ ɪɴᴠᴀʟɪᴅᴇ ! ᴜᴛɪʟɪsᴇ : ${prefix}ᴅᴏᴍᴀɪɴᴇ <ᴘʀɪᴠᴇ/ᴘᴜʙʟɪᴄ>*`);

    } catch (error) {
      console.error('Mode command error:', error);
      await reply('*〆 ᴜɴᴇ ᴇʀʀᴇᴜʀ ᴀ ᴇ̂ᴍᴘᴇ̂ᴄʜᴇ́ ʟᴀ ᴛʀᴀɴsᴍᴜᴛᴀᴛɪᴏɴ ᴅᴜ ᴅᴏᴍᴀɪɴᴇ.*');
    }
  }
};

function updateConfig(key, value) {
  try {
    // On remonte de 2 dossiers car cette commande est dans /commands/Souverainete/
    const configPath = path.join(__dirname, '../../config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Update the value
    const regex = new RegExp(`(${key}:\\s*)(true|false)`, 'g');
    configContent = configContent.replace(regex, `$1${value}`);

    fs.writeFileSync(configPath, configContent, 'utf8');

    // Reload config
    delete require.cache[require.resolve('../../config.js')];
  } catch (error) {
    console.error('Error saving config:', error);
  }
}
