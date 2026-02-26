// utils/react.js
import send from "./sendMessage.js";

export default async function react(client, message) {
    const jid = message?.key?.remoteJid;
    if (!jid) return;

    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const ghostEmojis = ['👻', '🔥']; // Cycle Ghost

    try {
        // Boucle sur les emojis avec délai
        for (const emoji of ghostEmojis) {
            await client.sendMessage(jid, {
                react: { text: emoji, key: message.key }
            });
            await sleep(300); // 0.3s entre chaque reaction
        }

        // Retirer la dernière réaction
        await sleep(300);
        await client.sendMessage(jid, {
            react: { remove: true, key: message.key }
        });

    } catch (err) {
        console.error('❌ GHOST REACT ERROR :', err);
    }
}