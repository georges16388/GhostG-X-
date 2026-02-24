import send from "../utils/sendMessage.js";

export async function uptime(client, message) {
    const remoteJid = message.key.remoteJid;

    // Calcul de l'uptime
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    // Mémoire utilisée
    const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    // Texte stylisé
    const text = `┌─-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ ─┐
│
│ ⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
│ 💾 RAM Used: ${usedRAM} MB
│
│ "Beyond limits, we rise."
│     - ᴊᴇ́sᴜs ᴛ’ᴀɪᴍᴇ -
└────────────────────┘`;

    await client.sendMessage(remoteJid, { text });
}

export default uptime;