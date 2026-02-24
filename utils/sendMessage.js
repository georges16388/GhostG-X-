import fs from "fs";

export async function send(sock, jid, content = {}, options = {}) {
  try {
    const channelJid = "120363425540434745@newsletter";
    const channelName = "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ";

    // Fusion du contextInfo (important pour ne pas écraser)
    const contextInfo = {
      ...(content.contextInfo || {}),
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelJid,
        newsletterName: channelName,
        serverMessageId: 100,
      },
      forwardingScore: 1,
      isForwarded: true,
    };

    // Construction du message final
    const message = {
      ...content,
      contextInfo,
    };

    // Envoi du message
    const res = await sock.sendMessage(jid, message, options);

    console.log("✅ Message envoyé avec badge !");
    return res;

  } catch (error) {
    console.error("❌ Erreur sendMessage:", error);

    const log = `${new Date().toISOString()} | ${jid} | ${error.message}\n`;
    fs.appendFileSync("send_errors.log", log);

    return null;
  }
}

export default send;