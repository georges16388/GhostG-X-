/**
 * Bot Prefix Controller - AGM System Core
 * Style by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const fs = require('fs');
const path = require('path');

// --- FONCTION DE DESIGN AGM (CORE STYLE) ---
const AGM_CORE = (oldP, newP, type) => `╭╼━≪• ᴀɢᴍ sʏsᴛᴇᴍ ᴄᴏʀᴇ •≫━╾╮
┃ sᴛᴀᴛᴜs : 🟢 ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ
┃ ᴛʏᴘᴇ : ${type.toUpperCase()} ⚡
┃ ᴏʟᴅ : [ ${oldP} ]
┃ ɴᴇᴡ : [ ${newP} ]
╰━━━━━━━━━━━━━━━╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏsᴛɢ 𝐗`;

module.exports = {
  name: 'setprefix',
  aliases: ['prefix', 'setpref'],
  category: 'owner',
  description: 'Changer le préfixe (Texte ou Sticker)',
  usage: '.setprefix <symbole> ou répondre à un sticker',
  ownerOnly: true,
  
  async execute(sock, msg, args, extra) {
    try {
      const config = require('../../config');
      let newPrefix = args[0];
      let isSticker = false;

      // 1. Détection si c'est une réponse à un sticker
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted?.stickerMessage) {
        // On utilise le fileSha256 (identifiant unique du sticker) comme préfixe
        newPrefix = quoted.stickerMessage.fileSha256.toString('base64');
        isSticker = true;
      }

      if (!newPrefix) {
        return extra.reply(`📌 *ᴄᴜʀʀᴇɴᴛ ᴘʀᴇғɪx :* [ ${config.prefix} ]\n\n*ᴜsᴀɢᴇ :* .sᴇᴛᴘʀᴇғɪx <sʏᴍʙᴏʟᴇ> ᴏᴜ ʀéᴘᴏɴᴅʀᴇ à ᴜɴ sᴛɪᴄᴋᴇʀ.`);
      }

      const oldPrefix = config.prefix;
      const configPath = path.join(__dirname, '../../config.js');
      
      // 2. Mise à jour du fichier config.js
      let content = fs.readFileSync(configPath, 'utf8');
      // On gère les guillemets simples ou doubles dans la config
      const regex = /prefix:\s*['"`]([^'"`]*)['"`]/;
      content = content.replace(regex, `prefix: '${newPrefix}'`);
      
      fs.writeFileSync(configPath, content, 'utf8');

      // 3. Update en temps réel et Flush Cache
      config.prefix = newPrefix;
      delete require.cache[require.resolve('../../config')];

      await sock.sendMessage(extra.from, { react: { text: '⚙️', key: msg.key } });
      
      const displayPrefix = isSticker ? "Sᴛɪᴄᴋᴇʀ-ID" : newPrefix;
      await extra.reply(AGM_CORE(oldPrefix, displayPrefix, isSticker ? 'sticker' : 'text'));

    } catch (error) {
      console.error('Prefix Error:', error);
      await extra.reply('❌ *ᴇʀʀᴇᴜʀ ʟᴏʀs ᴅᴜ ᴄʜᴀɴɢᴇᴍᴇɴᴛ ᴅᴇ ᴘʀᴇғɪxᴇ.*');
    }
  }
};
