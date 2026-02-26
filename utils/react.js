export default async function react(client, message) {
    const remoteJid = message?.key?.remoteJid;
    if (!remoteJid) return;

    // Fonction pause
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Emojis du cycle Ghost
    const ghostEmojis = ['👻', '🔥', '🌑', '⚡', '💀'];

    try {
        // Boucle sur les emojis avec délai
        for (const emoji of ghostEmojis) {
            await client.sendMessage(remoteJid, {
                react: { text: emoji, key: message.key }
            });
            await sleep(1000); // 1 seconde entre chaque reaction
        }

        // Retire la dernière réaction après un délai
        await sleep(300);
        await client.sendMessage(remoteJid, {
            react: { remove: true, key: message.key }
        });

    } catch (err) {
        console.error('❌ Ghost react error:', err);
    }
}