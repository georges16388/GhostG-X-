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
  description: '『 ɢʜᴏsᴛɢ-𝐗 』➪ ʙʟᴏǫᴜᴇ sɪʟᴇɴᴄɪᴇᴜsᴇᴍᴇɴᴛ ᴜɴ ᴜᴛɪʟɪsᴀᴛᴇᴜʀ ᴇᴛ ᴇғғᴀᴄᴇ ʟᴀ ᴛʀᴀᴄᴇ',
  usage: `${prefix}block [@ᴜsᴇʀ | ɴᴜᴍᴇ́ʀᴏ | ᴇɴ ʀᴇ́ᴘᴏɴsᴇ]`,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    // 👑 Tes numéros de Maîtres Suprêmes en clair
    const supremeOwners = ['22651622652', '22665108174'];

    // Récupération de l'expéditeur et formatage
    const senderNumber = extra.sender.replace(/\D/g, ''); 
    const isMaster = supremeOwners.includes(senderNumber);

    const botId = sock.user.id.split(':')[0].replace(/\D/g, '');

    // Seuls les Maîtres Suprêmes ou le bot lui-même peuvent exécuter cette sentence
    if (!isMaster && senderNumber !== botId) return; 

    let target;

    try {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = ctx?.mentionedJid || [];

      // 1. Priorité absolue : Extraction de la cible via numéro direct fourni dans les arguments
      if (args[0]) {
        let cleanedNumber = args[0].replace(/[^0-9]/g, '');
        if (cleanedNumber.length >= 8) { 
          target = `${cleanedNumber}@s.whatsapp.net`;
        }
      }

      // 2. Extraction de la cible via mention (si pas de numéro fourni)
      if (!target && mentioned && mentioned.length > 0) {
        target = mentioned[0];
      } 

      // 3. Extraction de la cible via réponse à un message (quoted)
      if (!target && ctx && ctx.quotedMessage) {
        target = ctx.participant || (isGroup ? null : chatId);
      }

      // Si aucune cible n'est trouvée, on s'arrête là
      if (!target) return;

      // 🛡️ Vérification d'immunité absolue (Impossible de te bloquer toi-même ou le bot)
      const cleanTarget = target.replace(/\D/g, '');
      if (supremeOwners.includes(cleanTarget) || cleanTarget === botId) {
        return; // Échec silencieux, aucune sanction appliquée aux dieux
      }

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

      // ⚖️ RITUEL DE BLOCAGE SILENCIEUX (Au niveau du compte WhatsApp)
      await sock.updateBlockStatus(target, 'block');

      // 📝 RÉCUPÉRATION DE TON JID (Depuis ton .env ou par défaut ton numéro)
      let targetOwner = '';
      if (config.ownerNumber && config.ownerNumber.length > 0) {
        const rawNum = String(config.ownerNumber[0]).replace(/\D/g, '');
        targetOwner = `${rawNum}@s.whatsapp.net`;
      }

      if (!targetOwner || targetOwner === '@s.whatsapp.net') {
        targetOwner = '22651622652@s.whatsapp.net';
      }

      const targetNumber = target.split('@')[0];
      
      // Envoi du rapport d'exécution dans ton inbox en mode Broadcast Natif
      try {
        await sock.sendMessage(targetOwner, {
          text: `*⚖️ [GHOSTG-X] L'entité @${targetNumber} a été bloquée avec succès.*`,
          mentions: [target]
        }, {
          messageId: sock.generateMessageID(),
          options: { broadcast: true } // S'affiche dans ton inbox sans polluer ton flux
        });
      } catch (e) {
        console.error(`Impossible d'envoyer le rapport de blocage à l'owner.`);
      }

    } catch (error) {
      console.error('[block cmd] error:', error);

      // 📝 RAPPORT D'ÉCHEC
      if (target) {
        let targetOwner = '22651622652@s.whatsapp.net';
        if (config.ownerNumber && config.ownerNumber.length > 0) {
          const rawNum = String(config.ownerNumber[0]).replace(/\D/g, '');
          targetOwner = `${rawNum}@s.whatsapp.net`;
        }

        const targetNumber = target.split('@')[0];

        try {
          await sock.sendMessage(targetOwner, {
            text: `*〆 [GHOSTG-X] Échec du rituel de blocage pour l'entité @${targetNumber}.*\n*Erreur :* ${error.message}`,
            mentions: [target]
          }, {
            messageId: sock.generateMessageID(),
            options: { broadcast: true }
          });
        } catch (e) {
          // Échec silencieux
        }
      }
    }
  }
};
