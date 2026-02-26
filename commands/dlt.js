import send from "../utils/sendMessage.js";
import fs from "fs";

// 🔥 Lecture .env manuel
let BOT_NUMBER = '226XXXX';
let PREFIX = '`';

if (fs.existsSync('./.env')) {
    const envFile = fs.readFileSync('./.env', 'utf8');
    envFile.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const [key, ...vals] = line.split('=');
        const value = vals.join('=').trim();

        if (key === 'BOT_NUMBER') BOT_NUMBER = value;
        if (key === 'PREFIX') PREFIX = value;
    });
}

// 🔹 Commande delete avec effet Ghost Dark
async function dlt(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.quotedMessage) {
            return await send(sock, message.key.remoteJid, { 
                text: "👑 Maître… vous devez répondre à un message pour le faire disparaître." 
            });
        }

        const chatId = message.key.remoteJid;
        const quotedMessageKey = quoted.stanzaId || quoted.quotedMessage?.key?.id;
        const quotedSender = quoted.participant || quoted.quotedMessage?.key?.participant;

        const isFromBot =
            quotedSender === sock.user.id ||
            quotedSender?.includes(sock.user.id);

        if (!quotedMessageKey) {
            return await send(sock, chatId, { text: "👑 Maître… le message semble s’être évaporé." });
        }

        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                id: quotedMessageKey,
                fromMe: isFromBot
            }
        });

        // ✅ Message immersif Ghost Dark
        await send(sock, chatId, { 
            text: `👑 Maître… le message a été effacé dans l'ombre. Il ne pourra plus troubler le sanctuaire.` 
        });

    } catch (error) {
        console.error("❌ dlt error:", error);
        await send(sock, message.key.remoteJid, { 
            text: `👑 Maître… une anomalie a empêché la suppression. Les ombres observent.` 
        });
    }
}

export default dlt;

// 🔥 Pour le menu auto
export const desc = "Supprime un message (reply)";
export const usage = `${PREFIX}dlt`;