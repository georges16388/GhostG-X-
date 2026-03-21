/**
 * Bot Name Controller - AGM System Identity
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (IDENTITY STYLE) ---
const AGM_NAME = (oldName, newName) => `╭╼━≪• ᴀɢᴍ ɪᴅᴇɴᴛɪᴛʏ •≫━╾╮
┃ ᴏʟᴅ : ${oldName}
┃ ɴᴇᴡ : ${newName} ✨
┃ sᴛᴀᴛᴜs : 🟢 ʀᴇʙʀᴀɴᴅᴇᴅ
>┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗
╰━━━━━━━━━━━━━━━╯`;

module.exports = {
  name: 'setbotname',
  aliases: ['setname', 'botname'],
  category: 'owner',
  description: 'Changer le nom du bot dynamiquement',
  usage: '.setbotname <nom> ou répondre à un texte',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const config = require('../../config');
      let newName = args.join(' ').trim();
      
      // Check si c'est une réponse à un message
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted && !newName) {
        newName = quoted.conversation || quoted.extendedTextMessage?.text || "";
      }
      
      if (!newName) {
        return extra.reply(`📝 *ᴄᴜʀʀᴇɴᴛ ɴᴀᴍᴇ :* ${config.botName}\n\n*ᴜsᴀɢᴇ :* .sᴇᴛɴᴀᴍᴇ <ɴᴏᴜᴠᴇᴀᴜ ɴᴏᴍ>`);
      }

      if (newName.length > 30) return extra.reply('❌ *ɴᴏᴍ ᴛʀᴏᴘ ʟᴏɴɢ (ᴍᴀx 30 ᴄʜᴀʀ).*');

      const oldName = config.botName;
      const configPath = path.join(__dirname, '../../config.js');
      
      // --- MISE À JOUR DU FICHIER CONFIG ---
      let content = fs.readFileSync(configPath, 'utf8');
      const regex = /botName:\s*['"`]([^'"`]*)['"`]/;
      content = content.replace(regex, `botName: '${newName.replace(/'/g, "\\'")}'`);
      
      fs.writeFileSync(configPath, content, 'utf8');
      
      // Update en temps réel + Flush Cache
      config.botName = newName;
      delete require.cache[require.resolve('../../config')];

      await sock.sendMessage(extra.from, { react: { text: '✍️', key: msg.key } });
      await extra.reply(AGM_NAME(oldName, newName));

    } catch (error) {
      console.error('SetName Error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ʀᴇʙʀᴀɴᴅɪɴɢ.*');
    }
  }
};
