

/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * ✅ V5.5 SUPREME — Anti-déconnexion blindé
 */

process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR              = '/tmp/puppeteer_cache_disabled';

// ============================================================
// IMPORTS
// ============================================================
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
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

try { const { initializeTempSystem } = require('./utils/tempManager'); initializeTempSystem(); } catch {}
try { const { startCleanup }         = require('./utils/cleanup');     startCleanup();         } catch {}

// ============================================================
// LOGS FILTRÉS
// ============================================================
const _log   = console.log.bind(console);
const _error = console.error.bind(console);
const _warn  = console.warn.bind(console);

const NOISE = [
    'closing session', 'sessionentry', 'prekey bundle', 'ratchet',
    'signal protocol', 'ephemeralkeypair', 'bad mac', 'decrypt',
    'noise_', 'stream errored', 'timed out', 'keep-alive'
];
const filterLog = (fn, args) => {
    const str = args.map(a =>
        typeof a === 'string' ? a : (a instanceof Error ? a.message : JSON.stringify(a))
    ).join(' ').toLowerCase();
    if (!NOISE.some(p => str.includes(p))) fn(...args);
};
console.log   = (...a) => filterLog(_log,   a);
console.error = (...a) => filterLog(_error, a);
console.warn  = (...a) => filterLog(_warn,  a);

// ============================================================
// LOG CRASH
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
// STORE MAISON
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
        ? global.config.ownerNumber : [global.config.ownerNumber];
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
let processing          = false;
let processingStartedAt = 0;

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
                    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 25s')), 25_000))
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

