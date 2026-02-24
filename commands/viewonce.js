import send from "../utils/sendMessage.js";
import { DigixNew } from '../utils/DigixNew.js';
import { downloadMediaMessage } from 'baileys';
import fs from 'fs';
import path from 'path';
import stylizedChar from '../utils/fancy.js';

export async function viewonce(client, message) {
    const remoteJid = message.key.remoteJid;
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMessage?.imageMessage?.viewOnce &&
        !quotedMessage?.videoMessage?.viewOnce &&
        !quotedMessage?.audioMessage?.viewOnce) {
        return send(client, remoteJid, stylizedChar('_Reply to a valid ViewOnce message._'));
    }

    const content = DigixNew(quotedMessage);

    // Désactiver toutes les propriétés viewOnce
    function modifyViewOnce(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        for (const key in obj) {
            if (key === 'viewOnce' && typeof obj[key] === 'boolean') obj[key] = false;
            else if (typeof obj[key] === 'object') modifyViewOnce(obj[key]);
        }
    }

    modifyViewOnce(content);

    try {
        // Détecter le type de média
        let type = null;
        if (content.imageMessage) type = 'image';
        else if (content.videoMessage) type = 'video';
        else if (content.audioMessage) type = 'audio';

        if (!type) return send(client, remoteJid, stylizedChar('_No valid media to send._'));

        const mediaBuffer = await downloadMediaMessage({ message: content }, 'buffer');

        if (!mediaBuffer) return send(client, remoteJid, stylizedChar('_Failed to download the media. Please try again._'));

        const extMap = { image: 'jpeg', video: 'mp4', audio: 'mp3' };
        const tempFilePath = path.resolve(`./temp_view_once.${extMap[type]}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Envoi du média via send
        await send(client, remoteJid, { [type]: { url: tempFilePath } });

        fs.unlinkSync(tempFilePath);
        console.log(`✅ ViewOnce ${type} sent successfully!`);

    } catch (error) {
        console.error('Error processing ViewOnce message:', error);
        await send(client, remoteJid, stylizedChar('_An error occurred while processing the ViewOnce message._'));
    }
}

export default viewonce;