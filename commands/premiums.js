import send from "../utils/sendMessage.js";
import configmanager from "../utils/configmanager.js";
import stylizedChar from "../utils/fancy.js";

// 🔹 Vérification si un participant est premium
function isPremium(participant) {
    const list = Object.values(configmanager.premiums.premiumUser || {}).map(u => u.premium);
    return list.includes(participant);
}

// 🔹 Gestion ajout/suppression Premium
export async function modifyprem(client, message, action) {
    try {
        const jid = message.key?.remoteJid;
        if (!jid) throw new Error("JID invalide.");

        let participant;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim().split(/\s+/).slice(1);

        if (quoted) {
            participant = message.message.extendedTextMessage.contextInfo.participant || message.key.participant;
        } else if (args.length > 0) {
            const numMatch = args[0].match(/\d+/);
            if (!numMatch) {
                return await send(client, jid, { text: stylizedChar("👑 Maître, le format du participant est invalide.") });
            }
            participant = numMatch[0] + "@s.whatsapp.net";
        } else {
            return await send(client, jid, { text: stylizedChar("👑 Maître, aucun participant spécifié.") });
        }

        let list = Array.isArray(configmanager.premiums) ? configmanager.premiums : [];

        if (action === "add") {
            if (!list.includes(participant)) {
                list.push(participant);
                configmanager.premiums = list;
                if (typeof configmanager.saveP === "function") configmanager.saveP();
                await send(client, jid, { text: stylizedChar(`✅ ${participant.split('@')[0]} a été élevé au rang Premium. L’ombre l’observe maintenant.`) });
            } else {
                await send(client, jid, { text: stylizedChar(`ℹ️ ${participant.split('@')[0]} est déjà Premium.`) });
            }
        } else if (action === "remove") {
            if (list.includes(participant)) {
                list = list.filter(p => p !== participant);
                configmanager.premiums = list;
                if (typeof configmanager.saveP === "function") configmanager.saveP();
                await send(client, jid, { text: stylizedChar(`❌ ${participant.split('@')[0]} a été retiré de la liste Premium. Les ténèbres le surveillent.`) });
            } else {
                await send(client, jid, { text: stylizedChar(`ℹ️ ${participant.split('@')[0]} n'était pas Premium.`) });
            }
        }

    } catch (err) {
        console.error("❌ Erreur premium:", err);
        const jid = message.key?.remoteJid;
        if (jid) await send(client, jid, { text: stylizedChar(`👑 Maître, une erreur est survenue : ${err.message}`) });
    }
}

// 🔹 Commandes principales
export async function addprem(client, message) {
    await modifyprem(client, message, "add");
}

export async function delprem(client, message) {
    await modifyprem(client, message, "remove");
}

// 🔹 Commandes Premium exclusives Ghost Dark

export async function ghostscan(sock, message) {
    const jid = message.key.remoteJid;
    const participant = message.key.participant || jid;

    if (!isPremium(participant)) {
        return await send(sock, jid, { text: stylizedChar("❌ Cette commande est réservée aux élus Premium.") });
    }

    await send(sock, jid, { text: stylizedChar("🌑 Analyse des ombres en cours...") });

    const totalUsers = 42;
    const activeAdmins = 3;
    const uptime = `${Math.floor(process.uptime() / 3600)}h ${Math.floor(process.uptime() % 3600 / 60)}m`;

    const result = `
╔═══『 👁️ GhostScan 』═══╗
❖ Utilisateurs détectés : ${totalUsers}
❖ Administrateurs actifs : ${activeAdmins}
❖ Énergie du bot : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB
❖ Temps d’éveil : ${uptime}
╚═════════════════════╝
`;
    await send(sock, jid, { text: stylizedChar(result) });
}

// 🔹 Exemple d’autre commande Premium
export async function ghostenergy(sock, message) {
    const jid = message.key.remoteJid;
    const participant = message.key.participant || jid;

    if (!isPremium(participant)) {
        return await send(sock, jid, { text: stylizedChar("❌ Premium seulement.") });
    }

    const energy = Math.floor(Math.random() * 100);
    await send(sock, jid, { text: stylizedChar(`⚡ Énergie spectrale : ${energy}%`) });
}

// 🔹 Export global
export default {
    addprem,
    delprem,
    ghostscan,
    ghostenergy
};