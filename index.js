/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.2 - FULL FUSION)
 */

const Baileys = require('@whiskeysockets/baileys');
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeInMemoryStore // <--- Nécessaire pour les métadonnées
} = Baileys;

const makeWASocket = Baileys.default || Baileys; 
const pino = require('pino');
const fs = require('fs');
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
    if (fs.appendFileSync) fs.appendFileSync(logFile, logStr);
};

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// REMPLACEMENT : On utilise un vrai store pour que isAdmin fonctionne dans le handler
global.store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// ==========================================
// MODULE 2 : SÉCURITÉ & UTILITAIRES
// ==========================================
global.isSupreme = (jid) => {
    if (!jid) return false;
    const number = jid.split('@')[0].replace(/\D/g, '');
    return number === global.config.supremeNumber;
};

global.isOwner = (jid) => {
    if (!jid) return false;
    const number = jid.split('@')[0].replace(/\D/g, '');
    if (number === global.config.supremeNumber) return true; 
    const owners = Array.isArray(global.config.ownerNumber) ? global.config.ownerNumber : [global.config.ownerNumber];
    return owners.some(owner => owner.toString().replace(/\D/g, '') === number);
};

const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

// ==========================================
// MODULE 3 : GESTION DE LA QUEUE (MESSAGES)
// ==========================================
const messageQueue = [];
let processing = false;

async function processQueue() {
    if (processing) return;
    processing = true;
    while (messageQueue.length) {
        const { sock, msg } = messageQueue.shift();
        try { 
            await handler.handleMessage(sock, msg); 
        } catch (err) { 
            logError("Handler Message Crash", err); 
        }
    }
    processing = false;
}

// ==========================================
// MODULE 4 : WATCHDOG (HEARTBEAT)
// ==========================================
setInterval(async () => {
    if (!activeBot) return;
    try { 
        await activeBot.presenceSubscribe(global.config.supremeNumber + '@s.whatsapp.net'); 
    } catch (err) { 
        console.warn('⚠️ Heartbeat fail, force reconnecting...'); 
        try { activeBot.end?.(); } catch(e){} 
        activeBot = null; 
        await startBot(); 
    }
}, 30000);

// ==========================================
// MODULE 5 : GESTION DES INSTANCES
// ==========================================
let activeBot = null;
let reconnectQueue = false;

async function startBot() {
    if (activeBot) return activeBot; 
    activeBot = await createBotSocket(); 
    return activeBot;
}

async function safeReconnect(sock, reason) {
    if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Déconnecté.");
        return;
    }
    if (reconnectQueue) return;
    reconnectQueue = true;
    setTimeout(async () => {
        reconnectQueue = false;
        activeBot = null;
        await startBot();
    }, 3000);
}

// ==========================================
// MODULE 6 : SOCKET & ÉVÉNEMENTS
// ==========================================
async function createBotSocket() {
    try {
        const sessionFolder = `./${global.config.sessionName || 'session'}`;
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }), 
            printQRInTerminal: false, 
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: state,
            syncFullHistory: false,
        });

        // LIAISON DU STORE AU SOCKET
        global.store.bind(sock.ev);

        // ANTI-DELETE HANDLER
        sock.ev.on('messages.delete', async (update) => {
            try { await handler.handleAntiDelete(sock, update); } catch (e) { logError("Anti-Delete", e); }
        });

        // --- GESTION DE LA CONNEXION ---
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.toString();
                await safeReconnect(sock, reason);
            } 
            else if (connection === 'open') {
                console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');

                if (!sock.authState.creds.registered) {
                    const cleanNumber = String(global.config.supremeNumber).replace(/\D/g, '');
                    try {
                        let code = await sock.requestPairingCode(cleanNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        console.log(`\nCODE DE JUMELAGE : ${code}\n`);
                    } catch (err) { logError("Pairing Error", err); }
                }

                // Notification de démarrage (Ta légende personnalisée)
                try {
                    const totalCmds = global.commands ? global.commands.size : 0;
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const ownerNum = global.config.supremeNumber;
                    const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]\n┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n📢 *ᴄʜᴀɪɴᴇ* : ${global.config.social.channel}\n\n👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ*: ${global.config.social.group}\n\n💻 *ᴅᴇᴠ* : wa.me/${ownerNum}\n\n📖 _*“ᴊᴇ ᴘᴜɪꜱ ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ”*_ ❤️✝️\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                    await sock.sendMessage(botJid, { 
                        image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
                        caption: welcomeCaption, 
                        contextInfo: {
                            mentionedJid: [botJid, `${ownerNum}@s.whatsapp.net`],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363425540434745@newsletter',
                                newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                                serverMessageId: 143
                            }
                        }
                    });
                } catch (err) { logError("Notification Error", err); }
            }
        });

        // ANTI-CALL
        sock.ev.on('call', async (node) => {
            if (!global.config.anticall) return;
            try {
                for (let call of node) {
                    if (call.status === 'offer') {
                        await sock.rejectCall(call.id, call.from);
                        await sock.sendMessage(call.from, { text: `*╭╼━≪• ɢʜᴏsᴛɢ-𝐗 sᴇᴄᴜʀɪᴛʏ •≫━╾╮*\n┃ ⚠️ ${toSmallCaps("appels interdits")}\n*╰━━━━━━━━━━━━━━━╯*` });
                    }
                }
            } catch (err) { logError("Anti-Call Crash", err); }
        });

        sock.ev.on('creds.update', saveCreds);

        // MESSAGES UPSERT
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            for (const msg of messages) {
                if (!msg.message) continue;
                const sender = msg.key.participant || msg.key.remoteJid;
                if (global.config.selfMode && !global.isOwner(sender)) continue;
                messageQueue.push({ sock, msg });
            }
            processQueue();
        });

        // GROUP UPDATE
        sock.ev.on('group-participants.update', async (u) => {
            try { await handler.handleGroupUpdate(sock, u); } catch (err) { logError("Group Update Crash", err); }
        });

        return sock;
    } catch (err) { logError("Socket Crash", err); }
}

startBot();
