import send from "../utils/sendMessage.js";
import { DigixNew } from '../utils/DigixNew.js';
import { downloadMediaMessage } from 'baileys';
import fs from 'fs';
import path from 'path';

export async function viewonce(client, message) {
    const remoteJid = message.key.remoteJid;
    const botJid = client.user.id.split(':')[0] + "@s.whatsapp.net";

    // Récupère le message cité
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMessage?.imageMessage?.viewOnce &&
        !quotedMessage?.videoMessage?.viewOnce &&
        !quotedMessage?.audioMessage?.viewOnce) {
        return await send(client, remoteJid, { text: '_Reply to a valid ViewOnce message._' });
    }

    // Transforme le message avec DigixNew
    const content = DigixNew(quotedMessage);

    // Fonction pour désactiver viewOnce
    function modifyViewOnce(obj) {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
            if (key === 'viewOnce' && typeof obj[key] === 'boolean') obj[key] = false;
            else if (typeof obj[key] === 'object') modifyViewOnce(obj[key]);
        }
    }

    modifyViewOnce(content);

    try {
        let mediaType = '';
        if (content?.imageMessage) mediaType = 'image';
        else if (content?.videoMessage) mediaType = 'video';
        else if (content?.audioMessage) mediaType = 'audio';

        if (!mediaType) {
            return await send(client, remoteJid, { text: '_No valid media to modify and send._' });
        }

        // Télécharge le média
        const mediaBuffer = await downloadMediaMessage({ message: content }, 'buffer');
        if (!mediaBuffer) {
            return await send(client, remoteJid, { text: '_Failed to download the ViewOnce media. Please try again._' });
        }

        // Chemin temporaire
        const extension = mediaType === 'image' ? 'jpeg' : mediaType === 'video' ? 'mp4' : 'mp3';
        const tempFilePath = path.resolve(`./temp_viewonce.${extension}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Envoie le média
        await client.sendMessage(botJid, { [mediaType]: { url: tempFilePath } });

        // Supprime le fichier temporaire
        fs.unlinkSync(tempFilePath);

    } catch (error) {
        console.error('VIEWONCE ERROR:', error);
        await send(client, remoteJid, { text: '_An error occurred while processing the ViewOnce message._' });
    }
}

export default viewonce;