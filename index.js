'use strict';

/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * ✅ FUSION V5.4 SUPREME — Version blindée
 */

process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR              = '/tmp/puppeteer_cache_disabled';

// ============================================================
// IMPORTS SYSTÈME
// ============================================================
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs   = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const os   = require('os');

// ============================================================
// MODULES INTERNES
// ============================================================
const config  = require('./config');
const handler = require('./handler');
global.config = config;

// Utils optionnels (ne crashent pas si absents)
try { const { initializeTempSystem } = require('./utils/tempManager'); initializeTempSystem(); } catch {}
try { const { startCleanup }         = require('./utils/cleanup');     startCleanup();         } catch {}

// ============================================================
// FILTRAGE INTELLIGENT DES LOGS
// ============================================================
const _log   = console.log.bind(console);
const _error = console.error.bind(console);
const _warn  = console.warn.bind(console);

const NOISE = [
    'closing session', 'sessionentry', 'prekey bundle',
    'ratchet', 'signal protocol', 'ephemeralkeypair',
    'bad mac', 'decrypt'
];
const filterLog = (fn, args) => {
    const str = args.map(a => (typeof a === 'string' ? a : (a instanceof Error ? a.message : JSON.stringify(a)))).join(' ').toLowerCase();
    if (!NOISE.some(p => str.includes(p))) fn(...args);
};
console.log   = (...a) => filterLog(_log,   a);
console.error = (...a) => filterLog(_error, a);
console.warn  = (...a) => filterLog(_warn,  a);

// ============================================================
// LOG FICHIER CRASH
// ============================================================
const logFile = path.join(__dirname, 'bot-crash.log');
const logError = (msg, err) => {
    const s = `[${new Date().toISOString()}] ❌ ${msg}: ${err?.stack || err}\n`;
    _error(s);
    try { fs.appendFileSync(logFile, s); } catch {}
};

fs.ensureDirSync(path.join(__dirname, 'tmp'));
fs.ensureDirSync(path.join(__dirname, 'database'));

// ============================================================
// STORE MAISON (messages en mémoire pour retry/anti-delete)
// ============================================================
global.store = {
    messages: {},
    bind: (ev) => {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                const jid = msg.key?.remoteJid;
                if (!jid || !msg.message) continue;
                if (!global.store.messages[jid]) global.store.messages[jid] = [];
                global.store.messages[jid].push(msg);
                // Limite à 200 messages par JID pour éviter la fuite mémoire
                if (global.store.messages[jid].length > 200)
                    global.store.messages[jid].shift();
            }
        });
    },
    loadMessage: async (jid, id) => {
        if (!jid || !id) return null;
        return global.store.messages[jid]?.find(m => m.key.id === id) || null;
    },
};

// ============================================================
// SÉCURITÉ OWNER / SUPREME
// ============================================================
const normalizeNum = (jid) =>
    String(jid || '').replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');

global.isSupreme = (jid) => {
    if (!jid) return false;
    return normalizeNum(jid) === String(global.config.supremeNumber).replace(/\D/g, '');
};

global.isOwner = (jid) => {
    if (!jid) return false;
    const n = normalizeNum(jid);
    if (n === String(global.config.supremeNumber).replace(/\D/g, '')) return true;
    const owners = Array.isArray(global.config.ownerNumber)
        ? global.config.ownerNumber
        : [global.config.ownerNumber];
    return owners.filter(Boolean).some(o => String(o).replace(/\D/g, '') === n);
};

const toSmallCaps = (text) => {
    const f = {
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ',
        'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
        'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
        'y':'ʏ','z':'ᴢ'
    };
    return String(text).toLowerCase().split('').map(c => f[c] || c).join('');
};

// ============================================================
// QUEUE ANTI-DOUBLON
// ============================================================
const MAX_QUEUE_SIZE = 100;
const messageQueue   = [];
let processing           = false;
let processingStartedAt  = 0;

// IDs persistants entre reconnexions (TTL 10 min)
const globalProcessedIds        = new Set();
const globalProcessedTimestamps = new Map();
const GLOBAL_TTL = 10 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [id, ts] of globalProcessedTimestamps) {
        if (now - ts > GLOBAL_TTL) {
            globalProcessedIds.delete(id);
            globalProcessedTimestamps.delete(id);
        }
    }
}, 5 * 60 * 1000);

const markProcessed      = (id) => { globalProcessedIds.add(id); globalProcessedTimestamps.set(id, Date.now()); };
const isAlreadyProcessed = (id) => globalProcessedIds.has(id);

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
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Handler timeout 25s')), 25_000))
                ]);
            } catch (err) { logError('Handler Crash', err); }
            processingStartedAt = Date.now();
        }
    } finally {
        processing = false;
        processingStartedAt = 0;
    }
}

