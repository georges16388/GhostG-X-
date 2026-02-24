export default async function channelid(client, message) {
    try {
        const jid = message.key.remoteJid;

        // Vérifie si c'est une chaîne
        if (!jid.includes("@newsletter")) {
            return await client.sendMessage(jid, {
                text: "❌ Cette commande fonctionne uniquement dans une chaîne WhatsApp."
            }, { quoted: message });
        }

        // Extraire ID
        const channelId = jid;

        await client.sendMessage(jid, {
            text: `📢 *CHANNEL ID*

${channelId}`
        }, { quoted: message });

    } catch (err) {
        console.error(err);
        await client.sendMessage(message.key.remoteJid, {
            text: "❌ Erreur lors de la récupération de l'ID."
        });
    }
}