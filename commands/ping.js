import stylizedChar from "../utils/fancy.js"

export async function pingTest(client, message) {
    const remoteJid = message.key.remoteJid
    const start = Date.now()

    await client.sendMessage(remoteJid, { text: "📡 Pinging..." }, { quoted: message })

    const latency = Date.now() - start

    await client.sendMessage(remoteJid, {
        text: stylizedChar(
            `🚀 ⏤͟͟͞ＧＨＯＳＴＧ－Ｘ Network\n\n` +
            `Latency: ${latency} ms\n\n` +
            `⏤͟͟͞ＧＨＯＳＴＧ－Ｘ`
        )
    }, { quoted: message })
}