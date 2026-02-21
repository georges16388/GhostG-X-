export default async function react(client, message) {
    const remoteJid = message?.key.remoteJid;
    if (!remoteJid) return;

    const emojis = ['🎯', '⚡', '🔥', '✨', '💀','✝️']; // Ajoute autant d'emojis que tu veux
    const delay = 1000; // Pause entre chaque réaction en ms

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Enchaîne les réactions
    for (const emoji of emojis) {
        await client.sendMessage(remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
        await sleep(delay);
    }

    // Supprime la réaction après la boucle
    await client.sendMessage(remoteJid, {
        react: {
            remove: true,
            key: message.key
        }
    });
}