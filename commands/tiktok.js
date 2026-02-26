import send from "../utils/sendMessage.js";
import axios from 'axios';
import stylizedChar from '../utils/fancy.js';

export async function tiktok(client, message) {
    const remoteJid = message.key?.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(1).trim().split(/\s+/)[1]; // Récupère le lien TikTok

    // 🔹 Vérification du lien
    if (!args) {
        await client.sendMessage(remoteJid, { text: stylizedChar("🌑 Veuillez fournir un lien TikTok, Maître 👑. Ex: tiktok https://vm.tiktok.com") });
        return;
    }
    if (!args.includes('tiktok.com')) {
        await client.sendMessage(remoteJid, { text: stylizedChar("⚠️ Ce lien ne semble pas valide pour TikTok, Maître 👑.") });
        return;
    }

    // 🔹 Message de téléchargement
    await client.sendMessage(remoteJid, { text: stylizedChar("🌑 Téléchargement en cours... Patientez un instant ⏳") });

    try {
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(args)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.data) {
            await client.sendMessage(remoteJid, { text: stylizedChar("💔 Échec du téléchargement de la vidéo, Maître 👑.") });
            return;
        }

        const videoUrl = data.data.video || data.data.play || data.data.hdplay;
        if (!videoUrl) {
            await client.sendMessage(remoteJid, { text: stylizedChar("⚠️ Aucune vidéo trouvée, Maître 👑.") });
            return;
        }

        // 🔹 Préparer la légende Ghost/Dark
        const caption = stylizedChar(
            `🌑 *TikTok Video Downloaded!* 🌑\n\n` +
            `👤 *Créateur:* ${data.data.author?.nickname || "Unknown"} (@${data.data.author?.username || "unknown"})\n` +
            `📝 *Titre:* ${data.data.title || 'N/A'}\n` +
            `👁️ *Vues:* ${data.data.views || '0'}\n` +
            `❤️ *Likes:* ${data.data.like || '0'}\n` +
            `💬 *Commentaires:* ${data.data.comment || '0'}\n` +
            `🔗 *Partages:* ${data.data.share || '0'}\n\n` +
            `> Powered by Phantom-X Tech`
        );

        // 🔹 Envoi de la vidéo avec effet Ghost
        await client.sendMessage(remoteJid, { video: { url: videoUrl }, caption });

        console.log(stylizedChar(`✅ TikTok envoyé avec succès à ${remoteJid} 🌑`));

    } catch (error) {
        console.error("❌ TikTok download error:", error);
        await client.sendMessage(remoteJid, { text: stylizedChar(`⚠️ Erreur lors du téléchargement TikTok, Maître 👑 : ${error.message || error}`) });
    }
}

export default tiktok;