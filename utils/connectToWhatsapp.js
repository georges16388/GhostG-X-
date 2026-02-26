import send from "../utils/sendMessage.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import pino from 'pino';
import configmanager from '../utils/configmanager.js';
import { PREFIX, BOT_NUMBER } from "../config.js"; // import du config manuel

const SESSION_FOLDER = './sessionData';

// Création automatique du dossier session
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

    // Sauvegarde automatique des credentials
    sock.ev.on('creds.update', saveCreds);

    // Ici tu peux gérer la connection.update et messages.upsert comme avant
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        console.log('🔔 Connection update:', connection);
        if (lastDisconnect) console.log('🔔 Last disconnect:', lastDisconnect.error?.output?.statusCode);
    });

    let isHandlerRegistered = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp !');

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
        }
    });

    return sock;
}

// ✅ Export par défaut
export default connectToWhatsapp;