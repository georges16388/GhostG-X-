/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.3 - FULL FUSION)
 * ✅ Version corrigée — déchiffrement, queue, auth, retry
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

// ==========================================
// MODULE 1 : CONFIGURATION & STORE
// ==========================================
const config = require('./config');
const handler = require('./handler');
global.config = config;

const logFile = path.join(__dirname, 'bot-crash.log');
const logError = (msg, err) => {
    const logStr = `[${new Date().toISOString()}] ❌ ${msg}: ${err.stack || err}\n`;
    console.error(logStr);
    try { fs.appendFileSync(logFile, logStr); } catch (e) {}
};

fs.ensureDirSync(path.join(__dirname, 'tmp'));
fs.ensureDirSync(path.join(__dirname, 'database'));

// ✅ STORE MAISON
global.store = {
    messages: {},
    bind: (ev) => {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                const jid = msg.key.remoteJid;
                if (!jid) continue;
                if (!global.store.messages[jid]) global.store.messages[jid] = [];
                global.store.messages[jid].push(msg);
                if (global.store.messages[jid].length > 100) {
                    global.store.messages[jid].shift();
                }
            }
        });
    },
    loadMessage: async (jid, id) => {
        if (!jid || !global.store.messages[jid]) return null;
        return global.store.messages[jid].find(m => m.key.id === id) || null;
    },
    readFromFile: () => {},
    writeToFile: () => {}
};

// ==========================================
// MODULE 2 : SÉCURITÉ & UTILITAIRES
// ==========================================
global.isSupreme = (jid) => {
    if (!jid) return false;
    const number = jid.replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');
    return number === String(global.config.supremeNumber);
};

global.isOwner = (jid) => {
    if (!jid) return false;
    const number = jid.replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');
    if (number === String(global.config.supremeNumber)) return true;
    const owners = Array.isArray(global.config.ownerNumber)
        ? global.config.ownerNumber
        : [global.config.ownerNumber];
    return owners.some(owner => String(owner).replace(/\D/g, '') === number);
};

const toSmallCaps = (text) => {
    const fonts = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
        'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
        'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
        'y':'ʏ','z':'ᴢ'
    };
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// ==========================================
// MODULE 3 : QUEUE ANTI-DOUBLON
// ==========================================
const MAX_QUEUE_SIZE = 50;
const messageQueue = [];
let processing = false;
let processingStartedAt = 0;

// ✅ IDs traités persistants GLOBALEMENT (survit aux reconnexions)
const globalProcessedIds = new Set();
const GLOBAL_TTL = 10 * 60 * 1000; // 10 minutes
const globalProcessedTimestamps = new Map();

// Nettoyage des IDs expirés toutes les 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, ts] of globalProcessedTimestamps) {
        if (now - ts > GLOBAL_TTL) {
            globalProcessedIds.delete(id);
            globalProcessedTimestamps.delete(id);
        }
    }
}, 5 * 60 * 1000);

const markProcessed = (id) => {
    globalProcessedIds.add(id);
    globalProcessedTimestamps.set(id, Date.now());
};

const isAlreadyProcessed = (id) => globalProcessedIds.has(id);

// ✅ FIX PRINCIPAL : timeout 25s par message + finally garanti + déblocage auto
async function processQueue() {
    if (processing) return;
    processing = true;
    processingStartedAt = Date.now();
    try {
        while (messageQueue.length) {
            const { sock, msg } = messageQueue.shift();
            try {
                await Promise.race([
                    handler.handleMessage(sock, msg),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Handler timeout 25s')), 25000)
                    )
                ]);
            } catch (err) {
                logError("Handler Message Crash", err);
            }
            processingStartedAt = Date.now(); // reset timer après chaque message
        }
    } finally {
        processing = false;
        processingStartedAt = 0;
    }
}

// ✅ Vide la queue proprement lors d'une reconnexion
function clearQueue() {
    messageQueue.length = 0;
    processing = false;
    processingStartedAt = 0;
}

