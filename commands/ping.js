import send from "../utils/sendMessage.js";
import stylizedChar from "../utils/fancy.js"

export async function pingTest(client, message) {
    const remoteJid = message.key.remoteJid
    const start = Date.now()

    await client.sendMessage(remoteJid, { text: "📡 Pinging..." }, { quoted: message })

    const latency = Date.now() - start

    await client.sendMessage(remoteJid, {
        text: stylizedChar(
            `🚀 -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ Network\n\n` +
            `Latency: ${latency} ms\n\n` +
            `-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗`
        )
    }, { quoted: message })
}