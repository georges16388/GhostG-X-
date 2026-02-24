import fs from "fs";
import path from "path";

async function sendMessage(sock, jid, message) {
  try {
    const imagePath = path.join(__dirname, "..", "media", "menu.png"); // ton menu
    const channelJid = "120363425540434745@newsletter"; // ID de la chaîne
    const channelName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";

    await sock.sendMessage(jid, {
      image: fs.readFileSync(imagePath),
      caption: message, // texte du menu
      contextInfo: {
        // Badge "newsletter"
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelJid,
          newsletterName: channelName,
          serverMessageId: 100,
        },
        // Badge "transféré plusieurs fois"
        forwardingScore: 1,
        isForwarded: true,
      },
    });

    console.log("✅ Menu envoyé avec badge de chaîne !");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi:", error.message);
    const logEntry = `${new Date().toISOString()} - JID: ${jid} - Erreur: ${error.message}\n`;
    fs.appendFileSync("erreurs_baileys.txt", logEntry);
    return { success: false, error: error.message };
  }
}

export default sendMessage;