function clearQueue() {
    messageQueue.length = 0;
    processing = false;
    processingStartedAt = 0;
}

// Déblocage automatique toutes les 30s
setInterval(() => {
    const now = Date.now();
    if (!processing && messageQueue.length > 0) {
        processQueue().catch(err => logError('Queue Recovery', err));
        return;
    }
    if (processing && processingStartedAt > 0 && now - processingStartedAt > 30_000) {
        console.warn('⚠️ [Queue] Bloquée > 30s — force reset.');
        processing = false;
        processingStartedAt = 0;
        processQueue().catch(err => logError('Queue Force Reset', err));
    }
}, 30_000);

// ============================================================
// NETTOYAGE PUPPETEER
// ============================================================
function cleanupPuppeteerCache() {
    try {
        const d = path.join(os.homedir(), '.cache', 'puppeteer');
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    } catch {}
}
// ============================================================
// DÉMARRAGE BOT
// ============================================================
let reconnectAttempts = 0;
const MAX_RECONNECT   = 8;
const MAX_RECONNECT_DELAY = 60_000;
let isShuttingDown = false;

async function startBot() {
    if (isShuttingDown) return;

    const sessionFolder = path.join(__dirname, global.config.sessionName || 'session');
    fs.ensureDirSync(sessionFolder);

    // ── Injection session via sessionID compressé ──
    if (config.sessionID && config.sessionID.includes('!')) {
        try {
            const b64 = config.sessionID.split('!')[1];
            const dec = zlib.gunzipSync(Buffer.from(b64, 'base64'));
            fs.writeFileSync(path.join(sessionFolder, 'creds.json'), dec);
            console.log('📡 [Session] Clés injectées depuis sessionID.');
        } catch (e) { console.error('❌ [Session] Injection error:', e.message); }
    }

    // ── FIX BAD MAC : purge clés Signal corrompues SANS toucher creds.json ──
    try {
        const credsPath = path.join(sessionFolder, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            fs.emptyDirSync(sessionFolder);
            console.log('🛡️ [Session] Première installation — session vierge.');
        } else {
            const files = fs.readdirSync(sessionFolder);
            let purged = 0;
            for (const file of files) {
                if (
                    file.startsWith('sender-key-') ||
                    file.startsWith('session-') ||
                    file.startsWith('app-state-sync-key-')
                ) {
                    fs.removeSync(path.join(sessionFolder, file));
                    purged++;
                }
            }
            if (purged > 0) console.log(`🧹 [Session] ${purged} clé(s) Signal purgée(s).`);
            else console.log('✅ [Session] Session propre.');
        }
    } catch (e) { console.error('❌ [Session] Erreur nettoyage:', e); }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    // ── Création du socket ──
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu('Chrome'),

        // FIX BAD MAC : utiliser makeCacheableSignalKeyStore pour éviter
        // les corruptions de clés lors des reconnexions rapides
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },

        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,

        shouldSyncHistoryMessage: () => false,
        retryRequestDelayMs: 500,
        maxMsgRetryCount: 5,

        // Cache groupe unifié avec handler.js via global.groupMetadataCache
        cachedGroupMetadata: async (jid) => {
            const cached = global.groupMetadataCache?.get(jid);
            if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
            return undefined;
        },

        // FIX messages boutons/listes multi-device
        patchMessageBeforeSending: (msg) => {
            if (msg.buttonsMessage || msg.listMessage) {
                msg = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadataVersion: 2 },
                            ...msg
                        }
                    }
                };
            }
            return msg;
        },

        shouldIgnoreJid: (jid) => jid === 'status@broadcast',

        getMessage: async (key) => {
            const msg = await global.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: 'GhostG-X' };
        }
    });

    sock.ev.on('creds.update', saveCreds);
    global.store.bind(sock.ev);

    // ── Pairing Code (uniquement si pas encore enregistré) ──
    if (!sock.authState.creds.registered) {
        const phone = String(global.config.supremeNumber || '').replace(/\D/g, '');
        if (phone) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phone);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    _log(`\n╔════════════════════════════════════╗`);
                    _log(`║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║`);
                    _log(`║          ${code.padEnd(12)}          ║`);
                    _log(`╚════════════════════════════════════╝\n`);
                } catch (err) { logError('Pairing Error', err); }
            }, 3000);
        } else {
            console.error('❌ [Config] supremeNumber manquant — pairing code impossible.');
        }
    }

    // ── Événements connexion ──
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Afficher le QR si disponible (fallback si pairing ne marche pas)
        if (qr) console.log('📱 [QR] Scannez le QR code si le pairing ne fonctionne pas.');

        if (connection === 'close') {
            clearQueue();
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            // Déconnexion définitive : pas de reconnexion
            if (statusCode === DisconnectReason.loggedOut) {
                isShuttingDown = true;
                console.log('🔴 [Bot] Déconnecté définitivement (logged out). Relancez le bot manuellement.');
                return;
            }

            // Trop de tentatives : arrêt pour éviter un ban
            if (reconnectAttempts >= MAX_RECONNECT) {
                isShuttingDown = true;
                console.error(`🚨 [Bot] ${MAX_RECONNECT} tentatives échouées. Arrêt pour éviter un ban. Relancez manuellement.`);
                process.exit(1);
            }

            reconnectAttempts++;
            const delay = Math.min(5000 * reconnectAttempts, MAX_RECONNECT_DELAY);
            const reason = statusCode || lastDisconnect?.error?.message || 'inconnue';
            console.log(`⚠️ [Bot] Déconnexion (${reason}). Reconnexion dans ${delay / 1000}s... (tentative ${reconnectAttempts}/${MAX_RECONNECT})`);
            setTimeout(() => startBot().catch(err => logError('Reconnexion Error', err)), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            _log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');

            // Enregistrer l'instance socket pour les notifications crash du handler
            try { handler._setSock && handler._setSock(sock); } catch {}

            try {
                const totalCmds = global.commands?.size || 0;
                const ownerNum  = String(global.config.supremeNumber || '');
                const botJid    = sock.user.id.replace(/:[0-9]+@/, '@').split(':')[0] + '@s.whatsapp.net';
                const ownerJid  = `${ownerNum}@s.whatsapp.net`;

                const welcomeCaption =
                    `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
                    `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                    `┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n` +
                    `┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]\n` +
                    `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n` +
                    `┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* : ${global.config.social?.channel || 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'}\n\n` +
                    `📢 *ᴄʜᴀɪɴᴇ ᴛᴇʟᴇɢʀᴀᴍ* : https://t.me/ghostgxbot\n\n` +
                    `👥 *ɢʀᴏᴜᴘᴇ* : ${global.config.social?.group || 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf'}\n\n` +
                    `💻 *ᴅᴇᴠ* : wa.me/${ownerNum}\n\n` +
                    `📖 _*"ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ"*_ ❤️✝️\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                // Envoi image de démarrage au bot lui-même
                await sock.sendMessage(botJid, {
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
                    caption: welcomeCaption,
                    contextInfo: {
                        mentionedJid: [botJid, ownerJid],
                        isForwarded: true,
                        forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.config.social?.channelJid || '120363425540434745@newsletter',
                            newsletterName: global.config.social?.channelName || 'ɢʜᴏsᴛɢ-x',
                            serverMessageId: 143
                        }
                    }
                }).catch(() => {});
  // Alerte au owner
                await sock.sendMessage(ownerJid, {
                    text:
                        `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\n` +
                        `Le bot *ɢʜᴏsᴛɢ-x* vient de s'allumer !\n` +
                        `Mode : ${global.config.selfMode ? 'Privé 🔒' : 'Public 🌐'}\n` +
                        `Commandes : ${totalCmds}`
                }).catch(() => {});

                // Message communauté — une seule fois au premier déploiement
                const deployFlagPath = path.join(__dirname, 'database', '.deployed');
             //ici   if (!fs.existsSync(deployFlagPath)) {
    try {
        // Attente de 2 secondes pour laisser le temps à la connexion de se stabiliser
        await new Promise(r => setTimeout(r, 2000));
        
        // Envoi du message de bienvenue
        await sock.sendMessage(ownerJid, {
            text:
                `╭╼━≪• 🌐 *ʙɪᴇɴᴠᴇɴᴜᴇ ᴅᴀɴs ɢʜᴏsᴛɢ-x* •≫━╾╮\n` +
                `┃ Merci d'avoir déployé *ɢʜᴏsᴛɢ-x* ! 🙏🏾\n┃\n` +
                `┃ 👥 *ɢʀᴏᴜᴘᴇ ᴏғғɪᴄɪᴇʟ* :\n` +
                `┃ https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf\n┃\n` +
                `┃ 📢 *ᴄʜᴀɪɴᴇ ᴏғғɪᴄɪᴇʟʟᴇ* :\n` +
                `┃ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n┃\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
        });

        console.log("Message de premier déploiement envoyé au propriétaire.");

        // IMPORTANT : Créer le fichier "flag" pour ne plus repasser ici au prochain démarrage
        fs.writeFileSync(deployFlagPath, 'deployee'); 

    } catch (error) {
        console.error("Erreur lors de l'envoi du message de déploiement :", error);
    }
}
        
                        });
                        fs.writeFileSync(deployFlagPath, new Date().toISOString());
                        console.log('✅ [Community] Message déployeur envoyé.');
                    } catch (e) { console.error('❌ [Community] Erreur:', e); }
                }

            } catch (err) { logError('Notification Error', err); }
        }
    });

    // ── Messages entrants ──
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        // FIX : accepter aussi 'append' pour les messages d'historique récents
        if (type !== 'notify' && type !== 'append') return;
        if (type === 'append') return; // append = historique, on ignore

        const now    = Date.now();
        const prefix = global.config.prefix || '.';

        for (const msg of messages) {
            try {
                if (!msg?.message || !msg?.key?.id) continue;
                if (msg.key.remoteJid === 'status@broadcast') continue;

                // Extraction du texte pour la logique fromMe
                const text =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    msg.message.videoMessage?.caption ||
                    msg.message.buttonsResponseMessage?.selectedButtonId ||
                    msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                    msg.message.templateButtonReplyMessage?.selectedId || '';

                const senderJid = msg.key.participant || msg.key.remoteJid;

                // fromMe INTELLIGENT :
                // - Bloque les messages normaux du bot (évite boucles)
                // - Laisse passer les commandes du supreme depuis son propre numéro
                const isCommand = text.startsWith(prefix) ||
                    (text.startsWith('>') && global.isSupreme(senderJid));

                if (msg.key.fromMe && !isCommand) continue;

                // Filtre d'âge : ignore les messages de plus de 60s (décalage horloge)
                const msgTs = (msg.messageTimestamp || 0) * 1000;
                if (msgTs && now - msgTs > 60_000) {
                    markProcessed(msg.key.id);
                    continue;
                }

                // Anti-doublon persistant
                if (isAlreadyProcessed(msg.key.id)) continue;

                // Saturation queue
                if (messageQueue.length >= MAX_QUEUE_SIZE) {
                    console.warn(`⚠️ [Queue] Saturée (${messageQueue.length}), message ignoré.`);
                    markProcessed(msg.key.id);
                    continue;
                }

                markProcessed(msg.key.id);
                messageQueue.push({ sock, msg });

            } catch (e) { logError('Upsert Loop Error', e); }
        }

        processQueue().catch(err => logError('processQueue Error', err));
    });

    // FIX : messages.update — on ignorait silencieusement tous les updates.
    // Conservé léger, uniquement pour les updates qui portent du contenu réel.
    sock.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            // On ignore les simples ACK de statut de livraison
            if (update.update?.status !== undefined && Object.keys(update.update).length === 1) continue;
            // Ici tu peux ajouter la logique pour les messages édités si besoin
        }
    });

    // Anti-delete
    sock.ev.on('messages.delete', async (update) => {
        try { await handler.handleAntiDelete(sock, update); } catch (e) { logError('AntiDelete Event', e); }
    });

    // Welcome / Goodbye
    sock.ev.on('group-participants.update', async (u) => {
        try { await handler.handleGroupUpdate(sock, u); } catch (e) { logError('GroupUpdate Event', e); }
    });

    // Anti-call
    sock.ev.on('call', async (calls) => {
        if (!global.config.anticall) return;
        for (const call of calls) {
            try {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: `⚠️ *${toSmallCaps('appels interdits par ghostg-x security')}*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
                    });
                }
            } catch {}
        }
    });

    return sock;
}

// ============================================================
// LANCEMENT
// ============================================================
cleanupPuppeteerCache();
startBot().catch(err => logError('Global Boot Error', err));

// Gestion des erreurs globales non capturées
process.on('uncaughtException', (err) => {
    if (!err.message?.includes('ENOSPC') && !err.message?.includes('bad mac')) {
        logError('UncaughtException', err);
    }
});

process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    // Filtre les rejets Baileys non critiques
    if (!msg.includes('Connection Closed') && !msg.includes('bad mac')) {
        logError('UnhandledRejection', reason);
    }
});

process.on('SIGINT',  () => { isShuttingDown = true; _log('\n👋🏾 [Bot] Arrêt propre (SIGINT).'); process.exit(0); });
process.on('SIGTERM', () => { isShuttingDown = true; _log('\n👋🏾 [Bot] Arrêt propre (SIGTERM).'); process.exit(0); });

module.exports = { store: global.store };
