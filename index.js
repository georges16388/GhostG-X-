import connectToWhatsapp from './Digix/crew.js'
import handleIncomingMessage from './events/messageHandler.js'

(async () => {
    try {
        await connectToWhatsapp(handleIncomingMessage)
        console.log('✅ Connexion établie !')
    } catch (err) {
        console.error('❌ Erreur lors de la connexion à WhatsApp :', err)
        // Optionnel : redémarrage automatique ou notification à l’owner
        const ownerJid = "22677487520@s.whatsapp.net"
        // Si la connexion échoue, on peut prévenir le propriétaire
        // await client.sendMessage(ownerJid, { text: `Erreur critique : ${err.message}` })
    }
})()