/**
 * Block Command - GhostG-X Edition
 * Bloque silencieusement une entité sur WhatsApp et efface l'invocation
 */

const config = require('../../config'); // Importation de la configuration

// Extraction du préfixe pour l'usage
const prefix = config.prefix || '.';

module.exports = {
  name: 'block',
  aliases: ['bloquer', 'bloque'],
  category: '♛ sᴏᴜᴠᴇʀᴀɪɴᴇᴛᴇ́',
  ownerOnly: true, // Géré par ton handler
  description: '**『 ɢʜᴏsᴛɢ-𝐗 』➪ ʙʟᴏǫᴜᴇ sɪʟᴇɴᴄɪᴇᴜsᴇᴍᴇɴᴛ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴇᴛ ᴇғғᴀᴄᴇ ʟᴀ ᴛʀᴀᴄᴇ**',
  usage: `${prefix}block [@ᴜsᴇʀ | ɴᴜᴍᴇ́ʀᴏ | ᴇɴ ʀᴇ́ᴘᴏɴsᴇ]`,

  async execute(sock, msg, args, extra) {
    const { isOwner } = extra;
    const chatId = msg.key.remoteJid;

    // Sécurité supplémentaire si le handler n'utilise pas 'ownerOnly'
    if (!isOwner) return; // On ne répond même pas si ce n'est pas le maître

    try {
      let target;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // 1. Extraction de la cible via mention
      if (mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } 
      // 2. Extraction de la cible via réponse à un message (quoted)
      else if (ctx && ctx.quotedMessage) {
        target = ctx.participant || ctx.remoteJid;
      } 
      // 3. Extraction de la cible via numéro direct fourni dans les arguments
      else if (args[0]) {
        let cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber.length >= 8) { // Vérification basique de longueur
          target = `${cleanedNumber}@s.whatsapp.net`;
        }
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
        console.error("[block cmd] Erreur lors de la suppression du message :", e);
      }

      // ⚖️ RITUEL DE BLOCAGE SILENCIEUX
      await sock.updateBlockStatus(target, 'block');

    } catch (error) {
      console.error('[block cmd] error:', error);
      // En cas d'erreur critique, on ne fait rien pour ne pas trahir le silence demandé
    }
  }
};
