export default async function react(client, message, emoji = '🐦‍🔥') {
  try {
    const remoteJid = message.key.remoteJid;

    // 🔹 Réagir au message
    await client.sendMessage(remoteJid, {
      react: {
        text: emoji,
        key: message.key
      }
    });

    // 🔹 Optionnel : petit log dans la console pour debug
    console.log(`✅ Réaction envoyée à ${remoteJid} avec ${emoji}`);

  } catch (err) {
    console.error("Impossible d'envoyer la réaction, Maître 👑 :", err);

    // 🔹 Envoyer un message alternatif si la réaction échoue
    if (message.key?.remoteJid) {
      await client.sendMessage(message.key.remoteJid, {
        text: ` Impossible de réagir au message, Maître 👑 : ${err.message}`
      });
    }
  }
}