import fs from "fs";
import path from "path";

export default async function sendMessage(sock, jid, message, imagePath = null) {
  try {
    const channelJid = "120363425540434745@newsletter";
    const channelName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";
    const showForwardedBadge = true;

    if (imagePath) {
      // Si imagePath est fourni, envoi avec image + caption
      await sock.sendMessage(jid, {
        image: { url: imagePath },
        caption: message,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: channelName,
            serverMessageId: 100,
          },
          ...(showForwardedBadge && {
            forwardingScore: 1,
            isForwarded: true,
          }),
        },
      });
    } else {
      // Sinon envoi texte simple
      await sock.sendMessage(jid, {
        text: message,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: channelName,
            serverMessageId: 100,
          },
          ...(showForwardedBadge && {
            forwardingScore: 1,
            isForwarded: true,
          }),
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