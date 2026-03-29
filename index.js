process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer_cache_disabled';

// ============================================================
// IMPORTS SYSTÈME
// ============================================================
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
} = require('@whiskeysockets/baileys');

const pino   = require('pino');
const fs     = require('fs-extra');
const path   = require('path');
const zlib   = require('zlib');
const os     = require('os');

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
// FILTRAGE INTELLIGENT DES LOGS (conservé de l'ancien index)
// ============================================================
const _log   = console.log.bind(console);
const _error = console.error.bind(console);
const _warn  = console.warn.bind(console);

const NOISE = ['closing session','sessionentry','prekey bundle','ratchet','signal protocol','ephemeralkeypair'];
const filterLog = (fn, args) => {
    const str = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ').toLowerCase();
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
// STORE MAISON
// ============================================================
global.store = {
    messages: {},
    bind: (ev) => {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                const jid = msg.key?.remoteJid;
                if (!jid) continue;
                if (!global.store.messages[jid]) global.store.messages[jid] = [];
                global.store.messages[jid].push(msg);
                if (global.store.messages[jid].length > 100)
                    global.store.messages[jid].shift();
            }
        });
    },
    loadMessage: async (jid, id) => {
        if (!jid || !global.store.messages[jid]) return null;
        return global.store.messages[jid].find(m => m.key.id === id) || null;
    },
};

// ============================================================
// SÉCURITÉ OWNER / SUPREME
// ============================================================
global.isSupreme = (jid) => {
    if (!jid) return false;
    const n = jid.replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');
    return n === String(global.config.supremeNumber);
};

global.isOwner = (jid) => {
    if (!jid) return false;
    const n = jid.replace(/:[0-9]+@/, '@').split('@')[0].replace(/\D/g, '');
    if (n === String(global.config.supremeNumber)) return true;
    const owners = Array.isArray(global.config.ownerNumber)
        ? global.config.ownerNumber : [global.config.ownerNumber];
    return owners.some(o => String(o).replace(/\D/g, '') === n);
};

const toSmallCaps = (text) => {
    const f = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => f[c] || c).join('');
};

// ============================================================
// QUEUE ANTI-DOUBLON
// ============================================================
const MAX_QUEUE_SIZE = 50;
const messageQueue  = [];
let processing          = false;
let processingStartedAt = 0;

// ✅ IDs persistants entre reconnexions (TTL 10 min)
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
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Handler timeout 25s')), 25000))
                ]);
            } catch (err) { logError("Handler Crash", err); }
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
        processQueue().catch(err => logError("Queue Recovery", err));
        return;
    }
    if (processing && processingStartedAt > 0 && now - processingStartedAt > 30000) {
        processing = false;
        processingStartedAt = 0;
        processQueue().catch(err => logError("Queue Force Reset", err));
    }
}, 30000);

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
const MAX_RECONNECT_DELAY = 30000;

