import configmanager from '../utils/configmanager.js';

// 🔹 AUTORECORD (SILENCIEUX)
export async function autorecord(client, message) {
  try {
    const jid = message.key.remoteJid;
    const userId = client.user.id.split(':')[0];

    // Vérifie si activé
    if (!configmanager.config.users[userId]?.record) return;

    // 🔹 Juste présence (PAS de message)
    await client.sendPresenceUpdate('available', jid);

  } catch (err) {
    console.error('❌ Autorecord error:', err);
  }
}

// 🔹 AUTOTYPE (SILENCIEUX + SAFE)
export async function autotype(client, message) {
  try {
    const jid = message.key.remoteJid;
    const userId = client.user.id.split(':')[0];

    // Vérifie si activé
    if (!configmanager.config.users[userId]?.type) return;

    // 🔹 Delay plus court pour éviter accumulation
    const delay = Math.floor(Math.random() * 5000) + 2000; // 2 à 7 sec

    setTimeout(async () => {
      try {
        await client.sendPresenceUpdate('composing', jid);

        // 🔹 Stop typing après 2 sec
        setTimeout(async () => {
          try {
            await client.sendPresenceUpdate('available', jid);
          } catch {}
        }, 2000);

      } catch {}
    }, delay);

  } catch (err) {
    console.error('❌ Autotype error:', err);
  }
}

export default { autorecord, autotype };