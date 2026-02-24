import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";

export async function modifyprem(client, message, action) {
    try {
        const remoteJid = message.key?.remoteJid;
        if (!remoteJid) throw new Error("Invalid remote JID.");

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const parts = messageBody.trim().split(/\s+/).slice(1);
        const args = parts;

        let participant;
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participant = message.message?.extendedTextMessage?.contextInfo?.participant || message.key.participant;
        } else if (args.length > 0) {
            const jidMatch = args[0].match(/\d+/);
            if (!jidMatch) {
                await send(client, remoteJid, { text: "❌ Format de participant invalide." });
                return;
            }
            participant = jidMatch[0] + "@s.whatsapp.net";
        } else {
            await send(client, remoteJid, { text: "❌ Aucun participant spécifié." });
            return;
        }

        let list = configmanager.premiums || [];

        if (action === "add") {
            if (!list.includes(participant)) {
                list.push(participant);
                configmanager.premiums = list;
                configmanager.saveP();
                await send(client, remoteJid, { text: `✅ ${participant.split('@')[0]} ajouté à la liste premium.` });
            } else {
                await send(client, remoteJid, { text: `ℹ️ ${participant.split('@')[0]} est déjà premium.` });
            }
        } else if (action === "remove") {
            if (list.includes(participant)) {
                list = list.filter(item => item !== participant);
                configmanager.premiums = list;
                configmanager.saveP();
                await send(client, remoteJid, { text: `❌ ${participant.split('@')[0]} retiré de la liste premium.` });
            } else {
                await send(client, remoteJid, { text: `ℹ️ ${participant.split('@')[0]} n'était pas premium.` });
            }
        }

    } catch (error) {
        console.error("❌ Erreur premium:", error);
        const remoteJid = message.key?.remoteJid;
        if (remoteJid) await send(client, remoteJid, { text: `❌ Erreur: ${error.message}` });
    }
}

export async function addprem(client, message) {
    await modifyprem(client, message, "add");
}

export async function delprem(client, message) {
    await modifyprem(client, message, "remove");
}

export default { addprem, delprem };