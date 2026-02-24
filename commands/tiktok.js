import axios from 'axios'
import stylizedChar from '../utils/fancy.js';
import stylizedCardMessage from '../utils/messageStyle.js';

async function tiktok(client, message){
    const remoteJid = message.key?.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation ;
    const args = messageBody.slice(1).trim().split(/\s+/)[1];

    // Vérification du lien
    if(!args){
        await client.sendMessage(remoteJid, { text: stylizedChar("✨ Please provide a TikTok link. Ex: tiktok https://vm.tiktok.com ✨")});
        return;
    }
    if(!args.includes('tiktok.com')){
        await client.sendMessage(remoteJid, { text: stylizedChar("⚠️ That doesn't look like a valid TikTok link.")});
        return;
    }

    // Message de téléchargement
    await client.sendMessage(remoteJid, {text: stylizedChar("🚀 Initiating download... Please be patient! ⏳")});

    // Try / Catch principal
    try {
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${args}`;
        const response = await axios.get(apiUrl);
        console.log(response.data); // 🔥 Utile pour debug si ça casse

        const data = response.data;

        if (!data || !data.data){
            await client.sendMessage(remoteJid, {text: stylizedChar('💔 Failed to download video')});
            return;
        }

        // Obtenir l'URL de la vidéo
        const videoUrl =
            data.data.video ||
            data.data.play ||
            data.data.hdplay;

        if(!videoUrl){
            await client.sendMessage(remoteJid, {text: stylizedChar("⚠️ No video found")});
            return;
        }

        const caption = stylizedChar(`🎬 TikTok Downloaded!\n\n👤 ${data.data.author?.nickname || "Unknown"}`);

        await client.sendMessage(remoteJid, {
            video: { url: videoUrl },
            caption
        }, { quoted: message });

    } catch (e) {
        console.error(e);
        await client.sendMessage(remoteJid, {
            text: stylizedChar("🚨 API Error or invalid link")
        });
    }
}

export default tiktok;