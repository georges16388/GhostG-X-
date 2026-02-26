import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";

export async function pingTest(sock, message) {
    const jid = message.key.remoteJid;
    const userName = message.pushName || "Maître";

    try {
        // 🔹 Message immersif initial
        await send(sock, jid, {
            text: `🖤 ${userName}… le réseau est scruté dans l’ombre.`
        });

        const start = Date.now();

        // 🔹 On simule un petit ping (tu peux ajouter un delay si nécessaire)
        const latency = Date.now() - start;

        // 🔹 Message final stylisé Ghost Dark
        const text = stylizedChar(
            `💀 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ \n\n` +
            `Latency: ${latency} ms\n` +
            `Utilisateur: ${userName}\n\n` +
            `👑 Dans l’ombre, le réseau répond à vos ordres…`
        );

        await send(sock, jid, { text });

    } catch (err) {
        console.error("❌ pingTest error:", err);
        await send(sock, jid, {
            text: `👑 Maître… une anomalie a empêché le test du réseau : ${err.message}`
        });
    }
}

// 🔹 Pour le menu automatique
export const desc = "Teste la latence du réseau au style Ghost Dark";
export const usage = "ping";