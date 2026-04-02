/**
 * Prefix Command - GhostG-X Edition
 * Révèle le préfixe actuel de l'Oracle (Seul le Suprême Créateur peut l'invoquer)
 * Répond PARTOUT (Groupes, DM) même si le mode Privé du domaine est activé.
 */

const config = require('../../config');
const prefix = config.prefix || '.';

module.exports = {
  name: 'prefix',
  aliases: ['ᴘʀᴇғɪx','prefixe', 'préfixe', 'monprefix'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: false, // On laisse à false pour forcer l'écoute manuelle du handler
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ʀᴇ́ᴠᴇ̀ʟᴇ ʟᴇ sɪɢɴᴇ ᴅ\'ɪɴᴠᴏᴄᴀᴛɪᴏɴ ᴀᴄᴛᴜᴇʟ ᴅᴇ ʟ\'ᴏʀᴀᴄʟᴇ',
  usage: `${prefix}ᴘʀᴇғɪx`, 

  async execute(sock, msg, args, extra) {
    try {
      // SÉCURITÉ ABSOLUE : Seul le Suprême Créateur peut forcer l'Oracle à répondre
      const supremeOwners = ['22651622652', '22665107481']; // Utilisation des chiffres purs (Anti-masque LID)
      const senderJid = extra.sender || msg.key.participant || msg.key.remoteJid || '';

      if (!senderJid.includes(supremeOwner)) {
        // L'Oracle reste totalement sourd et silencieux pour les autres
        return; 
      }

      // Récupération dynamique du préfixe configuré sur CE bot précis
      const currentPrefix = config.prefix || '.';

      await extra.reply(
        `*╭╼━━━≪• ᴀʀᴄᴀɴᴇs ᴅᴜ sᴀɴᴄᴛᴜᴀɪʀᴇ •≫━━━╾╮*\n` +
        `*┃ 🔮 ᴘʀᴇ́ғɪxᴇ ᴀᴄᴛᴜᴇʟ : ${currentPrefix}*\n` +
        `*┃ 📜 ᴜsᴀɢᴇ : ${currentPrefix}ᴄᴏᴍᴍᴀɴᴅᴇ*\n` +
        `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n\n` +
        `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
      );

    } catch (error) {
      console.error('Prefix command error:', error);
    }
  }
};
