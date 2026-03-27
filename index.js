/**
 * ɢʜᴏꜱᴛɢ-x ᴍᴅ - ᴍᴀɪɴ ᴇɴᴛʀʏ ᴘᴏɪɴᴛ
 * Optimized for Pairing Code, Self-Response & Newsletter V5
 * Edition : Supreme GhostG-X
 */

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// --- FILTRAGE INTELLIGENT DES LOGS ---
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const forbiddenPatterns = [
  'closing session', 'sessionentry', 'prekey bundle', 'ratchet', 'signal protocol', 'ephemeralkeypair'
];

const filterLogs = (args, originalFn) => {
  const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ').toLowerCase();
  if (!forbiddenPatterns.some(pattern => message.includes(pattern))) {
    originalFn.apply(console, args);
  }
};

console.log = (...args) => filterLogs(args, originalConsoleLog);
console.error = (...args) => filterLogs(args, originalConsoleError);
console.warn = (...args) => filterLogs(args, originalConsoleWarn);

// --- DÉPENDANCES ---
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const os = require('os');

function cleanupPuppeteerCache() {
  try {
    const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer');
    if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
  } catch (err) {}
}

const store = {
  messages: new Map(),
  maxPerChat: 20,
  bind: (ev) => {
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key?.id) continue;
        const jid = msg.key.remoteJid;
        if (!store.messages.has(jid)) store.messages.set(jid, new Map());
        const chatMsgs = store.messages.get(jid);
        chatMsgs.set(msg.key.id, msg);
        if (chatMsgs.size > store.maxPerChat) {
          const oldestKey = chatMsgs.keys().next().value;
          chatMsgs.delete(oldestKey);
        }
      }
    });
  }
};

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

async function startBot() {
  const sessionFolder = `./${config.sessionName}`;

  if (config.sessionID && config.sessionID.includes('!')) {
    try {
      const b64data = config.sessionID.split('!')[1];
      const decompressedData = zlib.gunzipSync(Buffer.from(b64data, 'base64'));
      if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
      fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData);
      console.log('📡 ꜱᴇꜱꜱɪᴏɴ : 🔑 ꜱᴇꜱꜱɪᴏɴ ᴄʜᴀʀɢᴇ́ᴇ.');
    } catch (e) { console.error('❌ Session Error:', e.message); }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // Désactivé
    browser: ["Ubuntu", "Chrome", "20.0.04"], // Format recommandé pour le pairing
    auth: state,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false
  });

  // --- LOGIQUE PAIRING CODE UNIQUEMENT ---
  if (!sock.authState.creds.registered) {
    // On récupère le numéro depuis la config (ex: 22651622652)
    const cleanNumber = String(config.supremeNumber || config.OWNER_NUMBER || "22651622652").replace(/\D/g, '');
    
    if (cleanNumber) {
        console.log(`\n[ ⚡ GHOSTG-X ]`);
        console.log(`⏳ GÉNÉRATION DU CODE POUR : ${cleanNumber}...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n╔════════════════════════════════════╗`);
                console.log(`║      VOTRE CODE DE JUMELAGE :      ║`);
                console.log(`║          > ${code} <          ║`);
                console.log(`╚════════════════════════════════════╝\n`);
                console.log(`👉 Entrez ce code sur votre WhatsApp (Appareils connectés > Jumeler avec un numéro)\n`);
            } catch (err) { 
                console.error('❌ Erreur Pairing:', err.message); 
            }
        }, 3000); // Délai de 3s pour laisser la socket s'initialiser
    } else {
        console.log("❌ Erreur : Aucun numéro configuré pour le pairing code.");
    }
  }

  // --- MISE À JOUR DE LA CONNEXION ---
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    // Note : On a retiré la vérification "if (qr)" ici pour ne pas polluer le terminal

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('\n✅ ɢʜᴏꜱᴛɢ-x CONNECTÉ AVEC SUCCÈS !');
      // ... reste de ton code ...
    }
  });


      try {
        const { loadCommands } = require('./utils/commandLoader');
        const totalCmds = loadCommands().size;
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerNumber = "22651622652";

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

  // --- LOGIQUE DE RÉPONSE AMÉLIORÉE ---
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    const now = Date.now();
    for (const msg of messages) {
      try {
        if (!msg.message || !msg.key?.id) continue;

        // On récupère le texte du message
        const getText = (msg) => {
  return msg?.conversation ||
         msg?.extendedTextMessage?.text ||
         msg?.imageMessage?.caption ||
         msg?.videoMessage?.caption ||
         msg?.buttonsResponseMessage?.selectedButtonId ||
         msg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
         msg?.templateButtonReplyMessage?.selectedId ||
         "";
};

const text = getText(msg.message);

        const isCommand = text.startsWith(config.prefix);

        // RÉPARATION CRITIQUE : Autorise tes propres commandes mais ignore tes discussions normales
        if (msg.key.fromMe && !isCommand) continue;

        const msgTime = (msg.messageTimestamp || 0) * 1000;
        if (msgTime && (now - msgTime > 30000)) continue;

        if (processedMessages.has(msg.key.id)) continue;
        processedMessages.add(msg.key.id);

        handler.handleMessage(sock, msg).catch((err) => {
          console.error('❌ Handler Error:', err);
        });
      } catch (e) { console.error('❌ Upsert Loop Error:', e); }
    }
  });

  sock.ev.on('group-participants.update', (u) => handler.handleGroupUpdate(sock, u));
  return sock;
}

cleanupPuppeteerCache();
startBot().catch(err => console.error('❌ Erreur Critique:', err));

process.on('uncaughtException', (err) => {
    if (!err.message.includes('ENOSPC')) console.error('Uncaught:', err);
});

module.exports = { store };
