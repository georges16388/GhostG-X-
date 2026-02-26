import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import pino from 'pino';
import { PREFIX, BOT_NUMBER } from "../config.js";

const SESSION_FOLDER = './sessionData';

// 📁 Création du dossier session
if (!fs.existsSync(SESSION_FOLDER)) {
    fs.mkdirSync(SESSION_FOLDER, { recursive: true });
    console.log('📁 sessionData créé automatiquement');
}

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    console.log('📦 Baileys version:', version.join('.'));

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        syncFullHistory: false,
    });

    // 🔁 Sauvegarde creds
    sock.ev.on('creds.update', saveCreds);

    let isHandlerRegistered = false;

    // 🔌 Gestion connexion
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        console.log('🔔 Connection:', connection);

        // ❌ Déconnexion
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log('❌ Déconnecté. Reconnexion:', shouldReconnect);

            if (shouldReconnect) {
                connectToWhatsapp(handleMessage); // 🔁 RECONNECT
            } else {
                console.log('🚫 Session supprimée, reconnecte avec pairing code');
            }
        }

        // ✅ Connexion réussie
        if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp !');

            // 🔥 Enregistrement handler UNE FOIS
            if (!isHandlerRegistered) {
                sock.ev.on('messages.upsert', async (msg) => {
                    try {
                        await handleMessage(sock, msg, { PREFIX, BOT_NUMBER });
                    } catch (err) {
                        console.error('❌ Handler error:', err);
                    }
                });
                isHandlerRegistered = true;
            }

            // 👻 MESSAGE DE BIENVENUE
            try {
                const chatId = sock.user.id;
                const imagePath = './database/menu(0).jpg';

                const welcomeText = `
╔═════════════════════════╗
║      👻 ᴏᴍʙʀᴇ ɢʜᴏsᴛ ɢ-𝐗 👻      ║
╠═════════════════════════╣
║ 🔥 le spectre s’éveille...            ║
║ ⚡ les ténèbres obéissent à votre volonté ║
║ 💀 votre sanctuaire est sécurisé      ║
╠═════════════════════════╣
> 🌑 dans l’ombre, je veille sur les artefacts  
> ᴊᴇꜱᴜꜱ ᴛ’ᴀɪᴍᴇ ᴍᴇ̂ᴍᴇ ᴅᴀɴs ʟ’ᴏᴍʙʀᴇ
╚═════════════════════════╝
`;

                let messageOptions;

                if (fs.existsSync(imagePath)) {
                    messageOptions = {
                        image: fs.readFileSync(imagePath),
                        caption: welcomeText
                    };
                } else {
                    messageOptions = { text: welcomeText };
                }

                await sock.sendMessage(chatId, messageOptions);
                console.log('📩 Welcome envoyé');

            } catch (err) {
                console.error('❌ Erreur welcome:', err);
            }
        }
    });

    return sock;
}

// ✅ EXPORT IMPORTANT
export default connectToWhatsapp;