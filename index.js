/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * Edition : Supreme GhostG-X (Baileys ^6.7.15 Optimized)
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');

// --- INITIALISATION DU STORE (Anti-Waiting Message) ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// --- GESTIONNAIRE DE MÉMOIRE (Anti-Doublons) ---
const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

async function startBot() {
    const sessionFolder = `./${config.sessionName || 'session'}`;

    // 1. Restauration de session via ID (Base64/Zlib)
    if (config.sessionID && config.sessionID.includes('!')) {
        try {
            const b64data = config.sessionID.split('!')[1];
            const decompressedData = zlib.gunzipSync(Buffer.from(b64data, 'base64'));
            if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
            fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData);
            console.log('📡 ꜱᴇꜱꜱɪᴏɴ : 🔑 ꜱᴇꜱꜱɪᴏɴ ᴄʜᴀʀɢᴇ́ᴇ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇ̀ꜱ.');
        } catch (e) { console.error('❌ Session ID Error:', e.message); }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Forcer le Pairing Code
        browser: Browsers.ubuntu("Chrome"), // Important pour le Pairing
        auth: state,
        syncFullHistory: false,
        // Correction critique du "Waiting for message"
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "ɢʜᴏꜱᴛɢ-x ᴅᴇᴄᴏᴅɪɴɢ..." };
        }
    });

    store.bind(sock.ev);

    // --- LOGIQUE DU PAIRING CODE (6.7.15) ---
    if (!sock.authState.creds.registered) {
        const cleanNumber = String(config.supremeNumber || "22651622652").replace(/\D/g, '');
        if (cleanNumber) {
            console.log(`\n[ ɢʜᴏꜱᴛɢ-x ] 🚀 ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ...`);
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { console.error('❌ Pairing Error:', err.message); }
            }, 6000); 
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

📢 *ᴄʜᴀɪɴᴇ* : https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

👥 *ɢʀᴏᴜᴘᴇ* : https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf

💻 *ᴅᴇᴠ* : https://wa.me/${ownerNumber}


📖 _*“ ᴊᴇ ᴘᴜɪs ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ ”*_ - ᴘʜɪʟɪᴘᴘɪᴇɴs 4.13 ❤️✝️

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;

                await sock.sendMessage(botJid, { 
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
                    caption: welcomeCaption, 
                    contextInfo: {
                        mentionedJid: [botJid, ownerNumber + '@s.whatsapp.net'],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363425540434745@newsletter',
                            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ"
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
                
                // Filtrage anti-spam au démarrage (30 sec max)
                const msgTime = (msg.messageTimestamp || 0) * 1000;
                if (msgTime && (now - msgTime > 30000)) continue;

                if (processedMessages.has(msg.key.id)) continue;
                processedMessages.add(msg.key.id);

                // Autoriser ses propres commandes (pour le mode Public/Private)
                const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
                if (msg.key.fromMe && !body.startsWith(config.prefix)) continue;

                await handler.handleMessage(sock, msg);
            } catch (e) { console.error('❌ Upsert Loop Error:', e); }
        }
    });

    sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));

module.exports = { store };
