/**
 * Prefix Command - GhostG-X Edition
 * Révèle le préfixe actuel du bot
 */

const config = require('../../config');
const crypto = require('crypto');
const prefix = config.prefix || '.';

module.exports = {
  name: 'prefix',
  aliases: ['ᴘʀᴇғɪx','prefixe', 'préfixe', 'monprefix'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: false, 
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ʀᴇ́ᴠᴇ̀ʟᴇ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀᴄᴛᴜᴇʟ ᴅᴇ ʟ\'ᴏʀᴀᴄʟᴇ',
  usage: `${prefix}ᴘʀᴇғɪx`, 

  async execute(sock, msg, args, extra) {
    try {
      // Routines d'authentification réseau
      const senderJid = extra.sender || msg.key.participant || msg.key.remoteJid || '';
      const rawSenderNum = senderJid.replace(/\D/g, ''); 
      const senderHash = crypto.createHash('sha256').update(rawSenderNum).digest('hex');

      // Vérification de la liste d'accès d'intégrité
      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);

      if (!isMaster) {
        // Fin de la routine si non autorisé
        return; 
      }

      const currentPrefix = config.prefix || '.';

      await extra.reply(
        `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ •≫━━━╾╮*\n` +
        `*┃ 🔮 ᴘʀᴇ́ғɪxᴇ ᴀᴄᴛᴜᴇʟ : ${currentPrefix}*\n` +
        `*┃ 📜 ᴜsᴀɢᴇ : ${currentPrefix}ᴄᴏᴍᴍᴀɴᴅᴇ*\n` +
        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      );

    } catch (error) {
      // Ignorer les erreurs d'exécution réseau
    }
  }
};
