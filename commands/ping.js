import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js";

export async function pingTest(sock, message) {
    const jid = message.key.remoteJid;
    const start = Date.now();

    // Message initial
    await send(sock, jid, { text: "📡 Pinging..." });

    const latency = Date.now() - start;

    // Message final avec latence
    const text = stylizedChar(
        `🚀 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ Network\n\n` +
        `Latency: ${latency} ms\n\n` +
        `-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗`
    );

    await send(sock, jid, { text });
}