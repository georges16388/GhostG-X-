export default async function owner(sock, message) {
    try {
        const jid = message.key.remoteJid;

        // 🔹 On prend le numéro de l'utilisateur qui a envoyé le message
        const ownerNumber = jid.split("@")[0]; // ex: 22677487520
        const ownerName = message.pushName || "Utilisateur";

        // 📇 envoi du contact de l'utilisateur
        await sock.sendMessage(jid, {
            contacts: {
                displayName: ownerName,
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

    } catch (err) {
        console.error("Owner command error:", err);
    }
}