import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";
import axios from "axios";

export async function play(message, sock) {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "Maître";

    try {
        const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = rawText.trim().split(/\s+/).slice(1);
        const query = args.join(' ');

        if (!query) {
            return await send(sock, jid, { text: stylizedChar(`⚡ ${userName}, fournis un titre de vidéo à invoquer, Maître…`) });
        }

        // 🔹 Message immersif Ghost Dark
        await send(sock, jid, { text: stylizedChar(`🔎 ${userName}, je scrute les ombres pour trouver : ${query}`), quoted: message });

        // 🔹 Requête API
        const searchUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl, { timeout: 15000 });

        if (!searchResponse.data.status || !searchResponse.data.result) {
            throw new Error("Aucune vidéo trouvée dans les ténèbres…");
        }

        const videoData = searchResponse.data.result;
        const videoUrl = videoData.url || videoData.download_url;
        if (!videoUrl) throw new Error("L’URL de téléchargement n’existe pas.");

        const apiUrl = `https://youtubeabdlpro.abrahamdw882.workers.dev/?url=${encodeURIComponent(videoUrl)}`;

        // 🔹 Envoi miniature + infos Ghost Dark
        const infoText = stylizedChar(
            `🎵 *${videoData.title}*\n` +
            `⏱️ ${videoData.duration || 'Inconnu'}\n` +
            `👁️ ${videoData.views || 'Inconnu'} vues\n\n` +
            `👑 Maître, la mélodie est prête à être invoquée…`
        );

        await send(sock, jid, { image: { url: videoData.thumbnail }, caption: infoText, quoted: message });

        // 🔹 Envoi audio Ghost Dark
        await send(sock, jid, { audio: { url: apiUrl, mimetype: 'audio/mp4', ptt: false }, quoted: message });

        // 🔹 Confirmation immersive
        await send(sock, jid, { text: stylizedChar(`✅ ${userName}, le morceau "${videoData.title}" a été invoqué dans le sanctuaire.`) });

    } catch (err) {
        console.error("❌ Erreur play command :", err);
        await send(sock, jid, { text: stylizedChar(👑 Maître… une ombre a bloqué l’invocation : ${err.message}`) });
    }
}

export default play;