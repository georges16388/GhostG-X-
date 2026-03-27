/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ (Prestige Edition V5)
 * Focus : Pairing Code Only + Full Design
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');

async function startBot() {
    const sessionFolder = `./${config.sessionName}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Obligatoire pour le pairing
        auth: state,
        syncFullHistory: false,
    });

    // --- LOGIQUE PAIRING CODE (AUCUN QR) ---
    if (!sock.authState.creds.registered) {
        const cleanNumber = String(config.supremeNumber || "22651622652").replace(/\D/g, '');
        if (cleanNumber) {
            console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
                } catch (err) { console.error('❌ Pairing Error:', err.message); }
            }, 5000);
        }
    }

    // --- GESTION DE LA CONNEXION & DESIGN BIENVENUE ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

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
                const ownerNumber = "22651622652";

                // --- RESTAURATION DU DESIGN PRESTIGE ---
                const welcomeCaption = `╭╼━≪• *ɢʜᴏsᴛɢ-x ɪs ᴀʟɪᴠᴇ* •≫━╾╮
┃ *sᴛᴀᴛᴜᴛ* : 🟢 ᴏɴʟɪɴᴇ
┃ *ᴍᴀɪᴛʀᴇ* : @${ownerNumber}
┃ *ᴜᴛɪʟɪsᴀᴛᴇᴜʀ* : @${botJid.split('@')[0]}
┃ *ᴘʀᴇғɪxᴇ* : [ ${config.prefix || '.'} ]
┃ *ᴄᴏᴍᴍᴀɴᴅᴇs* : ${totalCmds} ғɪʟᴇs
┃ *ᴍᴏᴅᴇ* : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

📢 *ᴄʜᴀɪɴᴇ ᴡʜᴀᴛsᴀᴘᴘ* :
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴇɴᴛʀᴀɪᴅᴇ* :
https://chat.whatsapp.com/JuhRb0BfN9uBkMBQmwZhIf

💻 *ᴅᴇᴠᴇʟᴏᴘᴘᴇᴜʀ* :
https://wa.me/22651622652


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
                            newsletterName: "-ّ⸙𓆩ɢʜᴏsᴛɢ 𝐗 𓆪⸙-ّ",
                            serverMessageId: 143
                        }
                    }
                });
            } catch (err) { console.error('❌ Notification Error:', err.message); }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- GESTION DES MESSAGES ---
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message) continue;
            
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
            const isCommand = text.startsWith(config.prefix);

            // Ignore les messages personnels qui ne sont pas des commandes
            if (msg.key.fromMe && !isCommand) continue;

            handler.handleMessage(sock, msg).catch(err => console.error(err));
        }
    });

    sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
}

startBot().catch(err => console.error('❌ Erreur Critique:', err));
