/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.2 - FULL FUSION)
 * Optimized for Dual-Level Ownership, Security & Store History
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const Baileys = require('@whiskeysockets/baileys');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion
} = Baileys;

const makeInMemoryStore = Baileys.makeInMemoryStore; 

const pino = require('pino');
const fs = require('fs');
const path = require('path');

// --- CHARGEMENT DE LA CONFIGURATION ---
const config = require('./config');
const handler = require('./handler');

// 🔹 Configuration Globale
global.config = config; 

// --- VÉRIFICATION DU DOSSIER TEMPORAIRE ---
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log('✅ [ꜱʏꜱᴛᴇᴍ] ᴅᴏꜱꜱɪᴇʀ ᴛᴍᴘ ᴄʀᴇᴇ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇꜱ');
}

// --- INITIALISATION DU STORE ---
const store = makeInMemoryStore({ 
    logger: pino({ level: 'silent' }) 
});
global.store = store; 

/**
 * HIÉRARCHIE DE SÉCURITÉ GLOBALE
 */
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

// --- UTILITAIRES DE STYLE ---
const toSmallCaps = (text) => {
    const fonts = {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return String(text).toLowerCase().split('').map(c => fonts[c] || c).join('');
};

async function startBot() {
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

    store.bind(sock.ev);

    // --- SYSTÈME ANTI-CALL ---
    sock.ev.on('call', async (node) => {
        if (!global.config.anticall) return;
        for (let call of node) {
            if (call.status === 'offer') {
                await sock.rejectCall(call.id, call.from);
                const warnMsg = `╭╼━≪• *ᴀɢᴍ sᴇᴄᴜʀɪᴛʏ* •≫━╾╮\n┃\n┃ ⚠️ ${toSmallCaps("appels interdits")}\n┃ ${toSmallCaps("votre appel a ete rejete")}\n┃\n╰━━━━━━━━━━━━━━━╯\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-x*`;
                await sock.sendMessage(call.from, { text: warnMsg });
            }
        }
    });

    // --- LOGIQUE PAIRING CODE ---
    if (!sock.authState.creds.registered) {
        const cleanNumber = String(global.config.supremeNumber).replace(/\D/g, '');
        console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
            } catch (err) { 
                console.error('❌ Pairing Error:', err.message); 
            }
        }, 6000);
    }

    // --- GESTION DE LA CONNEXION ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Connexion fermée. Reconnexion en cours...');
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇ̀ꜱ !');

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
                console.error('❌ Notification Error:', err.message); 
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- GESTION DES MESSAGES ENTRANTS ---
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;
            const sender = msg.key.participant || msg.key.remoteJid;

            if (global.config.selfMode && !global.isOwner(sender)) continue;

            const messageTimestamp = msg.messageTimestamp;
            const now = Math.floor(Date.now() / 1000);
            if (now - messageTimestamp > 15) continue;

            handler.handleMessage(sock, msg).catch(err => console.error(err));
        }
    });

    sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));
