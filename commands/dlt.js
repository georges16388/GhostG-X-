import sender from "../commands/sender.js";
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

// 🔹 Commande delete
async function dlt(client, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.quotedMessage) {
            return sender(message, client, "❌ Reply à un message à supprimer.");
        }

        const chatId = message.key.remoteJid;
        const quotedMessageKey = quoted.stanzaId;
        const quotedSender = quoted.participant;

        const isFromBot =
            quotedSender === client.user.id ||
            quotedSender?.includes(client.user.id);

        if (!quotedMessageKey) {
            return sender(message, client, "❌ Message introuvable.");
        }

        await client.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                id: quotedMessageKey,
                fromMe: isFromBot
            }
        });

        await sender(message, client, "✅ Message supprimé !");

    } catch (error) {
        console.error(error);
        await sender(message, client, "❌ Erreur.");
    }
}

export default dlt;

// 🔥 Pour le menu auto
export const desc = "Supprime un message (reply)";
export const usage = "dlt";