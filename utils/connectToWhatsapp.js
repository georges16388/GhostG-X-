import send from "../utils/sendMessage.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import pino from 'pino';
import configmanager from '../utils/configmanager.js';
import { PREFIX, BOT_NUMBER } from "../config.js";

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

    let isHandlerRegistered = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        console.log('🔔 Connection update:', connection);
        if (lastDisconnect) console.log('🔔 Last disconnect:', lastDisconnect.error?.output?.statusCode);

        if (connection === 'open') {
            console.log('✅ Connecté à WhatsApp !');

            // ✅ Évite double listener
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

            // --- Message de bienvenue Ghost ---
            try {
                const chatId = `${BOT_NUMBER}@s.whatsapp.net`;
                const imagePath = './database/menu(0).jpg';
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

                const messageOptions = fs.existsSync(imagePath)
                    ? { image: { url: imagePath }, caption: welcomeText }
                    : { text: welcomeText };

                await sock.sendMessage(chatId, messageOptions);
                console.log('📩 Message de bienvenue envoyé');

            } catch (err) {
                console.error('❌ Erreur message de bienvenue:', err);
            }
        }
    });

    return sock;
}

export default connectToWhatsapp;