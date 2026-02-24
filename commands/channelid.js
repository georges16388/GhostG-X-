import send from "../utils/sendMessage.js";
export default async function channelid(client, message) {
    try {
        // Récupère le chat/jid
        const jid = message.key.remoteJid;

        // Vérifie si c'est bien une chaîne
        if (!jid || !jid.includes("@newsletter")) {
            return await client.sendMessage(jid, {
                text: "❌ Cette commande fonctionne uniquement dans une chaîne WhatsApp."
            }, { quoted: message });
        }

        // Le channel ID c'est juste le JID
        const channelId = jid;

        // Récupération du nom de la chaîne si possible
        const channelName = message.pushName || "Nom non disponible";

        await client.sendMessage(jid, {
            text: `📢 *CHANNEL INFO*\n\nNom : ${channelName}\nID : ${channelId}`
        }, { quoted: message });

        console.log(`✅ Channel info envoyée pour ${channelId}`);

    } catch (err) {
        console.error("❌ Erreur channelid :", err);
        const chatId = message.key.remoteJid || message.chatId;
        await client.sendMessage(chatId, {
            text: "❌ Erreur lors de la récupération de l'ID."
        });
    }
}