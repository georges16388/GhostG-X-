/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * Optimized for Pairing Code, Self-Response & Anti-Encryption Bug
 * Edition : Supreme GhostG-X
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// --- FILTRAGE DES LOGS ---
const originalConsoleLog = console.log;
const forbiddenPatterns = ['closing session', 'sessionentry', 'prekey bundle', 'ratchet', 'signal protocol', 'ephemeralkeypair'];
console.log = (...args) => {
    const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ').toLowerCase();
    if (!forbiddenPatterns.some(pattern => message.includes(pattern))) originalConsoleLog.apply(console, args);
};

// --- DÉPENDANCES ---
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// --- INITIALISATION DU STORE (Anti-Waiting for Message) ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

async function startBot() {
    const sessionFolder = `./${config.sessionName || 'session'}`;

    if (config.sessionID && config.sessionID.includes('!')) {
        try {
            const b64data = config.sessionID.split('!')[1];
            const decompressedData = zlib.gunzipSync(Buffer.from(b64data, 'base64'));
            if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
            fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData);
            console.log('📡 ꜱᴇꜱꜱɪᴏɴ : 🔑 ꜱᴇꜱꜱɪᴏɴ ᴄʜᴀʀɢᴇ́ᴇ.');
        } catch (e) { console.error('❌ Session ID Error:', e.message); }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, 
        browser: Browsers.ubuntu("Chrome"),
        auth: state,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "ɢʜᴏꜱᴛɢ-x ᴅᴇᴄᴏᴅɪɴɢ..." };
        }
    });

    store.bind(sock.ev);

    // --- LOGIQUE PAIRING CODE ---
    if (!sock.authState.creds.registered) {
        const cleanNumber = String(config.supremeNumber || "22651622652").replace(/\D/g, '');
        if (cleanNumber) {
            console.log(`\n[ ɢʜᴏꜱᴛɢ-x ] 🚀 ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { console.error('❌ Pairing Error:', err.message); }
            }, 5000);
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && !config.supremeNumber) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');
            handler.initializeAntiCall(sock);

            try {
                const { loadCommands } = require('./utils/commandLoader');
                const totalCmds = loadCommands().size;
                const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const ownerNumber = config.supremeNumber || "22651622652";

                const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ
┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNumber}
┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${botJid.split('@')[0]}
┃ *ᴘʀᴇғɪxᴇ* : [ ${config.prefix || '.'} ]
┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds} ғɪʟᴇs
┃ *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

❓ *ᴘᴏᴜʀ ᴛᴇs ǫᴜᴇsᴛɪᴏɴs* :

📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ* :
https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf

💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* :
https://wa.me/${ownerNumber}

📖 _*“ ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ ”*_ - ᴘʜɪʟɪᴘᴘɪᴇɴs 4.13 ❤️✝️

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

                await sock.sendMessage(botJid, { 
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
                    caption: welcomeCaption, 
                    contextInfo: {
                        mentionedJid: [botJid, ownerNumber + '@s.whatsapp.net'],
                        isForwarded: true,
                        forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363425540434745@newsletter',
                            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                            serverMessageId: 143
                        }
                    }
                });
            } catch (err) { console.error('❌ Notification Error:', err.message); }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const now = Date.now();
        for (const msg of messages) {
            try {
                if (!msg.message || !msg.key?.id) continue;
                const msgTime = (msg.messageTimestamp || 0) * 1000;
                if (msgTime && (now - msgTime > 40000)) continue;
                if (processedMessages.has(msg.key.id)) continue;
                processedMessages.add(msg.key.id);

                const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
                if (msg.key.fromMe && !body.startsWith(config.prefix)) continue;

                await handler.handleMessage(sock, msg);
            } catch (e) { console.error('❌ Message Loop Error:', e); }
        }
    });

    sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));

module.exports = { store };
