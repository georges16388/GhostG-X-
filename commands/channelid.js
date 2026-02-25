import send from "../utils/sendMessage.js";

export default async function channelid(client, message) {
    try {
        const jid = message.key.remoteJid;
        if (!jid) return;

        // Récupération du nom réel du chat / channel
        let channelName = message.pushName || "Nom non disponible";
        try {
            const metadata = await client.groupMetadata(jid); // pour groupes
            if (metadata?.subject) channelName = metadata.subject;
        } catch(e) {
            // pas grave, utiliser pushName
        }

        // Envoi des infos
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