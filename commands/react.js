import stylizedChar from "./fancy.js";

export default async function react(client, message, emoji = '🐦‍🔥') {
  try {
    const remoteJid = message.key.remoteJid;

    // 🔹 Réagir au message
    await client.sendMessage(remoteJid, {
      react: { text: emoji, key: message.key }
    });

    console.log(`✅ Réaction envoyée à ${remoteJid} avec ${emoji}`);

  } catch (err) {
    console.error("Impossible d'envoyer la réaction, Maître 👑 :", err);

    // 🔹 Message stylisé alternatif
    if (message.key?.remoteJid) {
      await client.sendMessage(message.key.remoteJid, {
        text: stylizedChar(`❌ Impossible de réagir au message : ${err.message}`)
      });
    }
  }
}