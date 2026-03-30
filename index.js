/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * Base : version qui fonctionnait + fixes stables
 */

process.env.PUPPETEER_SKIP_DOWNLOAD          = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR              = '/tmp/puppeteer_cache_disabled';

// --- UTILS OPTIONNELS (ne crashent pas si absents) ---
try { const { initializeTempSystem } = require('./utils/tempManager'); initializeTempSystem(); } catch {}
try { const { startCleanup }         = require('./utils/cleanup');     startCleanup();         } catch {}

// --- FILTRAGE INTELLIGENT DES LOGS ---
const _log   = console.log.bind(console);
const _error = console.error.bind(console);
const _warn  = console.warn.bind(console);

const NOISE_PATTERNS = [
    'closing session', 'sessionentry', 'prekey bundle',
    'ratchet', 'signal protocol', 'ephemeralkeypair',
    'bad mac', 'decrypt'
];
const filterLogs = (fn, args) => {
    const msg = args.map(a => typeof a === 'string' ? a : (a instanceof Error ? a.message : JSON.stringify(a))).join(' ').toLowerCase();
    if (!NOISE_PATTERNS.some(p => msg.includes(p))) fn(...args);
};
console.log   = (...a) => filterLogs(_log,   a);
console.error = (...a) => filterLogs(_error, a);
console.warn  = (...a) => filterLogs(_warn, a);

// --- DÉPENDANCES ---
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
} = require('@whiskeysockets/baileys');

const config  = require('./config');
const handler = require('./handler');
const fs      = require('fs-extra');
const path    = require('path');
const zlib    = require('zlib');
const os      = require('os');

global.config = config;

// --- LOG CRASH FICHIER ---
const logFile = path.join(__dirname, 'bot-crash.log');
const logError = (ctx, err) => {
    const s = `[${new Date().toISOString()}] ❌ ${ctx}: ${err?.stack || err}\n`;
    _error(s);
    try { fs.appendFileSync(logFile, s); } catch {}
};

fs.ensureDirSync(path.join(__dirname, 'tmp'));
fs.ensureDirSync(path.join(__dirname, 'database'));

// --- NETTOYAGE PUPPETEER ---
function cleanupPuppeteerCache() {
    try {
        const d = path.join(os.homedir(), '.cache', 'puppeteer');
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    } catch {}
}

// ============================================================
// STORE MESSAGES (anti-delete + retry)
// ============================================================
const store = {
    messages: new Map(),
    maxPerChat: 50,
    bind(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key?.id || !msg.message) continue;
                const jid = msg.key.remoteJid;
                if (!store.messages.has(jid)) store.messages.set(jid, new Map());
                const chat = store.messages.get(jid);
                chat.set(msg.key.id, msg);
                if (chat.size > store.maxPerChat) {
                    chat.delete(chat.keys().next().value);
                }
            }
        });
    }
};
global.store = store;

// ============================================================
// SÉCURITÉ OWNER / SUPREME
// ============================================================
const normalizeNum = (jid) => {
    if (!jid) return '';
    return String(jid)
        .replace(/:\d+@/, '@')   // FIX multi-device : retire :12@
        .split('@')[0]
        .replace(/\D/g, '');
};

global.isSupreme = (jid) => {
    if (!jid) return false;
    return normalizeNum(jid) === String(config.supremeNumber || '').replace(/\D/g, '');
};

global.isOwner = (jid) => {
    if (!jid) return false;
    const n = normalizeNum(jid);
    if (n === String(config.supremeNumber || '').replace(/\D/g, '')) return true;
    const raw = config.ownerNumber;
    if (!raw) return false;
    const owners = Array.isArray(raw) ? raw : [raw];
    return owners.filter(Boolean).some(o => String(o).replace(/\D/g, '') === n);
};

// ============================================================
// ANTI-DOUBLON PERSISTANT (survit aux reconnexions)
// IDs gardés 10 min — évite de retraiter les commandes
// si le bot se reconnecte dans les 10 minutes
// ============================================================
const processedIds  = new Set();
const processedTs   = new Map();
const PROCESSED_TTL = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
    const now = Date.now();
    for (const [id, ts] of processedTs) {
        if (now - ts > PROCESSED_TTL) {
            processedIds.delete(id);
            processedTs.delete(id);
        }
    }
}, 5 * 60 * 1000);

const markSeen  = (id) => { processedIds.add(id); processedTs.set(id, Date.now()); };
const alreadySeen = (id) => processedIds.has(id);