// ✅ Déblocage automatique toutes les 30s si la queue est bloquée
setInterval(() => {
    const now = Date.now();
    // Cas 1 : processing = false mais queue non vide → relancer
    if (!processing && messageQueue.length > 0) {
        console.log('⚠️ [Queue] Relance automatique détectée.');
        processQueue().catch(err => logError("Queue Recovery Error", err));
        return;
    }
    // Cas 2 : processing = true depuis plus de 30s → force reset
    if (processing && processingStartedAt > 0 && now - processingStartedAt > 30000) {
        console.log('⚠️ [Queue] Blocage détecté — reset forcé.');
        processing = false;
        processingStartedAt = 0;
        processQueue().catch(err => logError("Queue Force Reset Error", err));
    }
}, 30 * 1000);

// ==========================================
// MODULE 4 : SOCKET & PAIRING CODE
// ==========================================
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // 30 secondes max

async function startBot() {
    const sessionFolder = path.join(__dirname, global.config.sessionName || 'session');
    fs.ensureDirSync(sessionFolder);

    // ✅ FIX DÉFINITIF "BAD MAC" : on ne nettoie QUE si creds.json est absent
    // (première installation ou session complètement perdue)
    // On ne touche JAMAIS aux sender-key / session au redémarrage normal
    // car leur suppression casse le déchiffrement des messages entrants.
    try {
        const credsPath = path.join(sessionFolder, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            fs.emptyDirSync(sessionFolder);
            console.log('🛡️ [Sécurité] Session vierge initialisée (premier démarrage).');
        } else {
            console.log('✅ [Session] Clés existantes conservées — déchiffrement actif.');
        }
    } catch (e) {
        // Dossier inaccessible, on continue
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'fatal' }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),

        // ✅ FIX CRITIQUE : auth: state (spread complet) au lieu de { creds, keys }
        // Cela inclut les signalCreds nécessaires au déchiffrement E2E
        auth: state,

        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,

        // ✅ FIX : retry automatique des messages échoués
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,

        shouldIgnoreJid: () => false,
        getMessage: async (key) => {
            if (global.store) {
                const msg = await global.store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "GhostG-X V5.3" };
        }
    });

    sock.ev.on('creds.update', saveCreds);
    global.store.bind(sock.ev);

    // --- LOGIQUE PAIRING CODE ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = String(global.config.supremeNumber).replace(/\D/g, '');
        if (phoneNumber) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { logError("Pairing Error", err); }
            }, 3000);
        }
    }

    // --- ÉVÉNEMENTS CONNEXION ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            clearQueue();

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = statusCode || lastDisconnect?.error?.toString();

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('🔴 Bot déconnecté définitivement (logged out).');
                return;
            }

            reconnectAttempts++;
            const delay = Math.min(5000 * reconnectAttempts, MAX_RECONNECT_DELAY);
            console.log(`⚠️ Déconnexion (${reason}). Reconnexion dans ${delay / 1000}s... (tentative ${reconnectAttempts})`);
            setTimeout(() => startBot(), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');

            try {
                const totalCmds = global.commands ? global.commands.size : 0;
                const ownerNum = global.config.supremeNumber;

                const welcomeCaption =
                    `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
                    `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                    `┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n` +
                    `┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]\n` +
                    `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n` +
                    `┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* : ${global.config.social.channel}\n\n` +
                    `📢 *ᴄʜᴀɪɴᴇ ᴛᴇʟᴇɢʀᴀᴍ* : https://t.me/ghostgxbot\n\n` +
                    `👥 *ɢʀᴏᴜᴘᴇ* : ${global.config.social.group}\n\n` +
                    `💻 *ᴅᴇᴠ* : wa.me/${ownerNum}\n\n` +
                    `📖 _*"ᴊᴇ ᴘᴜɪꜱ ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ"*_ ❤️✝️\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                await sock.sendMessage(sock.user.id, {
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
                    caption: welcomeCaption,
                    mentions: [`${ownerNum}@s.whatsapp.net`]
                });

                const ownerJid = `${ownerNum}@s.whatsapp.net`;
                await sock.sendMessage(ownerJid, {
                    text: `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\nLe bot *ɢʜᴏsᴛɢ-x* vient de s'allumer avec succès !\nMode : ${global.config.selfMode ? 'Privé 🔒' : 'Public 🌐'}`,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.config.social.channelJid || '120363425540434745@newsletter',
                            newsletterName: global.config.social.channelName || 'ɢʜᴏsᴛɢ-x',
                            serverMessageId: -1
                        }
                    }
                });

                // ✅ MESSAGE COMMUNAUTÉ — envoyé UNE SEULE FOIS au premier déploiement
                // Le flag .deployed empêche le renvoi à chaque redémarrage
                const deployFlagPath = path.join(__dirname, 'database', '.deployed');
                if (!fs.existsSync(deployFlagPath)) {
                    try {
                        await new Promise(r => setTimeout(r, 2000)); // légère pause
                        await sock.sendMessage(ownerJid, {
                            text:
                                `╭╼━≪• 🌐 *ʙɪᴇɴᴠᴇɴᴜᴇ ᴅᴀɴs ɢʜᴏsᴛɢ-x* •≫━╾╮\n` +
                                `┃\n` +
                                `┃ Merci d'avoir déployé *ɢʜᴏsᴛɢ-x* ! 🙏🏾\n` +
                                `┃\n` +
                                `┃ Pour recevoir les mises à jour,\n` +
                                `┃ obtenir du support et rejoindre\n` +
                                `┃ la communauté des déployeurs :\n` +
                                `┃\n` +
                                `┃ 👥 *ɢʀᴏᴜᴘᴇ ᴏғғɪᴄɪᴇʟ* :\n` +
                                `┃ https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf\n` +
                                `┃\n` +
                                `┃ 📢 *ᴄʜᴀɪɴᴇ ᴏғғɪᴄɪᴇʟʟᴇ* :\n` +
                                `┃ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n` +
                                `┃\n` +
                                `┃ ❤️ _Ce message ne s'affiche qu'une seule fois._\n` +
                                `┃\n` +
                                `*╰━━━━━━━━━━━━━━━━━━━━━━━╯*\n` +
                                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
                        });
                        // Crée le flag pour ne plus jamais renvoyer ce message
                        fs.writeFileSync(deployFlagPath, new Date().toISOString());
                        console.log('✅ [Community] Message de bienvenue déployeur envoyé.');
                    } catch (e) {
                        console.error('❌ [Community] Erreur envoi message déployeur:', e);
                    }
                }

            } catch (err) { logError("Notification Error", err); }
        }
    });

    // --- ÉVÉNEMENTS MESSAGES ---
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;

            const msgId = msg.key.id;

            if (isAlreadyProcessed(msgId)) continue;

            const msgTimestamp = (msg.messageTimestamp || 0) * 1000;
            const age = Date.now() - msgTimestamp;
            if (age > 30000) {
                markProcessed(msgId);
                continue;
            }

            // ✅ Limite stricte : on ignore si la queue est saturée
            if (messageQueue.length >= MAX_QUEUE_SIZE) {
                console.warn(`⚠️ [Queue] Saturée (${messageQueue.length}), message ignoré.`);
                markProcessed(msgId);
                continue;
            }

            markProcessed(msgId);
            messageQueue.push({ sock, msg });
        }

        // ✅ FIX : await + catch pour ne jamais laisser une erreur silencieuse bloquer la queue
        await processQueue().catch(err => logError("processQueue Error", err));
    });

    // ✅ Gestion des updates de statut (retry WhatsApp natif)
    sock.ev.on('messages.update', async (updates) => {
        for (const { key, update } of updates) {
            // Statut seul = accusé de réception, on ignore
            if (update.status !== undefined && Object.keys(update).length === 1) continue;
            // Ici on peut gérer d'autres cas d'update si nécessaire
        }
    });

    sock.ev.on('messages.delete', async (update) => {
        try { await handler.handleAntiDelete(sock, update); } catch (e) {}
    });

    sock.ev.on('group-participants.update', async (u) => {
        try { await handler.handleGroupUpdate(sock, u); } catch (e) {}
    });

    sock.ev.on('call', async (node) => {
        if (!global.config.anticall) return;
        try {
            for (let call of node) {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: `⚠️ *${toSmallCaps("appels interdits par ghostg-x security")}*`
                    });
                }
            }
        } catch (e) {}
    });
}

startBot().catch(err => logError("Global Boot Error", err));
