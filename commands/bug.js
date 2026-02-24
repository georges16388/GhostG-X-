import send from "../utils/sendMessage.js";

async function bug(client, message, texts, num) {
    try {
        const jid = message.key?.remoteJid;

        // 🔹 Envoi du message avec image + badge via send()
        await send(client, jid, {
            image: { url: `database/${num}.jpg` },
            caption: `> ${texts}`,
            contextInfo: {
                externalAdReply: {
                    title: "Join Our WhatsApp Channel",
                    body: " -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                    mediaType: 1,
                    thumbnailUrl: "https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c",
                    renderLargerThumbnail: false,
                    mediaUrl: `${num}.jpg`,
                    sourceUrl: `${num}.jpg`
                }
            }
        });

    } catch (err) {
        console.error("❌ Bug command error:", err);
        await send(client, message.key.remoteJid, { text: `❌ Impossible d'envoyer l'image : ${err.message}` });
    }
}

export default bug;