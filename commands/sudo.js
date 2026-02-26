import send from "../utils/sendMessage.js";
import stylizedChar from '../utils/fancy.js';

/**
 * Modifie une liste d'utilisateurs (sudo ou premium) avec style ghost
 * @param {object} client - Le client WhatsApp
 * @param {object} message - Le message reçu
 * @param {Array} list - La liste cible (sudoList ou premiumList)
 * @param {string} action - "add" ou "remove"
 * @param {string} type - Type de liste pour le message ("sudo" ou "premium")
 */
export async function modifyUserList(client, message, list, action, type = "sudo") {
    try {
        const remoteJid = message.key?.remoteJid;
        if (!remoteJid) return;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const commandAndArgs = messageBody.slice(1).trim();
        const parts = commandAndArgs.split(/\s+/);
        const args = parts.slice(1);

        let participant;

        // Priorité : reply
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            participant = message.message.extendedTextMessage.contextInfo.participant || message.key.participant;
        } 
        // Sinon : argument
        else if (args.length > 0) {
            const jidMatch = args[0].match(/\d+/);
            if (!jidMatch) throw new Error("❌ Numéro invalide pour l'utilisateur.");
            participant = jidMatch[0] + '@s.whatsapp.net';
        } else {
            throw new Error("❌ Aucune entité spécifiée.");
        }

        // Ghost language messages
        if (action === "add") {
            if (!list.includes(participant)) {
                list.push(participant);
                await send(message, client, stylizedChar(`✅ ${participant} ajouté au cercle ${type} 👻`));
            } else {
                await send(message, client, stylizedChar(`⚠️ ${participant} est déjà ${type} dans l'ombre`));
            }
        } else if (action === "remove") {
            const index = list.indexOf(participant);
            if (index !== -1) {
                list.splice(index, 1);
                await send(message, client, stylizedChar(`🚫 ${participant} retiré du cercle ${type} 👁️‍🗨️`));
            } else {
                await send(message, client, stylizedChar(`⚠️ ${participant} n'était pas ${type} dans le sanctuaire`));
            }
        }
    } catch (error) {
        console.error(`❌ modifyUserList (${type}) error:`, error);
        await send(message, client, stylizedChar(`⚠️ Erreur: ${error.message}`));
    }
}

/** Sudo */
export async function sudo(client, message, sudoList) {
    await modifyUserList(client, message, sudoList, "add", "sudo");
}

/** Retirer sudo */
export async function delsudo(client, message, sudoList) {
    await modifyUserList(client, message, sudoList, "remove", "sudo");
}

/** Premium */
export async function premium(client, message, premiumList) {
    await modifyUserList(client, message, premiumList, "add", "premium");
}

/** Retirer premium */
export async function delpremium(client, message, premiumList) {
    await modifyUserList(client, message, premiumList, "remove", "premium");
}

export default { sudo, delsudo, premium, delpremium };