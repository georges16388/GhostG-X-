/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.2 - FULL FUSION)
 * Optimized for Dual-Level Ownership, Security, Store History & Extreme Resilience
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const Baileys = require('@whiskeysockets/baileys');
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
} = Baileys;

const makeWASocket = Baileys.default || Baileys; 
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// ==========================================
// MODULE 1 : CONFIGURATION (MODE SANS STORE)
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

// Simulation d'un store vide pour la compatibilité des autres modules
global.store = {
    chats: [],
    contacts: {},
    messages: {},
    groupMetadata: {},
    bind: () => { 
        console.log('✅ [ꜱʏꜱᴛᴇᴍ] ꜱᴛᴏʀᴇ ꜱᴜᴘᴘʀɪᴍᴇ́ - ᴍᴏᴅᴇ ꜰʟUX ᴀᴄᴛɪᴠᴇ́'); 
    }
};




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
}, 30000); // Ping toutes les 30 sec

// ==========================================
// MODULE 5 : GESTION DES INSTANCES (SINGLETON)
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
        console.log("❌ Déconnecté par WhatsApp (Logged Out). Supprimez la session et scannez à nouveau.");
        return;
    }
    if (reconnectQueue) return;
    reconnectQueue = true;
    
    console.log(`⚠️ Connexion fermée: ${reason || 'Inconnue'}. Reconnexion bloquée à 3s...`);
    try { sock.end(); } catch(e){}
    
    setTimeout(async () => {
        reconnectQueue = false;
        activeBot = null;
        await startBot();
    }, 3000);
}

// ==========================================
// MODULE 6 : CRÉATION DU SOCKET & ÉVÉNEMENTS
// ==========================================
async function createBotSocket() {
    try {
        const sessionFolder = `./${global.config.sessionName || 'session'}`;
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        const { version } = await fetchLatestBaileysVersion();

        // Ajout d'un logger fichier pour Baileys si besoin, sinon silent
        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }), 
            printQRInTerminal: false, 
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: state,
            syncFullHistory: false,
        });

       // Dans index.js, là où tu as tes sock.ev.on
sock.ev.on('messages.delete', async (update) => {
    await handler.handleAntiDelete(sock, update);
});


        // --- GESTION DE LA CONNEXION ---
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.toString();
                await safeReconnect(sock, reason);
            } 
            else if (connection === 'open') {
                console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇ̀ꜱ !');

                // Logique Pairing Code fiable (Uniquement si pas enregistré et connexion ouverte)
                if (!sock.authState.creds.registered) {
                    const cleanNumber = String(global.config.supremeNumber).replace(/\D/g, '');
                    console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
                    try {
                        let code = await sock.requestPairingCode(cleanNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                    } catch (err) { 
                        logError("Pairing Error", err); 
                    }
                }

                try {
                    const totalCmds = global.commands ? global.commands.size : 0;
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const ownerNum = global.config.supremeNumber;

                    const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ
┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}
┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]
┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}
┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* :
${global.config.social.channel}

👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ* :
${global.config.social.group}

💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* :
https://wa.me/${ownerNum}

📖 _*“ᴊᴇ ᴘᴜɪꜱ ᴛᴏᴜᴛ ᴘᴀʀ ᴄᴇʟᴜɪ ǫᴜɪ ᴍᴇ ғᴏʀᴛɪғɪᴇ”*_ ❤️✝️

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

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
                } catch (err) { 
                    logError("Notification Error", err); 
                }
            }
        });

        // --- SYSTÈME ANTI-CALL (AVEC TRY/CATCH) ---
        sock.ev.on('call', async (node) => {
            if (!global.config.anticall) return;
            try {
                for (let call of node) {
                    if (call.status === 'offer') {
                        await sock.rejectCall(call.id, call.from);
                        const warnMsg = `*╭╼━≪• *ɢʜᴏsᴛɢ-𝐗 sᴇᴄᴜʀɪᴛʏ* •≫━╾╮*\n┃\n┃ ⚠️ ${toSmallCaps("appels interdits")}\n┃ ${toSmallCaps("votre appel a ete rejete")}\n┃\n*╰━━━━━━━━━━━━━━━╯*\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;
                        await sock.sendMessage(call.from, { text: warnMsg });
                    }
                }
            } catch (err) {
                logError("Anti-Call Crash", err);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // --- GESTION DES MESSAGES ENTRANTS (VERS QUEUE) ---
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            for (const msg of messages) {
                if (!msg.message) continue;
                const sender = msg.key.participant || msg.key.remoteJid;
                
                if (global.config.selfMode && !global.isOwner(sender)) continue;
                
                const now = Math.floor(Date.now() / 1000);
                if (now - msg.messageTimestamp > 15) continue;
                
                // Pousse dans la file d'attente au lieu d'exécuter direct
                messageQueue.push({ sock, msg });
            }
            // Déclenche le traitement
            processQueue();
        });

        // --- GESTION DES GROUPES (AVEC TRY/CATCH) ---
        sock.ev.on('group-participants.update', async (u) => {
            try {
                await handler.handleGroupUpdate(sock, u);
            } catch (err) {
                logError("Group Update Crash", err);
            }
        });

        return sock;

    } catch (err) {
        logError("Crash fatal lors de la création du socket", err);
    }
}

// Lancement avec try/catch global ultime
try {
    startBot().catch(err => logError("Erreur Critique Lancement", err));
} catch (error) {
    console.error("❌ Crash Inattendu:", error);
}