// ============================================================
// QUEUE PARALLÈLE PAR JID
// Chaque groupe / contact a sa propre queue indépendante.
// → Les groupes ne se bloquent pas entre eux.
// → Les commandes sont prioritaires dans chaque queue.
// ============================================================
const MAX_CONCURRENT    = 8;   // chats traités en même temps max
const MAX_PER_JID       = 15;  // messages en attente par chat max
const CMD_TIMEOUT_MS    = 12_000;
const MSG_TIMEOUT_MS    =  5_000;

const jidQueues     = new Map();
const jidProcessing = new Set();
let   activeWorkers = 0;

const isCmd = (msg) => {
    const prefix = config?.prefix || '.';
    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || '';
    return text.trimStart().startsWith(prefix) || text.trimStart().startsWith('>');
};

async function processJidQueue(sock, jid) {
    if (jidProcessing.has(jid) || activeWorkers >= MAX_CONCURRENT) return;
    const queue = jidQueues.get(jid);
    if (!queue?.length) return;

    const myGeneration = sockGeneration; // snapshot de la génération actuelle
    jidProcessing.add(jid);
    activeWorkers++;
    try {
        while (queue.length) {
            // Si le socket a été remplacé (reconnexion), on arrête ce worker
            if (sockGeneration !== myGeneration) break;
            const { msg } = queue.shift();
            const timeout = isCmd(msg) ? CMD_TIMEOUT_MS : MSG_TIMEOUT_MS;
            try {
                await Promise.race([
                    handler.handleMessage(sock, msg),
                    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), timeout))
                ]);
            } catch (err) {
                if (!err.message?.includes('timeout')) logError('Handler', err);
            }
        }
    } finally {
        jidProcessing.delete(jid);
        activeWorkers = Math.max(0, activeWorkers - 1);
        // Lancer les queues en attente (seulement si on est encore sur la bonne génération)
        if (sockGeneration === myGeneration) {
            for (const [j, q] of jidQueues) {
                if (activeWorkers >= MAX_CONCURRENT) break;
                if (q.length && !jidProcessing.has(j)) {
                    processJidQueue(sock, j).catch(e => logError('Worker', e));
                }
            }
        }
    }
}

function enqueue(sock, msg) {
    const jid = msg.key.remoteJid;
    if (!jidQueues.has(jid)) jidQueues.set(jid, []);
    const q = jidQueues.get(jid);
    if (q.length >= MAX_PER_JID) return; // silencieux — groupe trop actif
    // Commandes en tête de queue
    isCmd(msg) ? q.unshift({ msg }) : q.push({ msg });
    processJidQueue(sock, jid).catch(e => logError('Enqueue', e));
}

let sockGeneration = 0; // incrémenté à chaque reconnexion pour annuler les anciens workers

function clearQueues() {
    jidQueues.clear();
    jidProcessing.clear();
    activeWorkers = 0;
    sockGeneration++; // invalide tous les workers de l'ancien socket
}

// ============================================================
// KEEP-ALIVE (évite la déconnexion des sockets inactifs)
// ============================================================
let keepAliveTimer = null;
const startKeepAlive = (sock) => {
    stopKeepAlive();
    keepAliveTimer = setInterval(() => {
        sock.sendPresenceUpdate('available').catch(() => {});
    }, 25_000);
};
const stopKeepAlive = () => {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
};
// ============================================================
// DÉMARRAGE BOT
// ============================================================
let reconnectAttempts = 0;
const MAX_RECONNECT       = 10;
const MAX_RECONNECT_DELAY = 60_000;
let isShuttingDown = false;

