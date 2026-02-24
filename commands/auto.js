import configmanager from '../utils/configmanager.js';
import send from "../utils/sendMessage.js"; // 🔹 ton send uniforme

export async function autorecord(client, message) {
  try {
    const jid = message.key.remoteJid;
    const userId = client.user.id.split(':')[0];

    if (!configmanager.config.users[userId]?.record) return;

    // 🔹 Juste en ligne au lieu de recording
    await client.sendPresenceUpdate('available', jid);

    // 🔹 Envoi d’un message informatif
    await send(client, jid, { text: "🎙️ Mode enregistrement automatique activé (juste en ligne)." });

  } catch (err) {
    console.error('❌ Autorecord error:', err);
    await send(client, message.key.remoteJid, { text: `❌ Erreur autorecord : ${err.message}` });
  }
}

export async function autotype(client, message) {
  try {
    const jid = message.key.remoteJid;
    const userId = client.user.id.split(':')[0];

    if (!configmanager.config.users[userId]?.type) return;

    // 🔹 Delay aléatoire 30-45 secondes avant typing
    const delay = Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;

    setTimeout(async () => {
      await client.sendPresenceUpdate('composing', jid);

      // 🔹 Message informatif via send()
      await send(client, jid, { text: "⌨️ Le bot est en train de taper..." });

      // 🔹 Revenir en ligne après 3 secondes
      setTimeout(async () => {
        await client.sendPresenceUpdate('available', jid);
        await send(client, jid, { text: "✅ Le bot a fini de taper." });
      }, 3000);

    }, delay);

  } catch (err) {
    console.error('❌ Autotype error:', err);
    await send(client, message.key.remoteJid, { text: `❌ Erreur autotype : ${err.message}` });
  }
}

export default { autorecord, autotype };