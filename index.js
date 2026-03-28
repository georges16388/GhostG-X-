/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5.2)
 * Optimized for Pairing Code, Dynamic Config & Security
 * Powered by -ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// --- CHARGEMENT DE LA CONFIGURATION ---
const config = require('./config');
const handler = require('./handler');

// 🔹 CRUCIAL : On rend la config globale pour la synchronisation avec setprefix
global.config = config; 

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
        printQRInTerminal: false, // On utilise uniquement le Pairing Code
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: state,
        syncFullHistory: false,
    });

    // --- SYSTÈME ANTI-CALL (SÉCURITÉ AGM) ---
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

    // --- LOGIQUE PAIRING CODE (KATABUMP / HEROKU READY) ---
    if (!sock.authState.creds.registered) {
        const cleanNumber = String(global.config.supremeNumber || "22651622652").replace(/\D/g, '');
        
        console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
            } catch (err) { 
                console.error('❌ Pairing Error:', err.message); 
            }
        }, 6000); // Délai de sécurité pour l'initialisation socket
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
                // On récupère le nombre de commandes via la globale déjà chargée dans le handler
                const totalCmds = global.commands ? global.commands.size : 0;
                const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const ownerNum = "22651622652";

                const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ
┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNum}
┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${botJid.split('@')[0]}
┃ *ᴘʀᴇғɪxᴇ* : [ ${global.config.prefix || '.'} ]
┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds}
┃ *ᴍᴏᴅᴇ* : ${global.config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* :
https://wa.me/22651622652

📖 _*“${toSmallCaps("je puis tout par celui qui me fortifie")}”*_ ❤️✝️

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢʜᴏsᴛɢ-𝐗*`;

                await sock.sendMessage(botJid, { 
                    image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
                    caption: welcomeCaption, 
                    contextInfo: {
                        mentionedJid: [botJid, ownerNum + '@s.whatsapp.net'],
                        forwardingScore: 999,
                        isForwarded: true,
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
        
        for (const msg of messages) {
            if (!msg.message) continue;

            // 🕒 ANTI-REPLAY : Ignore les messages de plus de 15 secondes
            const messageTimestamp = msg.messageTimestamp;
            const now = Math.floor(Date.now() / 1000);
            if (now - messageTimestamp > 15) {
                console.log(`[REPLAY IGNORED] Message trop ancien : ${msg.key.id}`);
                continue;
            }

            handler.handleMessage(sock, msg).catch(err => console.error(err));
        }
    });


    // --- GESTION DES GROUPES (WELCOME/GOODBYE) ---
    sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
}

// Lancement du bot
startBot().catch(err => console.error('❌ Erreur Critique au démarrage:', err));
