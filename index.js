import connectToWhatsapp from './Digix/crew.js'
import handleIncomingMessage from './events/messageHandler.js'
import fs from 'fs'
import path from 'path'

// 📁 Fichier log pour erreurs critiques
const LOG_PATH = path.join('./logs', 'bot_errors.log')

// Fonction pour logger les erreurs critiques
function logError(err) {
    const time = new Date().toISOString()
    const message = `[${time}] ${err.stack || err}\n`
    console.error('❌ Erreur critique :', err)
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true })
    fs.appendFileSync(LOG_PATH, message)
}

async function startBot(retries = 0) {
    try {
        console.log('🚀 Lancement du bot GhostG-X...')
        await connectToWhatsapp(handleIncomingMessage)
        console.log('✅ Connexion établie !')
    } catch (err) {
        logError(err)

        // Limiter le nombre de retries pour éviter boucle infinie
        if (retries < 5) {
            const wait = 5000
            console.log(`🔄 Reconnexion dans ${wait / 1000}s... (tentative ${retries + 1}/5)`)
            setTimeout(() => startBot(retries + 1), wait)
        } else {
            console.log('⚠️ Nombre maximal de tentatives atteint. Vérifie le problème manuellement.')
        }
    }
}

// Démarrage
startBot()