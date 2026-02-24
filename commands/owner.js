export default async function owner(sock, message) {
    try {
        const jid = message.key.remoteJid;

        const ownerNumber = "22677487520"; // ton numéro
        const ownerName = "-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗";

        // 🔗 lien avec message auto
        const textMsg = encodeURIComponent("Salut, je viens du bot GhostG-X 👻");
        const waLink = `https://wa.me/${ownerNumber}?text=${textMsg}`;

        const caption = `
╔═══════『 👤 ᴏᴡɴᴇʀ 』═══════╗

👻 ɴᴀᴍᴇ : ${ownerName}
📞 ɴᴜᴍʙᴇʀ : +${ownerNumber}
⚡ sʏsᴛᴇᴍ : ɢʜᴏsᴛɢ-x

╚═══════════════════════╝

> Clique sur le contact pour écrire directement 💬
`;

        // 📇 envoi du contact
        await sock.sendMessage(jid, {
            contacts: {
                displayName: ownerName,
                contacts: [
                    {
                        displayName: ownerName,
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:GhostG-X Bot;
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}
END:VCARD`
                    }
                ]
            }
        }, { quoted: message });

        // 🖼️ message stylé + bouton
        await sock.sendMessage(jid, {
            image: { url: "./database/owner.jpg" }, // mets ta photo
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: "👻 GhostG-X Developer",
                    body: "Tap to chat with Phantom X",
                    sourceUrl: waLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

    } catch (err) {
        console.error("Owner command error:", err);
    }
}