async function startBot() {
    if (isShuttingDown) return;

    const sessionFolder = path.resolve(__dirname, config.sessionName || 'session');
    fs.ensureDirSync(sessionFolder);

    // Injection session via sessionID compressé (Katabump / Railway)
    if (config.sessionID && config.sessionID.includes('!')) {
        try {
            const dec = zlib.gunzipSync(Buffer.from(config.sessionID.split('!')[1], 'base64'));
            fs.writeFileSync(path.join(sessionFolder, 'creds.json'), dec);
            _log('📡 [Session] Clés injectées depuis sessionID.');
        } catch (e) { _error('❌ [Session] Injection error:', e.message); }
    }

    // FIX BAD MAC : purge des clés Signal corrompues (sans toucher creds.json)
    try {
        const credsPath = path.join(sessionFolder, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            fs.emptyDirSync(sessionFolder);
            _log('🛡️ [Session] Première installation — session vierge.');
        } else {
            let purged = 0;
            for (const file of fs.readdirSync(sessionFolder)) {
                if (file.startsWith('sender-key-') || file.startsWith('session-') || file.startsWith('app-state-sync-key-')) {
                    fs.removeSync(path.join(sessionFolder, file));
                    purged++;
                }
            }
            _log(purged > 0 ? `🧹 [Session] ${purged} clé(s) purgée(s).` : '✅ [Session] Session propre.');
        }
    } catch (e) { _error('❌ [Session] Erreur nettoyage:', e.message); }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version }          = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger:              pino({ level: 'silent' }),
        printQRInTerminal:   false,
        browser:             Browsers.baileys(),  // plus stable que ubuntu/Chrome

        // FIX BAD MAC : store de clés avec cache
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },

        keepAliveIntervalMs:            20_000,   // keep-alive natif Baileys
        syncFullHistory:                false,
        markOnlineOnConnect:            true,
        generateHighQualityLinkPreview: true,
        shouldSyncHistoryMessage:       () => false,
        retryRequestDelayMs:            1000,
        maxMsgRetryCount:               3,
        fireInitQueries:                false,

        cachedGroupMetadata: async (jid) => {
            const c = global.groupMetadataCache?.get(jid);
            return (c && Date.now() - c.ts < 5 * 60 * 1000) ? c.data : undefined;
        },

        patchMessageBeforeSending: (msg) => {
            if (msg.buttonsMessage || msg.listMessage) {
                return { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2 }, ...msg } } };
            }
            return msg;
        },

        shouldIgnoreJid: (jid) => isJidBroadcast(jid),

        getMessage: async (key) => {
            const chat = store.messages.get(key.remoteJid);
            return chat?.get(key.id)?.message || { conversation: 'GhostG-X' };
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);

    // --- PAIRING CODE ---
    if (!sock.authState.creds.registered) {
        const phone = String(config.supremeNumber || '').replace(/\D/g, '');
        if (phone) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phone);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    _log(`\n╔════════════════════════════════════╗`);
                    _log(`║   ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :        ║`);
                    _log(`║       ${String(code).padEnd(20)}   ║`);
                    _log(`╚════════════════════════════════════╝\n`);
                } catch (err) { logError('Pairing', err); }
            }, 3000);
        } else {
            _error('❌ [Config] supremeNumber manquant — pairing impossible.');
        }
    }

    // --- ÉVÉNEMENTS CONNEXION ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') _log('🔄 [Bot] Connexion en cours...');

        if (connection === 'close') {
            stopKeepAlive();
            clearQueues();

            const code  = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || 'inconnue';
            _log(`🔴 [Bot] Déconnexion — code: ${code || 'N/A'} | ${reason}`);

            // Session expirée → purge et arrêt
            if (code === DisconnectReason.loggedOut) {
                isShuttingDown = true;
                _log('🔴 Session expirée. Purge en cours...');
                try { fs.emptyDirSync(sessionFolder); } catch {}
                _log('✅ Session purgée. Relancez pour rescanner.');
                return;
            }

            // Restart demandé par Baileys
            if (code === DisconnectReason.restartRequired) {
                _log('🔁 Restart requis — reconnexion immédiate.');
                setTimeout(() => startBot().catch(e => logError('Reconnexion', e)), 1000);
                return;
            }

            // Trop de tentatives
            if (reconnectAttempts >= MAX_RECONNECT) {
                isShuttingDown = true;
                _error(`🚨 ${MAX_RECONNECT} tentatives échouées. Relancez manuellement.`);
                process.exit(1);
            }

            // Reconnexion avec backoff exponentiel
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, MAX_RECONNECT_DELAY);
            _log(`⚠️ Reconnexion dans ${delay / 1000}s... (${reconnectAttempts}/${MAX_RECONNECT})`);
            setTimeout(() => startBot().catch(e => logError('Reconnexion', e)), delay);

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            _log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !\n');
            startKeepAlive(sock);

            // FIX CODE 500 : attendre 5s avant d'envoyer des messages
            // (le socket n'est pas encore prêt immédiatement après l'open)
            setTimeout(async () => {
                try {
                    const { loadCommands } = require('./utils/commandLoader');
                    if (!global.commands || global.commands.size === 0) {
                        global.commands = loadCommands();
                    }
                    const totalCmds = global.commands.size;

                    const ownerNum = String(config.supremeNumber || '');
                    // FIX : construction propre du botJid (multi-device safe)
                    const rawId  = sock.user?.id || '';
                    const botJid = rawId.includes(':')
                        ? rawId.split(':')[0] + '@s.whatsapp.net'
                        : rawId;
                    const ownerJid = `${ownerNum}@s.whatsapp.net`;

                    const welcomeCaption =
                        `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n` +
                        `┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n` +
                        `┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n` +
                        `┃ *ᴘʀᴇғɪxᴇ* : [ ${config.prefix || '.'} ]\n` +
                        `┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n` +
                        `┃ *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n` +
                        `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                        `📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* : ${config.social?.channel || 'https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c'}\n` +
`📢 *ᴄʜᴀɪɴᴇ ᴛᴇʟᴇɢʀᴀᴍ* : https://t.me/ghostgxbot\n\n` +
                        `👥 *ɢʀᴏᴜᴘᴇ* : ${config.social?.group || 'https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf'}\n\n` +
                        
`💻 *ᴅᴇᴠ* : wa.me/22651622652\n\n` +
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
                                newsletterJid:   config.social?.channelJid  || '120363425540434745@newsletter',
                                newsletterName:  config.social?.channelName || 'ɢʜᴏsᴛɢ-x',
                                serverMessageId: 143
                            }
                        }
                    }).catch(() => {});
