import configmanager from '../utils/configmanager.js'

export async function autorecord(client, message) {
    try {
        const remoteJid = message.key.remoteJid
        const number = client.user.id.split(':')[0]

        if (!configmanager.config.users[number]) return
        if (!configmanager.config.users[number].record) return

        // 🔹 Juste en ligne au lieu de recording
        await client.sendPresenceUpdate('available', remoteJid)

    } catch (error) {
        console.error('Autorecord error:', error)
    }
}

export async function autotype(client, message) {
    try {
        const remoteJid = message.key.remoteJid
        const number = client.user.id.split(':')[0]

        if (!configmanager.config.users[number]) return
        if (!configmanager.config.users[number].type) return

        // 🔹 Delay aléatoire 30-45 secondes avant typing
        const delay = Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;

        setTimeout(async () => {
            await client.sendPresenceUpdate('composing', remoteJid)

            // 🔹 Revenir en ligne après 3 secondes
            setTimeout(async () => {
                await client.sendPresenceUpdate('available', remoteJid)
            }, 3000)

        }, delay)

    } catch (error) {
        console.error('Autotype error:', error)
    }
}

export default { autorecord, autotype }