async function startBot() {
    const sessionFolder = path.join(__dirname, global.config.sessionName || 'session');
    fs.ensureDirSync(sessionFolder);

    // ── Injection session via sessionID compressé (héritage ancien index) ──
    if (config.sessionID && config.sessionID.includes('!')) {
        try {
            const b64 = config.sessionID.split('!')[1];
            const dec = zlib.gunzipSync(Buffer.from(b64, 'base64'));
            fs.writeFileSync(path.join(sessionFolder, 'creds.json'), dec);
            console.log('📡 [Session] Clés injectées depuis sessionID.');
        } catch (e) { console.error('❌ [Session] Injection error:', e.message); }
    }

    // ✅ FIX BAD MAC : purge clés Signal corrompues SANS toucher creds.json
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
            if (purged > 0) console.log(`🧹 [Session] ${purged} clé(s) Signal purgée(s) — re-sync en cours.`);
            else console.log('✅ [Session] Session propre — déchiffrement actif.');
        }
    } catch (e) { console.error('❌ [Session] Erreur nettoyage:', e); }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        auth: state,

        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,

        // ✅ FIX BAD MAC — retry + sync désactivée
        shouldSyncHistoryMessage: () => false,
        retryRequestDelayMs: 500,
        maxMsgRetryCount: 10,
  // ✅ Cache groupe unifié avec handler.js via global.groupMetadataCache
        cachedGroupMetadata: async (jid) => {
            const cached = global.groupMetadataCache?.get(jid);
            if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
            return undefined;
        },

        // ✅ FIX messages boutons/listes multi-device
        patchMessageBeforeSending: (msg) => {
            if (msg.buttonsMessage || msg.listMessage) {
                msg = {
                    viewOnceMessage: {
                        message: { messageContextInfo: { deviceListMetadataVersion: 2 }, ...msg }
                    }
                };
            }
            return msg;
        },

        shouldIgnoreJid: () => false,

        getMessage: async (key) => {
            const msg = await global.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || { conversation: "GhostG-X V5.3" };
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
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { logError("Pairing Error", err); }
            }, 3000);
        }
    }

    // ── Événements connexion ──
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            clearQueue();
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = statusCode || lastDisconnect?.error?.toString();

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('🔴 [Bot] Déconnecté définitivement (logged out).');
                return;
            }

            reconnectAttempts++;
            const delay = Math.min(5000 * reconnectAttempts, MAX_RECONNECT_DELAY);
            console.log(`⚠️ [Bot] Déconnexion (${reason}). Reconnexion dans ${delay / 1000}s... (tentative ${reconnectAttempts})`);
            setTimeout(() => startBot(), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');

            // initializeAntiCall si dispo dans le handler
            try { handler.initializeAntiCall(sock); } catch {}

            try {
                const totalCmds = global.commands ? global.commands.size : 0;
                const ownerNum  = global.config.supremeNumber;
                const botJid    = sock.user.id.split(':')[0] + '@s.whatsapp.net';

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

                await sock.sendMessage(botJid, {
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' },
                    caption: welcomeCaption,
                    contextInfo: {
                        mentionedJid: [botJid, `${ownerNum}@s.whatsapp.net`],
                        isForwarded: true,
                        forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.config.social?.channelJid || '120363425540434745@newsletter',
                            newsletterName: global.config.social?.channelName || 'ɢʜᴏsᴛɢ-x',
                            serverMessageId: 143
                        }
                    }
                });

                await sock.sendMessage(`${ownerNum}@s.whatsapp.net`, {
                    text: `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\nLe bot *ɢʜᴏsᴛɢ-x* vient de s'allumer !\nMode : ${global.config.selfMode ? 'Privé 🔒' : 'Public 🌐'}`
                });

                // Message communauté — une seule fois au premier déploiement
                const deployFlagPath = path.join(__dirname, 'database', '.deployed');
                if (!fs.existsSync(deployFlagPath)) {
                    try {
                        await new Promise(r => setTimeout(r, 2000));
                        await sock.sendMessage(`${ownerNum}@s.whatsapp.net`, {
                            text:
                                `╭╼━≪• 🌐 *ʙɪᴇɴᴠᴇɴᴜᴇ ᴅᴀɴs ɢʜᴏsᴛɢ-x* •≫━╾╮\n` +
                                `┃ Merci d'avoir déployé *ɢʜᴏsᴛɢ-x* ! 🙏🏾\n┃\n` +
                                `┃ 👥 *ɢʀᴏᴜᴘᴇ ᴏғғɪᴄɪᴇʟ* :\n` +
                                `┃ https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf\n┃\n` +
                                `┃ 📢 *ᴄʜᴀɪɴᴇ ᴏғғɪᴄɪᴇʟʟᴇ* :\n` +
                                `┃ https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c\n┃\n` +
                                `┃ ❤️ _Ce message ne s'affiche qu'une seule fois._\n` +
                                `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
                                `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
                        });
                        fs.writeFileSync(deployFlagPath, new Date().toISOString());
                        console.log('✅ [Community] Message déployeur envoyé.');
                    } catch (e) { console.error('❌ [Community] Erreur:', e); }
                }

            } catch (err) { logError("Notification Error", err); }
        }
    });

    // ── Messages entrants ──
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const now    = Date.now();
        const prefix = global.config.prefix || '.';

        for (const msg of messages) {
            try {
                if (!msg.message || !msg.key?.id) continue;
                if (msg.key.remoteJid === 'status@broadcast') continue;

                // Extraction du texte
                const getText = (m) =>
                    m?.conversation ||
                    m?.extendedTextMessage?.text ||
                    m?.imageMessage?.caption ||
                    m?.videoMessage?.caption ||
                    m?.buttonsResponseMessage?.selectedButtonId ||
                    m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                    m?.templateButtonReplyMessage?.selectedId || '';

                const text      = getText(msg.message);
                const senderJid = msg.key.participant || msg.key.remoteJid;

                // ✅ fromMe INTELLIGENT (clé du fonctionnement de l'ancien index) :
                // Laisse passer les commandes du bot lui-même (supreme en self-reply)
                // Bloque uniquement ses messages normaux pour éviter les boucles
                const isCommand = text.startsWith(prefix) ||
                    (text.startsWith('>') && global.isSupreme(senderJid));

                if (msg.key.fromMe && !isCommand) continue;

                // ✅ Filtre d'âge 60s (tolérance décalage horloge serveur)
                const msgTimestamp = (msg.messageTimestamp || 0) * 1000;
                if (msgTimestamp && now - msgTimestamp > 60000) {
                    markProcessed(msg.key.id);
                    continue;
                }

                // ✅ Anti-doublon persistant — survit aux reconnexions
                if (isAlreadyProcessed(msg.key.id)) continue;

                // ✅ Saturation queue
                if (messageQueue.length >= MAX_QUEUE_SIZE) {
                    console.warn(`⚠️ [Queue] Saturée (${messageQueue.length}), message ignoré.`);
                    markProcessed(msg.key.id);
                    continue;
                }

                markProcessed(msg.key.id);
                messageQueue.push({ sock, msg });

            } catch (e) { logError("Upsert Loop Error", e); }
        }

        await processQueue().catch(err => logError("processQueue Error", err));
    });

    sock.ev.on('messages.update', async (updates) => {
        for (const { update } of updates) {
            if (update.status !== undefined && Object.keys(update).length === 1) continue;
        }
    });

    sock.ev.on('messages.delete', async (update) => {
        try { await handler.handleAntiDelete(sock, update); } catch {}
    });

    sock.ev.on('group-participants.update', async (u) => {
        try { await handler.handleGroupUpdate(sock, u); } catch {}
    });

    sock.ev.on('call', async (node) => {
        if (!global.config.anticall) return;
        try {
            for (const call of node) {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: `⚠️ *${toSmallCaps("appels interdits par ghostg-x security")}*`
                    });
                }
            }
        } catch {}
    });

    return sock;
}

// ============================================================
// LANCEMENT
// ============================================================
cleanupPuppeteerCache();
startBot().catch(err => logError("Global Boot Error", err));

process.on('uncaughtException', (err) => {
    if (!err.message?.includes('ENOSPC')) logError('UncaughtException', err);
});

process.on('unhandledRejection', (err) => {
    logError('UnhandledRejection', err);
});

module.exports = { store: global.store };
