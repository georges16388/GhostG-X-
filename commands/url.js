import send from "../utils/sendMessage.js";
import axios from 'axios';
import { downloadMediaMessage } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import stylizedChar from '../utils/fancy.js';

// 🔮 Upload vers Catbox (les ténèbres portent tes artefacts)
async function uploadToCatbox(buffer, fileName) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, fileName);

    const res = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        { headers: form.getHeaders() }
    );

    return res.data.trim();
}

// 🌑 Commande Ghost pour upload de média
export async function url(client, message) {
    const jid = message.key.remoteJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;

    if (!ctx?.quotedMessage) {
        return client.sendMessage(jid, { text: stylizedChar('⚠️ Les ténèbres exigent que tu répondes à une image, vidéo, audio ou document !') });
    }

    let mediaMessage = null;
    let ext = 'bin';

    if (ctx.quotedMessage.imageMessage) {
        mediaMessage = { imageMessage: ctx.quotedMessage.imageMessage };
        ext = 'jpg';
    } else if (ctx.quotedMessage.videoMessage) {
        mediaMessage = { videoMessage: ctx.quotedMessage.videoMessage };
        ext = 'mp4';
    } else if (ctx.quotedMessage.audioMessage) {
        mediaMessage = { audioMessage: ctx.quotedMessage.audioMessage };
        ext = 'mp3';
    } else if (ctx.quotedMessage.documentMessage) {
        mediaMessage = { documentMessage: ctx.quotedMessage.documentMessage };
        ext = ctx.quotedMessage.documentMessage.fileName?.split('.').pop() || 'bin';
    } else {
        return client.sendMessage(jid, { text: stylizedChar('⚠️ Ce type de média n’est pas supporté par les ombres.') });
    }

    await client.sendMessage(jid, { text: stylizedChar('🌫️ Les ombres recueillent ton artefact… Patience…') });

    try {
        const buffer = await downloadMediaMessage(
            { key: { remoteJid: jid, id: ctx.stanzaId, fromMe: false }, message: mediaMessage },
            'buffer'
        );

        const type = await fileTypeFromBuffer(buffer);
        if (type?.ext) ext = type.ext;

        const fileName = `ghost_${Date.now()}.${ext}`;
        const link = await uploadToCatbox(buffer, fileName);

        await client.sendMessage(jid, { 
            text: stylizedChar(
                `✅ Artefact uploadé avec succès par les ténèbres !\n` +
                `${link}\n\n` +
                `✨ Souviens-toi… Jésus t’aime, même dans l’ombre ✨`
            )
        });
    } catch (error) {
        console.error("❌ Ghost upload error:", error);
        await client.sendMessage(jid, { text: stylizedChar(`⚠️ Les ombres ont échoué à uploader ton artefact : ${error.message || error}`) });
    }
}

export default url;