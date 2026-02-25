import send from "../utils/sendMessage.js";
import config from "../utils/configmanager.js";

// 🔹 récupérer le texte correctement
function getText(msg) {
    return msg.message?.conversation ||
           msg.message?.extendedTextMessage?.text ||
           "";
}

// 🔹 récupérer args
function getArgs(msg, prefix) {
    const text = getText(msg);
    return text.replace(prefix, "").trim().split(/\s+/).slice(1);
}

// 🔹 s'assurer que user existe
function ensureUser(id) {
    if (!config.config.users[id]) {
        config.config.users[id] = {};
    }
}

// 🔹 emoji check
function isEmoji(str) {
    const regex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
    return regex.test(str);
}

// =======================
// PREFIX
// =======================
export async function setPrefix(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const newPrefix = args[0];

        if (!newPrefix) {
            await send(client, jid, { text: "❌ Donne un prefix" });
            return;
        }

        config.config.users[id].prefix = newPrefix;
        config.save();

        await send(client, jid, { text: "✅ Prefix changé" });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// =======================
// REACTION
// =======================
export async function setReaction(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const emoji = args[0];

        if (!emoji || !isEmoji(emoji)) {
            await send(client, jid, { text: "❌ Emoji invalide" });
            return;
        }

        config.config.users[id].reaction = emoji;
        config.save();

        await send(client, jid, { text: "✅ Reaction changée" });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// =======================
// WELCOME
// =======================
export async function setWelcome(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const opt = args[0];

        if (opt !== "on" && opt !== "off") {
            await send(client, jid, { text: "❌ on/off" });
            return;
        }

        config.config.users[id].welcome = opt === "on";
        config.save();

        await send(client, jid, {
            text: opt === "on" ? "✅ Welcome activé" : "🚫 Welcome désactivé"
        });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// =======================
// AUTORECORD
// =======================
export async function setAutoRecord(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const opt = args[0];

        config.config.users[id].record = opt === "on"; // 🔥 correction ici
        config.save();

        await send(client, jid, {
            text: opt === "on" ? "🎙️ AutoRecord activé" : "🚫 AutoRecord désactivé"
        });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// =======================
// AUTOTYPE
// =======================
export async function setAutoType(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const opt = args[0];

        config.config.users[id].type = opt === "on";
        config.save();

        await send(client, jid, {
            text: opt === "on" ? "⌨️ AutoType activé" : "🚫 AutoType désactivé"
        });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// =======================
// PUBLIC MODE
// =======================
export async function setPublic(msg, client) {
    const id = client.user.id.split(":")[0];
    const jid = msg.key.remoteJid;

    try {
        ensureUser(id);

        const args = getArgs(msg, config.config.users[id].prefix || "!");
        const opt = args[0];

        config.config.users[id].publicMode = opt === "on";
        config.save();

        await send(client, jid, {
            text: opt === "on"
                ? "✅ Mode public activé"
                : "🚫 Mode public désactivé"
        });

    } catch (err) {
        await send(client, jid, { text: "❌ " + err.message });
    }
}

// EXPORT
export default {
    setPrefix,
    setReaction,
    setWelcome,
    setAutoRecord,
    setAutoType,
    setPublic
};