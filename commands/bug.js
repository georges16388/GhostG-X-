import stylizedChar from "../utils/fancy.js";

async function bug(message, client, texts, num) {
    try {
        const remoteJid = message.key?.remoteJid;
        if (!remoteJid) return;

        // Lien de ton groupe WhatsApp
        const groupLink = "https://chat.whatsapp.com/EDIPjpnMBYiEXRehrl0bar?mode=gi_t";

        await client.sendMessage(remoteJid, {
            image: { url: `database/${num}.jpg` },

            // Caption stylisé avec ton branding
            caption: stylizedChar(`> ${texts}\n\n⏤͟͟͞ＧＨＯＳＴＧ－Ｘ ⚡`),

            contextInfo: {
                externalAdReply: {
                    title: "⏤͟͟͞ＧＨＯＳＴＧ－Ｘ GROUP",
                    body: "Clique pour rejoindre 🔥",
                    mediaType: 1, // Image preview
                    thumbnailUrl: groupLink,
                    renderLargerThumbnail: true,
                    mediaUrl: groupLink,
                    sourceUrl: groupLink
                }
            }
        });

    } catch (e) {
        console.log(e);
    }
}

export default bug;