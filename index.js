/**
 * GhostG-X Bot - Main Entry Point
 * Optimized for Pairing Code, Mobile Stability & Anti-Lag
 * Supreme Edition - GhostG X
 */
process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer_cache_disabled';

const { initializeTempSystem } = require('./utils/tempManager');
const { startCleanup } = require('./utils/cleanup');
initializeTempSystem();
startCleanup();

// --- FILTRAGE DES LOGS CONSOLE (NETTOYAGE) ---
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const forbiddenPatternsConsole = [
  'closing session', 'closing open session', 'sessionentry', 'prekey bundle',
  'pendingprekey', '_chains', 'registrationid', 'currentratchet', 'chainkey',
  'ratchet', 'signal protocol', 'ephemeralkeypair', 'indexinfo', 'basekey'
];
const sock = makeWASocket({
    // ... tes autres options
    keepAliveIntervalMs: 30000, // Garde la connexion active toutes les 30s
    defaultQueryTimeoutMs: undefined,
    connectTimeoutMs: 60000,
});


const filterLogs = (args, originalFn) => {
  const message = args.map(a => typeof a === 'string' ? a : typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').toLowerCase();
  if (!forbiddenPatternsConsole.some(pattern => message.includes(pattern))) {
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
    const home = os.homedir();
    const cacheDir = path.join(home, '.cache', 'puppeteer');
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
  },
  loadMessage: async (jid, id) => store.messages.get(jid)?.get(id) || null
};

const processedMessages = new Set();
setInterval(() => processedMessages.clear(), 5 * 60 * 1000);

// --- DÉMARRAGE DU BOT ---
async function startBot() {
  const sessionFolder = `./${config.sessionName}`;

  // Gestion SessionID
  if (config.sessionID && (config.sessionID.startsWith('GhostG-X!') || config.sessionID.startsWith('KnightBot!'))) {
    try {
      const b64data = config.sessionID.split('!')[1];
      if (b64data) {
        const compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
        const decompressedData = zlib.gunzipSync(compressedData);
        if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });
        fs.writeFileSync(path.join(sessionFolder, 'creds.json'), decompressedData, 'utf8');
        console.log('📡 ꜱᴇꜱꜱɪᴏɴ : 🔑 ꜱᴇꜱꜱɪᴏɴ ᴄʜᴀʀɢᴇ́ᴇ ᴀᴠᴇᴄ ꜱᴜᴄᴄᴇ̀ꜱ.');
      }
    } catch (e) { console.error('📡 ꜱᴇꜱꜱɪᴏɴ : ❌ ᴇʀʀᴇᴜʀ :', e.message); }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    auth: state,
    syncFullHistory: false,      // Désactive l'historique ancien
    downloadHistory: false,    // Désactive le téléchargement auto
    shouldSyncHistoryMessage: () => false, // Bloque la synchro des vieux messages
    getMessage: async () => undefined 
  });

  // --- PAIRING CODE ---
  if (!sock.authState.creds.registered) {
    let rawNumber = config.supremeNumber || config.OWNER_NUMBER;
    if (Array.isArray(rawNumber)) rawNumber = rawNumber[0];
    const cleanNumber = String(rawNumber).replace(/[^0-9]/g, '');

    if (cleanNumber) {
        console.log(`\n⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ ꜰᴏʀ : ${cleanNumber}...`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n╔════════════════════════════════════╗\n║      ᴠᴏᴛʀᴇ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ :      ║\n║          ${code}          ║\n╚════════════════════════════════════╝\n`);
            } catch (err) { console.error('❌ ᴇʀʀᴇᴜʀ ᴘᴀɪʀɪɴɢ:', err.message); }
        }, 3000);
    }
  }

  store.bind(sock.ev);

  // --- CONNEXION UPDATE ---
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !config.OWNER_NUMBER) {
      console.log('\n📱 ꜱᴄᴀɴ ᴄᴇ Qʀ ᴄᴏᴅᴇ :\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('\n✅ ɢʜᴏꜱᴛɢ-x ᴄᴏɴɴᴇᴄᴛᴇ́ !');
      handler.initializeAntiCall(sock);

      // NOTIFICATION INBOX (IMAGE + INFOS)
      try {
        const { loadCommands } = require('./utils/commandLoader');
        const cmdCount = loadCommands().size;
        const supremeJid = config.supremeNumber.replace(/\D/g, '') + '@s.whatsapp.net';

        const welcomeCaption = `╭╼━≪• ɢʜᴏꜱᴛɢ-x ɪꜱ ᴀʟɪᴠᴇ •≫━╾╮
┃ ꜱᴛᴀᴛᴜꜱ : 🟢 ᴏɴʟɪɴᴇ
┃ ᴍᴀɪᴛʀᴇ : @${config.supremeNumber}
┃ ᴘʀᴇꜰɪx : [ ${config.prefix} ]
┃ ᴄᴍᴅꜱ : ${cmdCount} ꜰɪʟᴇꜱ
┃ ᴍᴏᴅᴇ : ${config.selfMode ? '🔒 ᴘʀɪᴠé' : '🌐 ᴘᴜʙʟɪᴄ'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

❓ *ᴘᴏᴜʀ ᴛᴇꜱ ǫᴜᴇꜱᴛɪᴏɴꜱ :*

📢 *ᴄʜᴀîɴᴇ ᴡʜᴀᴛꜱᴀᴘᴘ :*
https://whatsapp.com/channel/0029VbCFj3oKbYMVXaqyHq3c

👥 *ɢʀᴏᴜᴘᴇ ᴅ'ᴀꜱꜱɪꜱᴛᴀɴᴄᴇ :*
${config.social.group}


💻 *ᴅᴇ́ᴠᴇʟᴏᴘᴘᴇᴜʀ :* wa.me/${config.supremeNumber.replace(/\D/g, '')}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ -ɢʜᴏꜱᴛɢ x`;

        await sock.sendMessage(supremeJid, { 
            image: { url: 'https://files.catbox.moe/2fmwpu.jpg' }, 
            caption: welcomeCaption, 
            mentions: [supremeJid] 
        });
      } catch (err) { console.error('❌ Notification Error:', err.message); }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // --- MESSAGES UPSERT (AVEC FILTRE ANTI-LAG) ---
  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || processedMessages.has(msg.key.id)) continue;
      processedMessages.add(msg.key.id);

      // FILTRE ANTI-LAG (IGNORER SI > 30 SECONDES)
      const now = Math.floor(Date.now() / 1000);
      if (now - msg.messageTimestamp > 30) continue;

      handler.handleMessage(sock, msg).catch(() => {});
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handler.handleGroupUpdate(sock, update);
  });

  return sock;
}

cleanupPuppeteerCache();
startBot().catch(err => console.error('ᴇʀʀᴇᴜʀ ᴄʀɪᴛɪǫᴜᴇ:', err));

process.on('uncaughtException', (err) => {
    if (!err.message.includes('ENOSPC')) console.error(err);
});

module.exports = { store };