setInterval(() => {
    const now = Date.now();
    if (!processing && messageQueue.length > 0) {
        processQueue().catch(err => logError('Queue Recovery', err));
        return;
    }
    if (processing && processingStartedAt > 0 && now - processingStartedAt > 30_000) {
        _warn('⚠️ [Queue] Bloquée > 30s — force reset.');
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
// KEEP-ALIVE — FIX PRINCIPAL PERTE DE CONNEXION
// WhatsApp déconnecte les sockets inactifs après ~3 min.
// On envoie une présence toutes les 25s pour maintenir vivant.
// ============================================================
let keepAliveInterval = null;

function startKeepAlive(sock) {
    stopKeepAlive();
    keepAliveInterval = setInterval(async () => {
        try {
            await sock.sendPresenceUpdate('available');
        } catch {
            // Silencieux — la reconnexion gère si le socket est mort
        }
    }, 25_000);
}

function stopKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
}

// ============================================================
// DÉMARRAGE BOT
// ============================================================
let reconnectAttempts = 0;
const MAX_RECONNECT       = 10;
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
            _log('📡 [Session] Clés injectées depuis sessionID.');
        } catch (e) { _error('❌ [Session] Injection error:', e.message); }
    }

    // ── FIX BAD MAC : purge des clés Signal corrompues ──
    try {
        const credsPath = path.join(sessionFolder, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            fs.emptyDirSync(sessionFolder);
            _log('🛡️ [Session] Première installation — session vierge.');
        } else {
            const files = fs.readdirSync(sessionFolder);
            let purged  = 0;
            for (const file of files) {
                if (
                    file.startsWith('sender-key-') ||
                    file.startsWith('session-') ||
                    file.startsWith('app-state-sync-key-')
                ) { fs.removeSync(path.join(sessionFolder, file)); purged++; }
            }
            _log(purged > 0
                ? `🧹 [Session] ${purged} clé(s) Signal purgée(s).`
                : '✅ [Session] Session propre.');
        }
    } catch (e) { _error('❌ [Session] Erreur nettoyage:', e); }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version }          = await fetchLatestBaileysVersion();

    // ── Création du socket ──
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,

        // FIX CONNEXION : Browsers.baileys() est plus stable que ubuntu('Chrome')
        // ubuntu('Chrome') déclenche parfois des checks de sécurité WA → déconnexion
        browser: Browsers.baileys(),

        // FIX BAD MAC : makeCacheableSignalKeyStore évite les corruptions de clés
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },

        // FIX CONNEXION : keep-alive natif Baileys (complément au nôtre)
        keepAliveIntervalMs: 20_000,

        syncFullHistory:                false,
        markOnlineOnConnect:            true,
        generateHighQualityLinkPreview: true,
        shouldSyncHistoryMessage:       () => false,

        // FIX CONNEXION : moins de retries = moins de trafic = moins de risk ban/déco
        retryRequestDelayMs: 1000,
        maxMsgRetryCount:    3,

        // FIX CONNEXION : réduit le trafic d'init
        fireInitQueries: false,

        // Cache groupe unifié avec handler.js
        cachedGroupMetadata: async (jid) => {
            const cached = global.groupMetadataCache?.get(jid);
            if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
            return undefined;
        },

        // Fix boutons/listes multi-device
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

        // FIX CONNEXION : isJidBroadcast couvre status@broadcast + tous les autres broadcasts
        shouldIgnoreJid: (jid) => isJidBroadcast(jid),

        getMessage: async (key) => {
            const msg = await global.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: 'GhostG-X' };
        }
    });

    sock.ev.on('creds.update', saveCreds);
    global.store.bind(sock.ev);

    // ── Pairing Code ──
    if (!sock.authState.creds.registered) {
        const phone = String(global.config.supremeNumber || '').replace(/\D/g, '');
        if (phone) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phone);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    _log(`\n╔════════════════════════════════════╗`);
                    _log(`║   ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :        ║`);
                    _log(`║       ${String(code).padEnd(20)}   ║`);
                    _log(`╚════════════════════════════════════╝\n`);
                } catch (err) { logError('Pairing Error', err); }
            }, 3000);
        } else {
            _error('❌ [Config] supremeNumber manquant — pairing code impossible.');
        }
    }

    // ── Événements connexion ──
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) _log('📱 [QR] Scannez le QR code si le pairing ne fonctionne pas.');
        if (connection === 'connecting') _log('🔄 [Bot] Connexion en cours...');

        if (connection === 'close') {
            stopKeepAlive();
            clearQueue();

            const error      = lastDisconnect?.error;
            const statusCode = error?.output?.statusCode;

            _log(`🔴 [Bot] Connexion fermée — Code: ${statusCode || 'N/A'} | ${error?.message || 'raison inconnue'}`);

            // Session expirée → purge + arrêt
            if (statusCode === DisconnectReason.loggedOut) {
                isShuttingDown = true;
                _log('🔴 [Bot] Session expirée. Purge du dossier session/ en cours...');
                try { fs.emptyDirSync(sessionFolder); } catch {}
                _log('✅ Session purgée. Relancez le bot pour rescanner.');
                return;
            }

            // Restart propre demandé par Baileys (ex: stream-errored)
            if (statusCode === DisconnectReason.restartRequired) {
                _log('🔁 [Bot] Restart requis — reconnexion immédiate.');
                setTimeout(() => startBot().catch(err => logError('Reconnexion Error', err)), 1000);
                return;
            }

            // Trop de tentatives → process.exit
            if (reconnectAttempts >= MAX_RECONNECT) {
                isShuttingDown = true;
                _error(`🚨 [Bot] ${MAX_RECONNECT} tentatives échouées. Relancez manuellement.`);
                process.exit(1);
            }

            // Reconnexion avec backoff exponentiel
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, MAX_RECONNECT_DELAY);
            _log(`⚠️ [Bot] Reconnexion dans ${delay / 1000}s... (${reconnectAttempts}/${MAX_RECONNECT})`);
            setTimeout(() => startBot().catch(err => logError('Reconnexion Error', err)), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            _log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !\n');

            // Démarrer le keep-alive
            startKeepAlive(sock);

            try {
                const totalCmds = global.commands?.size || 0;
                const ownerNum  = String(global.config.supremeNumber || '');
                const rawId     = sock.user?.id || '';
                const botJid    = rawId.includes(':')
                    ? rawId.split(':')[0] + '@s.whatsapp.net'
                    : rawId;
                const ownerJid  = `${ownerNum}@s.whatsapp.net`;

                const welcomeCaption =
                    `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
                    `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                    `┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n` +
                    `┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]\n` +
                    `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n` +
                    `┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `📢 *ᴄʜᴀɪɴᴇ* : ${global.config.social?.channel || 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'}\n` +
                    `👥 *ɢʀᴏᴜᴘᴇ* : ${global.config.social?.group || 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf'}\n\n` +
                    `📖 _*"ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ"*_ ❤️✝️\n\n` +
                    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                await sock.sendMessage(botJid, {
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
                    caption: welcomeCaption,
                    contextInfo: {
                        mentionedJid: [botJid, ownerJid],
                        isForwarded: true,
                        forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:   global.config.social?.channelJid  || '120363425540434745@newsletter',
                            newsletterName:  global.config.social?.channelName || 'ɢʜᴏsᴛɢ-x',
                            serverMessageId: 143
                        }
                    }
                }).catch(() => {});

                await sock.sendMessage(ownerJid, {
                    text:
                        `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\n` +
                        `Le bot *ɢʜᴏsᴛɢ-x* est en ligne !\n` +
                        `Mode : ${global.config.selfMode ? 'Privé 🔒' : 'Public 🌐'} | Commandes : ${totalCmds}`
                }).catch(() => {});

                // Message déployeur — une seule fois
                const deployFlagPath = path.join(__dirname, 'database', '.deployed');
                if (!fs.existsSync(deployFlagPath)) {
                    await new Promise(r => setTimeout(r, 2000));
                    await sock.sendMessage(ownerJid, {
                        text:
                            `╭╼━≪• 🌐 *ʙɪᴇɴᴠᴇɴᴜᴇ ᴅᴀɴs ɢʜᴏsᴛɢ-x* •≫━╾╮\n` +
                            `┃ Merci d'avoir déployé *ɢʜᴏsᴛɢ-x* ! 🙏🏾\n┃\n` +
                            `┃ 👥 https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf\n` +
                            `┃ 📢 https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n┃\n` +
                            `┃ ❤️ _Ce message ne s'affiche qu'une seule fois._\n` +
                            `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                            `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
                    }).catch(() => {});
                    fs.writeFileSync(deployFlagPath, new Date().toISOString());
                    _log('✅ [Community] Message déployeur envoyé.');
                }

            } catch (err) { logError('Notification Error', err); }
        }
    });

    // ── Messages entrants ──
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const now    = Date.now();
        const prefix = global.config.prefix || '.';

        for (const msg of messages) {
            try {
                if (!msg?.message || !msg?.key?.id) continue;
                const jid = msg.key.remoteJid;
                if (!jid || isJidBroadcast(jid)) continue;

                const text =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    msg.message.videoMessage?.caption ||
                    msg.message.buttonsResponseMessage?.selectedButtonId ||
                    msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                    msg.message.templateButtonReplyMessage?.selectedId || '';

                const senderJid = msg.key.participant || jid;

                // fromMe intelligent
                const isCommand = text.startsWith(prefix) ||
                    (text.startsWith('>') && global.isSupreme(senderJid));
                if (msg.key.fromMe && !isCommand) continue;

                // Filtre âge 60s
                const msgTs = (msg.messageTimestamp || 0) * 1000;
                if (msgTs && now - msgTs > 60_000) {
                    markProcessed(msg.key.id);
                    continue;
                }

                // Anti-doublon
                if (isAlreadyProcessed(msg.key.id)) continue;

                // Queue saturée
                if (messageQueue.length >= MAX_QUEUE_SIZE) {
                    _warn(`⚠️ [Queue] Saturée (${messageQueue.length}), message ignoré.`);
                    markProcessed(msg.key.id);
                    continue;
                }

                markProcessed(msg.key.id);
                messageQueue.push({ sock, msg });

            } catch (e) { logError('Upsert Loop Error', e); }
        }

        processQueue().catch(err => logError('processQueue Error', err));
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

process.on('uncaughtException', (err) => {
    const m = err.message || '';
    if (!m.includes('ENOSPC') && !m.includes('bad mac') && !m.includes('Connection Closed')) {
        logError('UncaughtException', err);
    }
});

process.on('unhandledRejection', (reason) => {
    const m = reason instanceof Error ? reason.message : String(reason);
    if (!m.includes('Connection Closed') && !m.includes('bad mac') && !m.includes('timed out')) {
        logError('UnhandledRejection', reason);
    }
});

process.on('SIGINT',  () => { isShuttingDown = true; stopKeepAlive(); _log('\n [Bot] Arrêt propre.'); process.exit(0); });
process.on('SIGTERM', () => { isShuttingDown = true; stopKeepAlive(); _log('\n [Bot] Arrêt propre.'); process.exit(0); });

module.exports = { store: global.store };
