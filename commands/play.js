import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";
import axios from "axios";

export async function play(message, sock) {
    const remoteJid = message.key.remoteJid;
    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const text = rawText.toLowerCase().trim();

    try {
        const query = text.split(/\s+/).slice(1).join(' ');
        if (!query) {
            return await send(sock, remoteJid, { text: stylizedChar('❌ Fournis un titre de vidéo.') });
        }

        console.log('🎯 Recherche :', query);
        await send(sock, remoteJid, { text: stylizedChar(`🔎 Recherche : ${query}`), quoted: message });

        const searchUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl, { timeout: 10000 });

        if (!searchResponse.data.status || !searchResponse.data.result) {
            throw new Error('Vidéo non trouvée.');
        }

        const videoData = searchResponse.data.result;
        const videoUrl = videoData.url || videoData.download_url;
        if (!videoUrl) throw new Error('URL de téléchargement non disponible.');

        const apiUrl = `https://youtubeabdlpro.abrahamdw882.workers.dev/?url=${encodeURIComponent(videoUrl)}`;

        // Envoi de la miniature + infos
        await send(sock, remoteJid, {
            image: { url: videoData.thumbnail },
            caption: `🎵 *${videoData.title}*\n⏱️ ${videoData.duration || 'Inconnu'}\n👁️ ${videoData.views || 'Inconnu'} vues\n\n© -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ`,
            quoted: message
        });

        // Envoi de l'audio
        await send(sock, remoteJid, {
            audio: { url: apiUrl },
            mimetype: 'audio/mp4',
            ptt: false,
            quoted: message
        });

        console.log('✅ Audio envoyé :', videoData.title);

    } catch (error) {
        console.error('❌ Erreur play :', error.message);
        await send(sock, remoteJid, { text: stylizedChar('❌ Erreur de téléchargement.') });
    }
}

export default play;