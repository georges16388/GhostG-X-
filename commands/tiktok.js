import send from "../utils/sendMessage.js";
import axios from 'axios';
import stylizedChar from '../utils/fancy.js';

export async function tiktok(client, message) {
    const remoteJid = message.key?.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(1).trim().split(/\s+/)[1]; // Récupère le lien

    // Vérification du lien
    if (!args) {
        await client.sendMessage(remoteJid, { text: stylizedChar("✨ Please provide a TikTok link. Ex: tiktok https://vm.tiktok.com ✨") });
        return;
    }
    if (!args.includes('tiktok.com')) {
        await client.sendMessage(remoteJid, { text: stylizedChar("⚠️ That doesn't look like a valid TikTok link.") });
        return;
    }

    // Message de téléchargement
    await client.sendMessage(remoteJid, { text: stylizedChar("🚀 Initiating download... Please be patient! ⏳") });

    try {
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(args)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.data) {
            await client.sendMessage(remoteJid, { text: stylizedChar('💔 Failed to download video') });
            return;
        }

        const videoUrl = data.data.video || data.data.play || data.data.hdplay;
        if (!videoUrl) {
            await client.sendMessage(remoteJid, { text: stylizedChar("⚠️ No video found") });
            return;
        }

        // Préparer la légende
        const caption = stylizedChar(
            `🎬 *TikTok Video Downloaded!* 🎬\n\n` +
            `👤 *Creator:* ${data.data.author?.nickname || "Unknown"} (@${data.data.author?.username || "unknown"})\n` +
            `📝 *Title:* ${data.data.title || 'No title available'}\n` +
            `👁️ *Views:* ${data.data.views || 'N/A'}\n` +
            `❤️ *Likes:* ${data.data.like || '0'}\n` +
            `💬 *Comments:* ${data.data.comment || '0'}\n` +
            `🔗 *Shares:* ${data.data.share || '0'}\n\n` +
            `> Powered by Phantom-X Tech`
        );

        // Envoi de la vidéo
        await client.sendMessage(remoteJid, { video: { url: videoUrl }, caption });

    } catch (error) {
        console.error("❌ TikTok download error:", error);
        await client.sendMessage(remoteJid, { text: stylizedChar(`⚠️ Error downloading TikTok video: ${error.message || error}`) });
    }
}

export default tiktok;