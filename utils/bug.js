async function bug(message, client, texts, num) {
    try {
        const remoteJid = message.key?.remoteJid;
        await client.sendMessage(remoteJid, {
            image: { url: `database/${num}.jpg` },
            caption: `> ${texts}`,
            contextInfo: {
                externalAdReply: {
                    title: "Join Our WhatsApp Group", // affichage “Groupe”
                    body: "⏤͟͟͞ＧＨＯＳＴＧ",             // remplace par ton nom
                    mediaType: 1,
                    thumbnailUrl: `https://chat.whatsapp.com/EDIPjpnMBYiEXRehrl0bar?mode=gi_t`, // lien du groupe
                    renderLargerThumbnail: false,
                    mediaUrl: `${num}.jpg`,
                    sourceUrl: `${num}.jpg`
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}

export default bug;