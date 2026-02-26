
// auto.js
import configmanager from '../utils/configmanager.js';

// 🔹 ACTIVE/DÉSACTIVE AUTORECORD POUR LE BOT
export async function setAutorecord(botId, state) {
    const value = state === 'on' ? true : false;
    configmanager.setUser(botId, { record: value });
    return `⚡ Autorecord est maintenant ${value ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`;
}

// 🔹 ACTIVE/DÉSACTIVE AUTOTYPE POUR LE BOT
export async function setAutotype(botId, state) {
    const value = state === 'on' ? true : false;
    configmanager.setUser(botId, { type: value });
    return `⚡ Autotype est maintenant ${value ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`;
}

// 🔹 FONCTION AUTORECORD (SILENCIEUX)
export async function autorecord(client, message) {
    try {
        const jid = message.key.remoteJid;
        const botId = client.user.id.split(':')[0];

        // Si pas activé → return
        if (!configmanager.config.users[botId]?.record) return;

        // Juste présence (PAS de message)
        await client.sendPresenceUpdate('available', jid);

    } catch (err) {
        console.error('❌ Autorecord error:', err);
    }
}

// 🔹 FONCTION AUTOTYPE (SILENCIEUX + SAFE)
export async function autotype(client, message) {
    try {
        const jid = message.key.remoteJid;
        const botId = client.user.id.split(':')[0];

        // Si pas activé → return
        if (!configmanager.config.users[botId]?.type) return;

        // Delay aléatoire pour éviter accumulation
        const delay = Math.floor(Math.random() * 5000) + 2000; // 2 à 7 sec
        setTimeout(async () => {
            try {
                await client.sendPresenceUpdate('composing', jid);

                // Stop typing après 2 sec
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

export default {
    setAutorecord,
    setAutotype,
    autorecord,
    autotype
};