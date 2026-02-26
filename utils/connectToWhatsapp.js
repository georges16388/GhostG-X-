import send from "../utils/sendMessage.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import configmanager from '../utils/configmanager.js';

const SESSION_FOLDER = './sessionData';
import { PREFIX } from '../connectToWhatsApp.js'; // chemin relatif correct

// Utilisation
if (message.body.startsWith(PREFIX + 'antilink')) {
    // ton code ici
}
}

// ✅ Création auto du dossier session
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
        syncFullHistory: false,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    // 🔐 Sauvegarde automatique des credentials
    sock.ev.on('creds.update', saveCreds);

    let isHandlerRegistered = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log('❌ Déconnecté:', statusCode);

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Reconnexion...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Session supprimée. Reconnecte-toi.');
            }

        } else if (connection === 'connecting') {
            console.log('⏳ Connexion en cours...');

        } else if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp !');

            // ✅ Évite double listener
            if (!isHandlerRegistered) {
                sock.ev.on('messages.upsert', async (msg) => {
                    try {
                        await handleMessage(sock, msg);
                    } catch (err) {
                        console.error('❌ Handler error:', err);
                    }
                });
                isHandlerRegistered = true;
            }

            // --- WELCOME MESSAGE PREMIUM ---
            try {
                const chatId = `${BOT_NUMBER}@s.whatsapp.net`;
                const imagePath = './database/menu(0).jpg';
                let messageOptions;

                const welcomeText = `
╔═════════════════════════╗
║      👻 ᴏᴍʙʀᴇ ɢʜᴏsᴛ ɢ-𝐗 👻      ║
╠═════════════════════════╣
║ 🔥 Le spectre s’éveille...            ║
║ ⚡ Les ténèbres obéissent à votre volonté ║
║ 💀 Votre sanctuaire est sécurisé      ║
╠═════════════════════════╣
> 🌑 Dans l’ombre, je veille sur les artefacts  
> ᴊᴇꜱᴜꜱ ᴛ’ᴀɪᴍᴇ ᴍᴇ̂ᴍᴇ ᴅᴀɴs ʟ’ᴏᴍʙʀᴇ
╚═════════════════════════╝
`;

                if (fs.existsSync(imagePath)) {
                    messageOptions = {
                        image: { url: imagePath },
                        caption: welcomeText
                    };
                } else {
                    messageOptions = { text: welcomeText };
                }

                await sock.sendMessage(chatId, messageOptions);
                console.log('📩 Message de bienvenue envoyé');

            } catch (err) {
                console.error('❌ Erreur message de bienvenue:', err);
            }
        }
    });

    // --- PAIRING CODE ---
    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('⚠️ Pas connecté. Pairing...');

            try {
                const number = BOT_NUMBER;

                const code = await sock.requestPairingCode(number);
                console.log('📲 CODE:', code);

                // Config utilisateur par défaut
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    tagAudioPath: 'tag.mp3',
                    antilink: true,
                    response: true,
                    autoreact: false,
                    prefix: PREFIX,
                    reaction: '💀',
                    welcome: false,
                    record: true,
                    type: false,
                    publicMode: true,
                };
                configmanager.save();

            } catch (e) {
                console.error('❌ Pairing error:', e);
            }
        }
    }, 4000);

    return sock;
}

export default connectToWhatsapp;