/**
 * Erreur Command - GhostG-X Edition
 * Supprime un de tes propres messages auquel tu as répondu
 */

const config = require('../../config.js');

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'erreur',
  aliases: ['er', 'error'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Sécurité : Toi seul peux l'utiliser
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ sᴜᴘᴘʀɪᴍᴇ ᴜɴ ᴅᴇ ᴛᴇs ᴘʀᴏᴘʀᴇs ᴍᴇssᴀɢᴇs ᴇɴ ʏ ʀᴇ́ᴘᴏɴᴅᴀɴᴛ**',
  usage: `${prefix}erreur (ᴇɴ ʀᴇ́ᴘᴏɴᴅᴀɴᴛ ᴀ̀ ᴛᴏɴ ᴘʀᴏᴘʀᴇ ᴍᴇssᴀɢᴇ)`,

  async execute(sock, msg, args, extra) {
    const { from, reply, react, isOwner } = extra;

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return reply('*〆 ᴀᴄᴄᴇ̀s ʀᴇғᴜsᴇ́. sᴇᴜʟ ʟᴇ ᴍᴀɪ̂ᴛʀᴇ ᴘᴇᴜᴛ ᴍᴀɴɪᴇʀ ʟᴀ ɢᴏᴍᴍᴇ ᴅᴜ sᴘᴀᴛɪᴏ-ᴛᴇᴍᴘᴏʀᴇʟ.*');

    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      // Vérification si on a bien répondu à un message
      if (!ctx?.stanzaId) {
        return reply(
          `╭╼━≪• *💥 ᴇᴠᴀᴘᴏʀᴀᴛɪᴏɴ_ɪᴍᴍᴇᴅɪᴀᴛᴇ* •≫━╾╮\n` +
          `┃ *ᴇ́ᴛᴀᴛ* : ᴇ́ᴄʜᴇᴄ ❌\n` +
          `╰━━━━━━━━━━━━━━━╯\n\n` +
          `*🔮 ɪɴᴄᴀɴᴛᴀᴛɪᴏɴ :*\n` +
          `*ʀᴇ́ᴘᴏɴᴅs ᴀ̀ ᴛᴏɴ ᴘʀᴏᴘʀᴇ ᴍᴇssᴀɢᴇ ǫᴜᴇ ᴛᴜ sᴏᴜʜᴀɪᴛᴇs ᴇғғᴀᴄᴇʀ.*\n\n` +
          `  ${prefix}erreur\n\n` +
          `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        );
      }

      const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      // On récupère le JID de la personne qui a écrit le message cité
      const quotedParticipant = ctx.participant || ctx.remoteJid;

      // SÉCURITÉ : On vérifie si le message cité vient bien de TOI ou du BOT lui-même
      const isFromMe = quotedParticipant.includes(botJid) || msg.key.fromMe;

      if (!isFromMe) {
        return reply(`⚠️ *ᴄᴇ ᴍᴇssᴀɢᴇ ɴᴇ ᴛ'ᴀᴘᴘᴀʀᴛɪᴇɴᴛ ᴘᴀs. ᴜᴛɪʟɪsᴇ ʟᴀ ᴄᴏᴍᴍᴀɴᴅᴇ ${prefix}ᴅᴇʟᴇᴛᴇ ᴘᴏᴜʀ ʟᴇs ᴍᴇssᴀɢᴇs ᴅᴇs ᴀᴜᴛʀᴇs.*`);
      }

      // 1. Clé pour supprimer TON message cité
      const deleteTargetKey = { 
        remoteJid: from, 
        id: ctx.stanzaId, 
        fromMe: true // INDISPENSABLE pour supprimer ses propres messages
      };

      // Si c'est un groupe, Baileys a parfois besoin du participant original
      if (from.endsWith('@g.us')) {
        deleteTargetKey.participant = quotedParticipant;
      }

      // 2. Clé pour supprimer le message de commande actuel (.erreur)
      const deleteCommandKey = {
        remoteJid: from,
        id: msg.key.id,
        fromMe: true
      };

      await react('🪄'); // Petit effet magique

      // On exécute les deux suppressions
      await sock.sendMessage(from, { delete: deleteTargetKey });
      await sock.sendMessage(from, { delete: deleteCommandKey });

    } catch (error) {
      console.error('Erreur command error:', error);
      await reply(`❌ *ᴇʀʀᴇᴜʀ : ɪᴍᴘᴏssɪʙʟᴇ ᴅᴇ ғᴀɪʀᴇ ᴅɪsᴘᴀʀᴀɪ̂ᴛʀᴇ ᴄᴇ ᴍᴇssᴀɢᴇ.*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`);
    }
  }
};
