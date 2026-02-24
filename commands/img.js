import send from "../utils/sendMessage.js";
import axios from "axios";

export async function img(message, sock) {
    const remoteJid = message.key.remoteJid;

    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const args = text.trim().split(/\s+/).slice(1);
    const query = args.join(" ");

    if (!query) {
        return await send(sock, remoteJid, {
            text: "🖼️ Fournis des mots-clés\nExemple: .img hacker setup"
        });
    }

    try {
        await send(sock, remoteJid, { text: `🔍 Recherche d'images pour "${query}"...` });

        const apiUrl = `https://christus-api.vercel.app/image/Pinterest?query=${encodeURIComponent(query)}&limit=10`;
        const response = await axios.get(apiUrl, { timeout: 15000 });

        if (
            !response.data ||
            !response.data.status ||
            !Array.isArray(response.data.results) ||
            response.data.results.length === 0
        ) {
            return await send(sock, remoteJid, { text: "❌ Aucune image trouvée." });
        }

        const images = response.data.results
            .filter(item => item.imageUrl && /\.(jpg|jpeg|png|webp)$/i.test(item.imageUrl))
            .slice(0, 5);

        if (images.length === 0) {
            return await send(sock, remoteJid, { text: "❌ Aucune image valide trouvée." });
        }

        for (const image of images) {
            try {
                await send(sock, remoteJid, {
                    image: { url: image.imageUrl },
                    caption:
                        `📷 ${query}\n` +
                        `${image.title && image.title !== "No title" ? image.title + "\n" : ""}` +
                        `© -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗`
                });

                // Petite pause pour éviter les limites de message
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error("Erreur en envoyant l'image :", err.message);
                continue;
            }
        }

    } catch (error) {
        console.error("IMG ERROR:", error.message);
        await send(sock, remoteJid, { text: "❌ Erreur API Pinterest." });
    }
}

export default img;