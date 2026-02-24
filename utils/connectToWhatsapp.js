import dotenv from 'dotenv';
dotenv.config(); // 🔥 charge les variables du .env
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import fs from 'fs';
import pino from 'pino';
import path from 'path';
import configmanager from '../utils/configmanager.js';
import dotenv from 'dotenv';

dotenv.config(); // 🔥 charge les variables du .env

const SESSION_FOLDER = './sessionData';

// Création auto du dossier session
if (!fs.existsSync(SESSION_FOLDER)) {
    fs.mkdirSync(SESSION_FOLDER, { recursive: true });
    console.log('📁 sessionData créé automatiquement');
}

// Numéro et préfixe dynamiques
const BOT_NUMBER = process.env.BOT_NUMBER || '22677487520';
const PREFIX = process.env.PREFIX || '!';

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

            // --- WELCOME MESSAGE ---
            try {
                const chatId = `${BOT_NUMBER}@s.whatsapp.net`;
                const imagePath = './database/menu(0).jpg';
                let messageOptions;

                if (fs.existsSync(imagePath)) {
                    messageOptions = {
                        image: { url: imagePath },
                        caption: `
╔══════════════════╗
 *GhostG-X Bot Connected Successfully* 🚀
╠══════════════════╣
> Always Forward.
╚══════════════════╝

⚡ Phantom X System`,
                    };
                } else {
                    messageOptions = {
                        text: `GhostG-X Bot connecté avec succès ! 🚀`,
                    };
                }

                await sock.sendMessage(chatId, messageOptions);
                console.log('📩 Message envoyé');

            } catch (err) {
                console.error('❌ Erreur message:', err);
            }
        }
    });

    // --- PAIRING CODE ---
    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('⚠️ Pas connecté. Pairing...');

            try {
                const code = await sock.requestPairingCode(BOT_NUMBER);
                console.log('📲 CODE:', code);

                configmanager.config.users[BOT_NUMBER] = {
                    sudoList: [`${BOT_NUMBER}@s.whatsapp.net`],
                    tagAudioPath: 'tag.mp3',
                    antilink: true,
                    response: true,
                    autoreact: false,
                    prefix: PREFIX,
                    reaction: '🎯',
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