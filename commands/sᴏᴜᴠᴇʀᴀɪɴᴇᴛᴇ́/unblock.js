/**
 * Unblock Command - GhostG-X Edition
 * Débloque silencieusement une entité sur WhatsApp et efface l'invocation
 */

const config = require('../../config'); // Importation de la configuration

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'unblock',
  aliases: ['debloquer', 'debloque', 'deblock'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ᴅᴇ́ʙʟᴏǫᴜᴇ sɪʟᴇɴᴄɪᴇᴜsᴇᴍᴇɴᴛ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴇᴛ ᴇғғᴀᴄᴇ ʟᴀ ᴛʀᴀᴄᴇ',
  usage: `${prefix}unblock [@ᴜsᴇʀ | ɴᴜᴍᴇ́ʀᴏ | ᴇɴ ʀᴇ́ᴘᴏɴsᴇ]`,

  async execute(sock, msg, args, extra) {
    const { isOwner } = extra;
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    
    // Définition du Suprême (C'est à ce JID qu'on enverra le rapport secret)
    const supremeOwnerJid = '22651622652@s.whatsapp.net';

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return; // On ne répond même pas si ce n'est pas le maître

    let target;

    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // 1. Priorité absolue : Extraction de la cible via numéro direct fourni dans les arguments
      if (args[0]) {
        let cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber.length >= 8) { // Vérification basique de longueur de numéro
          target = `${cleanedNumber}@s.whatsapp.net`;
        }
      }

      // 2. Extraction de la cible via mention (si pas de numéro fourni)
      if (!target && mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } 
      
      // 3. Extraction de la cible via réponse à un message (quoted)
      if (!target && ctx && ctx.quotedMessage) {
        // En groupe, l'auteur du message cité est dans ctx.participant
        // En DM privé, si participant n'est pas là, c'est obligatoirement l'interlocuteur (chatId)
        target = ctx.participant || (isGroup ? null : chatId);
      }

      // Si aucune cible n'est trouvée, on s'arrête là (et on ne supprime pas pour t'alerter)
      if (!target) return;

      // 💥 SUPPRESSION DE LA COMMANDE POUR RESTER INVISIBLE
      try {
        await sock.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: msg.key.fromMe,
            id: msg.key.id,
            participant: msg.key.participant || msg.key.remoteJid
          }
        });
      } catch (e) {
        console.error("[unblock cmd] Erreur lors de la suppression du message :", e);
      }

      // ⚖️ RITUEL DE DÉBLOCAGE SILENCIEUX (Au niveau du compte WhatsApp)
      await sock.updateBlockStatus(target, 'unblock');

      // 📝 RAPPORT DE SUCCÈS AU OWNER (En privé)
      const targetNumber = target.split('@')[0];
      await sock.sendMessage(supremeOwnerJid, {
        text: `*✅ [GHOSTG-X] L'entité @${targetNumber} a été débloquée avec succès.*`,
        mentions: [target]
      });

    } catch (error) {
      console.error('[unblock cmd] error:', error);
      
      // 📝 RAPPORT D'ÉCHEC AU OWNER (En privé)
      if (target) {
        const targetNumber = target.split('@')[0];
        await sock.sendMessage(supremeOwnerJid, {
          text: `*〆 [GHOSTG-X] Échec du rituel de déblocage pour l'entité @${targetNumber}.*\n*Erreur :* ${error.message}`,
          mentions: [target]
        });
      }
    }
  }
};
