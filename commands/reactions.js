import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import bug from '../commands/bug.js';

// ------------------- AUTO REACT -------------------
export async function auto(client, message, cond, emoji) {
    try {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid) return;

        if (cond) {
            await client.sendMessage(remoteJid, {
                react: {
                    text: `${emoji}`,
                    key: message.key
                }
            });
        }
    } catch (err) {
        console.error('AUTO ERROR:', err);
    }
}

// Simple emoji regex (works for most cases)
export function isEmoji(str) {
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
    return emojiRegex.test(str);
}

// ------------------- AUTOREACT TOGGLE -------------------
export async function autoreact(client, message) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key?.remoteJid;

    if (!remoteJid) {
        console.error('Autoreact: remoteJid undefined');
        return;
    }

    try {
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.trim().split(/\s+/).slice(1);

        if (args.length === 0) {
            return await send(client, remoteJid, { text: "_*Sélectionne une option : on/off*_ " });
        }

        const input = args[0].toLowerCase();

        if (!configmanager.config.users[number]) {
            configmanager.config.users[number] = {};
        }

        const userConfig = configmanager.config.users[number];

        if (input === 'on') {
            userConfig.autoreact = true;
            configmanager.save();
            await bug(message, client, `✅ L'Auto-react est activé *ON*`, 3);
        } else if (input === 'off') {
            userConfig.autoreact = false;
            configmanager.save();
            await bug(message, client, `❌ L'Auto-react est désactivée *OFF*`, 3);
        } else {
            await send(client, remoteJid, { text: "_*Sélectionne une option : on/off*_ " });
        }
    } catch (error) {
        console.error('AUTOREACT ERROR:', error);
        await send(client, remoteJid, { text: `❌ Erreur lors de la mise à jour de l'Auto-react: ${error.message}` });
    }
}

export default { auto, autoreact };