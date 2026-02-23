import axios from 'axios'
import stylizedChar from '../utils/fancy.js';
import stylizedCardMessage from '../utils/messageStyle.js';

async function tiktok(client, message){
    const remoteJid = message.key?.remoteJid;
    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation ;
    const args = messageBody.slice(1).trim().split(/\s+/)[1];

    if(!args){
        await client.sendMessage(remoteJid, { 
            text: stylizedChar(`✨ -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ dit: envoie un lien TikTok : Ex: tiktok https://vm.tiktok.com ✨`)
        });
        return ;
    }

    if(!args.includes('tiktok.com')){
        await client.sendMessage(remoteJid, { 
            text: stylizedChar(`⚠️ Ça ne ressemble pas à un lien TikTok`) 
        });
        return;
    }

    await client.sendMessage(remoteJid, {
        text: stylizedChar(`🚀 En cours de téléchargement... Sois patient! ⏳`)
    });

    try {
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${args}`;
        const { data } = await axios.get(apiUrl);

        // ✅ Vérification sécurisée
        if (!data.status || !data.data) {
            await client.sendMessage(remoteJid, { 
                text: stylizedChar(`🥺 Oh ça n'a pas marché`) 
            });
            return;
        }

        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video")?.org;
        const views = meta?.play_count || 'N/A';

        if(!videoUrl){
            await client.sendMessage(remoteJid, { 
                text: stylizedChar(`⚠️ Impossible de récupérer l'URL de la vidéo`) 
            });
            return;
        }

        // ✅ Caption sécurisé avec backticks et pas de "+" en début de ligne
        const caption = stylizedChar(`🎬 *TikTok Video Downloaded!* 🎬

👤 *Creator:* ${author.nickname} (@${author.username})
📝 *Title:* ${title || 'No title available'}
👁️ *Views:* ${views}
❤️ *Likes:* ${like}
💬 *Comments:* ${comment}
🔗 *Share:* ${share}

ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗 😉`);

        await client.sendMessage(remoteJid, {
            video: { url: videoUrl },
            caption: caption,
            contextInfo: { mentionedJid: [message.key.participant || remoteJid] }
        }, { quoted: message });

    } catch (e) {
        console.error("🔥 Error during TikTok download:", e);
        await client.sendMessage(remoteJid, {
            text: stylizedChar(`🚨 Une erreur est survenue: ${e.message} 🚨`)
        });
    }
}

export default tiktok;