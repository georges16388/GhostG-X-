import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import pino from 'pino';
import configmanager from '../utils/configmanager.js';

const SESSION_FOLDER = './sessionData';

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    console.log('📦 Using Baileys version:', version.join('.'));

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // pas de QR ici
        syncFullHistory: true,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.toString() || 'unknown';
            console.log('❌ Disconnected:', reason, 'StatusCode:', statusCode);

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && reason !== 'unknown';
            if (shouldReconnect) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Logged out permanently. You need to pair again manually.');
            }

        } else if (connection === 'connecting') {
            console.log('⏳ Connecting...');
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connection established!');

            // --- WELCOME MESSAGE ---
            try {
                const chatId = '22677487520@s.whatsapp.net'; // ton numéro ou le groupe cible
                const imagePath = './database/DigixCo.jpg';

                let messageOptions = {
                    text: `
╔══════════════════╗
      *-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ Bot Connected Successfully* 🚀
╠══════════════════╣
> "Always Forward. GhostG-X bot, one of the best."
╚══════════════════╝
*-ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗*`,
                };

                if (fs.existsSync(imagePath)) {
                    messageOptions = {
                        image: { url: imagePath },
                        caption: messageOptions.text,
                        footer: '💻 Powered by -ّ⸙𓆩ᴘʜᴀɴᴛᴏᴍ ፝֟ 𝐗',
                    };
                }

                await sock.sendMessage(chatId, messageOptions);
                console.log('📩 Welcome message sent!');
            } catch (err) {
                console.error('❌ Error sending welcome message:', err);
            }

            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
        }
    });

    // --- PAIRING POUR PREMIÈRE CONNEXION ---
    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('⚠️ Not paired. Requesting pairing code...');
            try {
                const number = 22677487520; // ton numéro WhatsApp
                const pairingCode = await sock.requestPairingCode(number, 'GHOSTGX7');
                console.log('📲 Pairing Code:', pairingCode);
                console.log('👉 Enter this code in your WhatsApp app to pair.');

                // Configuration initiale après pairing
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    tagAudioPath: 'tag.mp3',
                    antilink: true,
                    response: true,
                    autoreact: false,
                    prefix: '.',
                    reaction: '🎯',
                    welcome: false,
                    record: true,
                    type: false,
                    publicMode: false,
                };
                configmanager.save();
            } catch (e) {
                console.error('❌ Error requesting pairing code:', e);
            }
        }
    }, 5000);

    return sock;
}

export default connectToWhatsapp;