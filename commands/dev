export default async function dev(sock, message) {
    try {
        const jid = message.key.remoteJid;

        const ownerNumber = "22677487520"; // ton numéro
        const ownerName = "-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗";

        // 📇 envoi du contact
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
        console.error("Dev command error:", err);
    }
}