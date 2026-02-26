import send from "../utils/sendMessage.js";
import react from "../utils/react.js";
import stylizedChar from "../utils/fancy.js";

const OWNER_NUMBER = '22677487520@s.whatsapp.net'; // remplace par ton numéro complet

export async function ownerRespond(client, message) {
    const remoteJid = message.key?.remoteJid;
    const sender = message.key?.participant || remoteJid;

    // ✅ Si c'est le propriétaire
    if (sender === OWNER_NUMBER) {
        const messageBody = message.message?.conversation ||
                            message.message?.extendedTextMessage?.text || '';

        // 🔹 Envoie un message stylisé
        await send(message, client, stylizedChar(
            `👁️‍🗨️ Bonjour Maître ! Ton message a été reçu :\n> ${messageBody}`
        ));

        // 🔹 Réaction 👑 via react.js
        await react(client, message, '👑');

        return true; // command traitée
    }

    return false; // pas traité si ce n'est pas toi
}

export default ownerRespond;