// index.js
import connectToWhatsapp from './utils/connectToWhatsapp.js'; // ton nouveau fichier
import handleIncomingMessage from './events/messageHandler.js';

(async () => {
    const sock = await connectToWhatsapp(handleIncomingMessage);
    console.log('✅ GhostG-X Bot established !');
})();