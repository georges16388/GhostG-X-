import send from "../utils/sendMessage.js";
import stylizedChar from "../commands/fancy.js";
import configmanager from "../utils/configmanager.js";
import bug from '../commands/bug.js';

// ------------------- GHOST REACT -------------------
export async function react(client, message, emoji = '🐦‍🔥', ghostText = '') {
    const remoteJid = message.key.remoteJid;
    if (!remoteJid) return;

    try {
        // 🔹 Si on a du texte ghost, l'ajouter
        const textToSend = ghostText ? stylizedChar(`${ghostText} ${emoji}`) : emoji;

        await client.sendMessage(remoteJid, {
            react: {
                text: textToSend,
                key: message.key
            }
        });
    } catch (err) {
        console.error("❌ React error:", err);
    }
}

// ------------------- AUTO REACT -------------------
export async function auto(client, message, cond, emoji = '🐦‍🔥', ghostText = '🌑 Ghost React') {
    try {
        const remoteJid = message.key.remoteJid;
        if (!remoteJid) return;

        if (cond) {
            // 🔹 Utiliser react() avec style Ghost/Dark
            await react(client, message, emoji, ghostText);
        }
    } catch (err) {
        console.error('AUTO ERROR:', err);
    }
}

// ------------------- AUTOREACT TOGGLE -------------------
export async function autoreact(client, message) {
    const number = client.user.id.split(':')[0];
    const remoteJid = message.key?.remoteJid;
    if (!remoteJid) return;

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
            await bug(client, message, `✅ ${stylizedChar('Auto-react activé 🌑')}`, 3);
        } else if (input === 'off') {
            userConfig.autoreact = false;
            configmanager.save();
            await bug(client, message, `❌ ${stylizedChar('Auto-react désactivé 🌑')}`, 3);
        } else {
            await send(client, remoteJid, { text: "_*Sélectionne une option : on/off*_ " });
        }
    } catch (err) {
        console.error('AUTOREACT ERROR:', err);
        await send(client, remoteJid, { text: `❌ Erreur lors de la mise à jour de l'Auto-react: ${err.message}` });
    }
}

export default { react, auto, autoreact };