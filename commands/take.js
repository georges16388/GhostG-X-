import send from "../utils/sendMessage.js";
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadMediaMessage } from "baileys";
import fs from "fs";
import path from "path";
import stylizedChar from '../utils/fancy.js';

export async function take(client, message) {
    const remoteJid = message.key.remoteJid;

    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const commandAndArgs = messageBody.slice(1).trim();
        const args = commandAndArgs.split(/\s+/).slice(1);

        if (!quotedMessage || !quotedMessage.stickerMessage) {
            return send(message, client, stylizedChar("❌ Reply to a sticker to modify it!"));
        }

        // Déterminer le texte du sticker
        const username = args.length ? args.join(" ") : (message.pushName || "Unknown");

        // Télécharger le sticker
        const stickerBuffer = await downloadMediaMessage({ message: quotedMessage }, "buffer", {}, { logger: console });
        if (!stickerBuffer) return send(message, client, stylizedChar("❌ Failed to download sticker!"));

        // Fichier temporaire
        const tempStickerPath = path.resolve(`./temp_sticker_${Date.now()}.webp`);
        fs.writeFileSync(tempStickerPath, stickerBuffer);

        // Détecter si le sticker est animé
        const isAnimated = quotedMessage.stickerMessage.isAnimated || false;

        // Créer le sticker modifié
        const sticker = new Sticker(tempStickerPath, {
            pack: username,
            author: username,
            type: isAnimated ? StickerTypes.FULL : StickerTypes.DEFAULT,
            quality: 80,
            animated: isAnimated,
        });

        // Convertir en message compatible Baileys
        const stickerMessage = await sticker.toMessage();

        // Envoyer le sticker
        await send(message, client, null, null, stickerMessage);

        // Nettoyer le fichier temporaire
        fs.unlinkSync(tempStickerPath);
        console.log(`✅ Sticker sent successfully with "${username}" metadata!`);

    } catch (error) {
        console.error("❌ Error modifying sticker:", error);
        await send(message, client, `⚠️ Error modifying sticker: ${error instanceof Error ? error.message : error}`);
    }
}

export default take;