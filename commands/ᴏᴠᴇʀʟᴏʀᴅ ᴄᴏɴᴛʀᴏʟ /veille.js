/**
 * Ghost Mode - Mute the bot in a specific group
 * GhostG-X Edition
 * SÉCURITÉ ABSOLUE : Seuls les hashes maîtres peuvent l'évoquer.
 */

const database = require('../../database');
const config = require('../../config.js');
const crypto = require('crypto');

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

module.exports = {
  name: 'muteghost',
  aliases: ['mutebot', 'veille'],
  category: '♕ ᴏᴠᴇʀʟᴏʀᴅ ᴄᴏɴᴛʀᴏʟ',
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴘʟᴏɴɢᴇ ʟᴇ ʙᴏᴛ ᴅᴀɴs ᴜɴ sɪʟᴇɴᴄᴇ ᴛᴏᴛᴀʟ sᴜʀ ᴄᴇ ᴄʜᴀᴛ',
  usage: '.ghost on/off',
  groupOnly: true,
  adminOnly: false,
  botAdminNeeded: false,

  async execute(sock, msg, args, extra) {
    const { reply } = extra;
    const chatId = msg.key.remoteJid;

    try {
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.replace(/\D/g, '');
      const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');

      // 🛡️ AUTHENTIFICATION MAÎTRE UNIQUEMENT
      const isMaster = config.supremeHashes && config.supremeHashes.includes(senderHash);
      
      if (!isMaster) {
        // Le bot ignore l'appelant pour rester discret
        return; 
      }

      if (!args[0]) {
        const settings = database.getGroupSettings(chatId);
        const status = settings.isMuted ? '💤 *sɪʟᴇɴᴄɪᴇᴜx (ᴏɴ)*' : '🔊 *ᴀᴄᴛɪғ (ᴏғғ)*';

        return reply(
          `*╭╼━━━≪• ᴇ́ᴛᴀᴛ ᴅᴜ sᴘᴇᴄᴛʀᴇ •≫━━━╾╮*\n` +
          `*┃* *sᴛᴀᴛᴜᴛ* : ${status}\n\n` +
          `*┃* 🔮 *${toSmallCaps('incantations disponibles')} :*\n` +
          `*┃* *${toSmallCaps('cet arcane plonge le bot dans')}\n*┃* *${toSmallCaps('le neant sur ce groupe uniquement')}.*\n\n` +
          `  .ghost on\n` +
          `  .ghost off\n\n` +
          `> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`
        );
      }

      const action = args[0].toLowerCase();

      // Activation du mode Ghost
      if (action === 'on') {
        database.updateGroupSettings(chatId, { isMuted: true });
        
        // Supprime ta commande pour ne pas laisser de traces !
        try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}

        // Envoi d'une confirmation uniquement à TOI en DM pour confirmer le silence
        const cleanTarget = `${senderNumber}@s.whatsapp.net`;
        return await sock.sendMessage(cleanTarget, { 
          text: `*🔇 GhostG-X est désormais muet sur le groupe :* ${chatId}` 
        });
      }

      // Désactivation du mode Ghost
      if (action === 'off') {
        database.updateGroupSettings(chatId, { isMuted: false });
        
        return reply(`*🔊 ${toSmallCaps('ghostg-x s'est eveille et sort du neant')} !*\n\n> *♰ ᴇ́ᴛᴀʙʟɪ ᴘᴀʀ ɢʜᴏsᴛɢ-𝐗 ♰*`);
      }

    } catch (error) {
      console.error('Ghost command error:', error);
    }
  }
};