await new Promise(r => setTimeout(r, 1500));

                    await sock.sendMessage(ownerJid, {
                        text:
                            `📢 *ᴀʟᴇʀᴛᴇ ᴅᴇ ᴅᴇ́ᴍᴀʀʀᴀɢᴇ*\n\n` +
                            `*ɢʜᴏsᴛɢ-x* est en ligne !\n` +
                            `Mode : ${config.selfMode ? 'Privé 🔒' : 'Public 🌐'} | Cmds : ${totalCmds}`
                    }).catch(() => {});

                    // Message déployeur — une seule fois
                    const deployFlag = path.join(__dirname, 'database', '.deployed');
                    if (!fs.existsSync(deployFlag)) {
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
                        fs.writeFileSync(deployFlag, new Date().toISOString());
                    }

                } catch (err) { logError('Notification', err); }
            }, 5000);
        }
    });

    // --- MESSAGES ENTRANTS ---
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return;
        const now    = Date.now();
        const prefix = config?.prefix || '.';

        for (const msg of messages) {
            try {
                if (!msg?.message || !msg?.key?.id) continue;
                const jid = msg.key.remoteJid;
                if (!jid || isJidBroadcast(jid)) continue;

                // Extraction du texte
                const text =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    msg.message.videoMessage?.caption ||
                    msg.message.buttonsResponseMessage?.selectedButtonId ||
                    msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
                    msg.message.templateButtonReplyMessage?.selectedId || '';

                const senderJid  = msg.key.participant || jid;
                const isCommand  = text.trimStart().startsWith(prefix) ||
                                   (text.trimStart().startsWith('>') && global.isSupreme(senderJid));

                // fromMe intelligent : bloque les messages normaux du bot,
                // laisse passer les commandes du owner
                if (msg.key.fromMe && !isCommand) continue;

                // Filtre d'âge : ignore les messages de plus de 60s
                // (évite de retraiter l'historique au démarrage)
                const msgTs = (msg.messageTimestamp || 0) * 1000;
                if (msgTs && now - msgTs > 60_000) {
                    markSeen(msg.key.id);
                    continue;
                }

                // ANTI-DOUBLON PERSISTANT : survit aux reconnexions
                // Si le bot se reconnecte en moins de 10 min, les IDs déjà
                // traités sont toujours en mémoire → pas de double traitement
                if (alreadySeen(msg.key.id)) continue;
                markSeen(msg.key.id);

                enqueue(sock, msg);

            } catch (e) { logError('Upsert Loop', e); }
        }
    });

    // --- ANTI-DELETE ---
    sock.ev.on('messages.delete', async (update) => {
        try { await handler.handleAntiDelete(sock, update); } catch (e) { logError('AntiDelete', e); }
    });

    // --- WELCOME / GOODBYE ---
    sock.ev.on('group-participants.update', async (u) => {
        try { await handler.handleGroupUpdate(sock, u); } catch (e) { logError('GroupUpdate', e); }
    });

    // --- ANTI-CALL ---
    sock.ev.on('call', async (calls) => {
        if (!config.anticall) return;
        for (const call of calls) {
            try {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: `⚠️ *ᴀᴘᴘᴇʟs ɪɴᴛᴇʀᴅɪᴛs ᴘᴀʀ ɢʜᴏsᴛɢ-x ꜱᴇᴄᴜʀɪᴛʏ*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`
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
startBot().catch(err => logError('Global Boot', err));

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

process.on('SIGINT',  () => { isShuttingDown = true; stopKeepAlive(); _log('\n👋 Arrêt propre.'); process.exit(0); });
process.on('SIGTERM', () => { isShuttingDown = true; stopKeepAlive(); _log('\n👋 Arrêt propre.'); process.exit(0); });

module.exports = { store };
