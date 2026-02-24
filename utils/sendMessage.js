// sendMessage.js
const fs = require("fs");
const path = require("path");

/**
 * Envoie un message (texte ou image) avec badge de chaîne type newsletter
 * @param {Object} sock - instance Baileys
 * @param {string} jid - destinataire
 * @param {string} message - texte du message
 * @param {string|null} imagePath - chemin de l'image (optionnel)
 */
async function sendMessage(sock, jid, message, imagePath = null) {
  try {
    const channelJid = "120363425540434745@newsletter";
    const channelName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";
    const showForwardedBadge = true;

    if (imagePath) {
      // envoi avec image + caption
      await sock.sendMessage(jid, {
        image: { url: imagePath },
        caption: message,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: channelName,
            serverMessageId: 100,
          },
          ...(showForwardedBadge && { forwardingScore: 1, isForwarded: true }),
        },
      });
    } else {
      // envoi texte simple
      await sock.sendMessage(jid, {
        text: message,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: channelName,
            serverMessageId: 100,
          },
          ...(showForwardedBadge && { forwardingScore: 1, isForwarded: true }),
        },
      });
    }

    console.log("✅ Message avec badge de chaîne envoyé !");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi:", error.message);
    const logEntry = `${new Date().toISOString()} - JID: ${jid} - Erreur: ${error.message}\n`;
    fs.appendFileSync("erreurs_baileys.txt", logEntry);
    return { success: false, error: error.message };
  }
}

// Au lieu de module.exports = sendMessage;
export default sendMessage;