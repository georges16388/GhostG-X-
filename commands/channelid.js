import send from "../utils/sendMessage.js";

export default async function channelid(client, message) {
    try {
        const jid = message.key.remoteJid;

        // Vérifie si le chat est un channel/chaîne
        if (!jid || !jid.includes("@newsletter")) {
            await send(client, jid, {
                text: "❌ Cette commande fonctionne uniquement dans une chaîne WhatsApp."
            });
            return;
        }

        // Récupère le nom du channel ou pushName si disponible
        const channelName = message.pushName || "Nom non disponible";

        // Envoie les infos du channel avec badge via send()
        await send(client, jid, {
            text: `📢 *CHANNEL INFO*\n\nNom : ${channelName}\nID : ${jid}`
        });

        console.log(`✅ Channel info envoyée pour ${jid}`);

    } catch (err) {
        console.error("❌ Erreur channelid :", err);
        const chatId = message.key.remoteJid || message.chatId;
        await send(client, chatId, {
            text: `❌ Erreur lors de la récupération de l'ID : ${err.message}`
        });
    }
}