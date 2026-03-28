/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.3 - FULL FUSION)
 * Optimized for Baileys v6.7.9 & Pino v9+
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const Baileys = require('@whiskeysockets/baileys');
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    Browsers,
    makeCacheableSignalKeyStore
} = Baileys;

const makeWASocket = Baileys.default || Baileys; 
const pino = require('pino');
const fs = require('fs-extra'); 
const path = require('path');

// ==========================================
// MODULE 1 : CONFIGURATION & STORE PRO
// ==========================================
const config = require('./config');
const handler = require('./handler');
global.config = config; 

const logFile = path.join(__dirname, 'bot-crash.log');
const logError = (msg, err) => {
    const logStr = `[${new Date().toISOString()}] ❌ ${msg}: ${err.stack || err}\n`;
    console.error(logStr);
    fs.appendFileSync(logFile, logStr);
};

fs.ensureDirSync(path.join(__dirname, 'tmp'));
fs.ensureDirSync(path.join(__dirname, 'database'));

// Store avec logger Pino v9 (Indispensable pour isAdmin/Anti-Delete)
global.store = makeInMemoryStore({ 
    logger: pino({ level: 'silent' }).child({ level: 'silent', stream: 'store' }) 
});

// Sauvegarde automatique du store
setInterval(() => {
    try { global.store.writeToFile('./database/store.json'); } catch (e) {}
}, 60000);

// ==========================================
// MODULE 2 : SÉCURITÉ & UTILITAIRES (GARDÉS)
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
        try { await handler.handleMessage(sock, msg); } catch (err) { logError("Handler Message Crash", err); }
    }
    processing = false;
}

// ==========================================
// MODULE 4 : WATCHDOG (HEARTBEAT)
// ==========================================
let activeBot = null;
setInterval(async () => {
    if (!activeBot) return;
    try { 
        await activeBot.presenceSubscribe(global.config.supremeNumber + '@s.whatsapp.net'); 
    } catch (err) { 
        console.warn('⚠️ Watchdog: Heartbeat fail, restarting...'); 
        activeBot = null; 
        startBot(); 
    }
}, 30000);

// ==========================================
// MODULE 5 : SOCKET & PAIRING CODE
// ==========================================
async function startBot() {
    try {
        const sessionFolder = `./${global.config.sessionName || 'session'}`;
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }), 
            printQRInTerminal: false, 
            browser: Browsers.ubuntu("Chrome"), 
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            syncFullHistory: false,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (key) => {
                if (global.store) {
                    const msg = await global.store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return { conversation: "GhostG-X V5.3" };
            }
        });

        activeBot = sock;
        global.store.bind(sock.ev);

        // --- PAIRING CODE LOGIC ---
        if (!sock.authState.creds.registered) {
            const phoneNumber = String(global.config.supremeNumber).replace(/\D/g, '');
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { logError("Pairing Error", err); }
            }, 3000);
        }

        // --- ÉVÉNEMENTS ---
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.toString();
                if (reason !== DisconnectReason.loggedOut) {
                    console.log(`⚠️ Reconnexion (Raison: ${reason})...`);
                    setTimeout(() => startBot(), 5000);
                }
            } else if (connection === 'open') {
                console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄ_ᴏɴɴᴇᴄᴛᴇ́ !');
                
                try {
                    const totalCmds = global.commands ? global.commands.size : 0;
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const ownerNum = global.config.supremeNumber;

                    const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮\n┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ\n┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}\n┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]\n┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}\n┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}\n╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n📢 *ᴄʜᴀɪɴᴇ* : ${global.config.social.channel}\n👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ* : ${global.config.social.group}\n💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* : wa.me/${ownerNum}\n\n📖 _*“ᴊᴇ ᴘᴜɪꜱ ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ”*_ ❤️✝️\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

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

        sock.ev.on('messages.delete', async (update) => {
            try { await handler.handleAntiDelete(sock, update); } catch (e) { logError("Anti-Delete", e); }
        });

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

        sock.ev.on('group-participants.update', async (u) => {
            try { await handler.handleGroupUpdate(sock, u); } catch (err) { logError("Group Update Crash", err); }
        });

    } catch (err) { logError("Startup Fatal", err); setTimeout(() => startBot(), 10000); }
}

startBot();
