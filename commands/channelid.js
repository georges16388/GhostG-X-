import send from "../utils/sendMessage.js";

export default async function channelid(client, message) {
    try {
        let jid = message.key.remoteJid;

        if (!jid) return;

        // 🔥 Si c'est un channel WhatsApp
        const isChannel = jid.includes("@newsletter");

        if (!isChannel) {
            await send(client, jid, {
                text: "❌ Cette commande fonctionne uniquement dans une chaîne WhatsApp."
            });
            return;
        }

        // 🔥 Nom du channel
        let channelName = "Nom non disponible";

        try {
            // Certaines versions de Baileys permettent ça
            const metadata = await client.newsletterMetadata(jid);
            if (metadata?.name) {
                channelName = metadata.name;
            }
        } catch (e) {
            // fallback
            channelName = message.pushName || "Nom non disponible";
        }

        // 🔥 Résultat
        await send(client, jid, {
            text: `📢 *CHANNEL INFO*\n\nNom : ${channelName}\nID : ${jid}`
        });

        console.log(`✅ Channel info envoyée pour ${jid}`);

    } catch (err) {
        console.error("❌ Erreur channelid :", err);

        await send(client, message.key.remoteJid, {
            text: `❌ Erreur : ${err.message}`
        });
    }
}