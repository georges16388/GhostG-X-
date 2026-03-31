/**
 * Prefix Command - GhostG-X Edition
 * Révèle le préfixe actuel du bot (Seul le Suprême Créateur peut l'invoquer)
 */

const config = require('../../config');

module.exports = {
  name: 'prefix',
  aliases: ['ᴘʀᴇғɪx', 'monprefix'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  description: 'ʀᴇ́ᴠᴇ̀ʟᴇ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀᴄᴛᴜᴇʟ ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ',
  usage: '.prefix',
  // On laisse à false pour que la commande puisse écouter même en mode privé (si ton handler le permet)
  ownerOnly: false, 
  
  async execute(sock, msg, args, extra) {
    try {
      // Sécurité absolue : Seul le Suprême Créateur peut forcer le bot à répondre
      const supremeOwner = '22651622652@s.whatsapp.net';
      if (extra.sender !== supremeOwner) {
        // Le bot reste totalement silencieux pour les autres, simulant le mode privé
        return; 
      }

      const currentPrefix = config.prefix || '.';

      await extra.reply(
        `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ •≫━━━╾╮*\n` +
        `*┃ 🔮 ᴘʀᴇ́ғɪxᴇ ᴀᴄᴛᴜᴇʟ : ${currentPrefix}*\n` +
        `*┃ 📜 ᴜsᴀɢᴇ : ${currentPrefix}ᴄᴏᴍᴍᴀɴᴅᴇ*\n` +
    `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
      );
      
    } catch (error) {
      console.error('Prefix command error:', error);
    }
  }
};
