import send from "../utils/sendMessage.js";

// Ton numéro (format WhatsApp JID)
const OWNER_NUMBER = '22677487520@s.whatsapp.net'; // remplace par ton numéro complet

/**
 * Répond toujours au propriétaire et réagit avec 👑
 * @param {object} client - Le client Baileys
 * @param {object} message - Le message reçu
 * @returns {boolean} - true si traité
 */
export async function ownerRespond(client, message) {
    const remoteJid = message.key?.remoteJid;
    const sender = message.key?.participant || remoteJid;

    // ✅ Si c'est le propriétaire
    if (sender === OWNER_NUMBER) {
        const messageBody = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        // 1️⃣ Réponse personnalisée
        await send(message, client, `👁️‍🗨️ Bonjour Maître ! Ton message a été reçu :\n> ${messageBody}`);

        // 2️⃣ Réaction 👑
        try {
            await client.sendMessage(remoteJid, {
                react: {
                    text: '👑',
                    key: message.key
                }
            });
        } catch (err) {
            console.error('❌ Erreur réaction propriétaire :', err);
        }

        return true; // command traitée
    }

    return false; // pas traité si ce n'est pas toi
}

export default ownerRespond;