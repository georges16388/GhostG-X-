// fichier: commands/dlt.js
import sender from "../commands/sender.js";
import 'dotenv/config'; // Charge les variables .env automatiquement

const PREFIX = process.env.PREFIX || "!";

async function dlt(client, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.quotedMessage) {
            await sender(message, client, "❌ Veuillez répondre à un message pour le supprimer.");
            return;
        }

        const chatId = message.key.remoteJid;
        const quotedMessageKey = quoted.stanzaId || quoted.id;
        const quotedSender = quoted.participant;
        const isFromBot = quotedSender === client.user.id || quotedSender?.includes(client.user.id);

        if (!quotedMessageKey || !chatId) {
            await sender(message, client, "❌ Impossible de trouver le message à supprimer.");
            return;
        }

        console.log(`🗑 Tentative de suppression du message ID: ${quotedMessageKey} dans ${chatId}`);

        // Suppression pour tous si possible
        try {
            await client.sendMessage(chatId, {
                delete: { remoteJid: chatId, id: quotedMessageKey, fromMe: isFromBot }
            });
            console.log("✅ Message supprimé avec succès !");
            await sender(message, client, "✅ Message supprimé avec succès !");
        } catch (error) {
            console.error("❌ Échec de la suppression :", error);
            await sender(message, client, "⚠️ Impossible de supprimer le message pour tous.");
        }

    } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        await sender(message, client, "❌ Une erreur est survenue lors de la suppression du message.");
    }
}

// Export avec le prefix pour l'utiliser directement dans ton gestionnaire
export default { command: `${PREFIX}dlt`, handler: dlt };