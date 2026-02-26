import send from "../utils/sendMessage.js";

export default async function owner(sock, message) {
    try {
        const jid = message.key.remoteJid;
        const ownerNumber = jid.split("@")[0];
        const ownerName = message.pushName || "Utilisateur";

        // 🔹 Message immersif préliminaire
        await send(sock, jid, {
            text: `🖤 Maître… les ténèbres révèlent votre identité dans l’ombre.`
        });

        // 🔹 Envoi de la vCard Ghost Dark
        await sock.sendMessage(jid, {
            contacts: {
                displayName: `👑 ${ownerName} (Maître)`,
                contacts: [{
                    displayName: ownerName,
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}
END:VCARD`
                }]
            }
        }, { quoted: message });

        // 🔹 Message de confirmation immersif
        await send(sock, jid, {
            text: `👑 Maître… votre identité a été transmise à l’ombre en toute sécurité.`
        });

    } catch (err) {
        console.error("❌ Owner command error:", err);
        await send(sock, message.key.remoteJid, {
            text: `👑 Maître… une anomalie a empêché l’exécution : ${err.message}`
        });
    }
}

// 🔹 Pour le menu automatique
export const desc = "Révèle votre identité au style Ghost Dark";
export const usage = "owner";